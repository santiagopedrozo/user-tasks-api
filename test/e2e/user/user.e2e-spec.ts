import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { AllExceptionsHttpFilter } from '../../../src/shared/exception-filters/all-exceptions-http.filter';
import * as cookieParser from 'cookie-parser';
import { UserRole } from '../../../src/users/entities/user.entity';
import { DataSource } from 'typeorm';

describe('Users E2E - Full Test Suite', () => {
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
    await dataSource.query(
      `TRUNCATE TABLE "user_auth" RESTART IDENTITY CASCADE`,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PATCH /user/:id/role', () => {
    it('should update user role by admin', async () => {
      const adminResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'admin', password: 'password' });

      expect(adminResult.status).toBe(201);

      const userResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user', password: 'password' });

      expect(userResult.status).toBe(201);

      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'password' })
        .expect(200);

      const resultUpdate = await request(app.getHttpServer())
        .patch(`/user/${userResult.body.id}/role`)
        .set('Authorization', `Bearer ${adminLogin.body.access_token}`)
        .send({ role: UserRole.ADMIN });

      expect(resultUpdate.status).toBe(200);
      expect(resultUpdate.body).toHaveProperty('id');
      expect(resultUpdate.body).toHaveProperty('role');
      expect(resultUpdate.body.role).toBe(UserRole.ADMIN);
    });

    it('should return 403 if non-admin tries to update role', async () => {
      const adminResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'admin', password: 'password' });

      expect(adminResult.status).toBe(201);

      const userResult = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user', password: 'password' });

      expect(userResult.status).toBe(201);

      const userLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user', password: 'password' })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/user/${userLogin.body.id}/role`)
        .set('Authorization', `Bearer ${userLogin.body.access_token}`)
        .send({ role: UserRole.ADMIN });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden resource');
    });
  });
});
