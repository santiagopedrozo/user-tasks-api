import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { AllExceptionsHttpFilter } from '../../../src/shared/exception-filters/all-exceptions-http.filter';
import * as cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { UserRole } from '../../../src/users/entities/user.entity';

describe('Auth E2E - Full Test Suite', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsHttpFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(cookieParser());

    dataSource = moduleFixture.get(DataSource);

    await app.init();
  });

  afterEach(async () => {
    await dataSource.query(`TRUNCATE TABLE "tasks" RESTART IDENTITY CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
    await dataSource.query(`TRUNCATE TABLE "user_auth" RESTART IDENTITY CASCADE`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return role admin user on first user created and user role on second user', async () => {
      const adminResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({username: 'admin', password: 'password'});

      expect(adminResult.status).toBe(201);
      expect(adminResult.body).toHaveProperty('id');
      expect(adminResult.body).toHaveProperty('username');
      expect(adminResult.body).toHaveProperty('role');
      expect(adminResult.body.role).toBe(UserRole.ADMIN);

      const userResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({username: 'user', password: 'password'});

      expect(userResult.status).toBe(201);
      expect(userResult.body).toHaveProperty('id');
      expect(userResult.body).toHaveProperty('username');
      expect(userResult.body).toHaveProperty('role');
      expect(userResult.body.role).toBe(UserRole.USER);

    });

    it('should return 409 if user already exists', async () => {
      const adminResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({username: 'admin', password: 'password'});

      expect(adminResult.status).toBe(201);

      const userResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({username: 'admin', password: 'password1223'});

      expect(userResult.status).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should return access and refresh token for valid credentials', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' })
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refresh_token');
    });

    it('should return 403 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'invalid', password: 'invalid' })
        .expect(403);

      expect(response.body.message).toBeDefined();
    });

    it('should return a new refresh token on each login', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const firstLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' });

      const secondLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' });

      const firstCookie = firstLogin.headers['set-cookie'][0];
      const secondCookie = secondLogin.headers['set-cookie'][0];

      expect(firstCookie).not.toEqual(secondCookie);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should login and refresh token successfully', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' })
        .expect(200);

      const cookie = loginResponse.headers['set-cookie'];

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .expect(200);

      expect(refreshResponse.body.access_token).toBeDefined();
    });

    it('should return 401 when no refresh token cookie is provided', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should return 401 with an invalid/malformed refresh token', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' });

      const tamperedCookie = loginResponse.headers['set-cookie'][0].replace(
        /refresh_token=[^;]+/,
        'refresh_token=invalidtoken',
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', tamperedCookie)
        .expect(401);
    });

    it('should reject a refresh token signed with a different secret', async () => {
      const fakeToken = jwt.sign({ sub: 123 }, 'WRONG_SECRET', {
        expiresIn: '1h',
      });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', `refresh_token=${fakeToken}`)
        .expect(401);
    });

    it('should return 401 for expired refresh token', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' })
        .expect(200);

      const cookie = loginResponse.headers['set-cookie'];

      await new Promise((res) => setTimeout(res, 1500)); // make sure JWT_REFRESH_EXPIRES_IN=1s in .env.test

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);
    });

    it('should reject a refresh token that was already rotated', async () => {
      const userRegister = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' })
        .expect(200);

      const cookie = loginResponse.headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookie)
        .expect(403);
    });
  });
});
