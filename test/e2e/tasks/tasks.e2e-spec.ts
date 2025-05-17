import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';
import { AllExceptionsHttpFilter } from '../../../src/shared/exception-filters/all-exceptions-http.filter';

describe('Tasks E2E - Full Test Suite', () => {
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
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`TRUNCATE TABLE "tasks", "user_auth", "users" RESTART IDENTITY CASCADE`);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tasks ', () => {
    it('should create a task', async () => {
      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' });

      const userToken = loginRes.body.access_token;
      const userId = loginRes.body.userId;

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send(
          {
            title: 'Test Task',
            description: 'Task for E2E',
            userId: userId
          }
        );

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('admin should create a task for another user', async () => {
      const adminRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'admin', password: 'password' });

      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user2', password: 'password' });


      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin', password: 'password' });

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminLogin.body.access_token}`)
        .send({ title: 'Admin Task', description: 'Task by admin', userId: userRes.body.id });


      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
  })

  describe('GET /tasks', () => {
    it('should list tasks for user', async () => {
      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user1', password: 'password' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user1', password: 'password' });

      const userToken = loginRes.body.access_token;

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task 1', description: 'Task for E2E', userId: userRes.body.id});

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task 2', description: 'Another Task for E2E', userId: userRes.body.id});

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  })

  describe('PATCH /tasks', () => {
    it('should update task', async () => {
      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user4', password: 'password' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user4', password: 'password' });

      const userToken = loginRes.body.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task to Update', description: 'Update this task', userId: userRes.body.id });

      const taskId = taskRes.body.id;

      const updateRes = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Task', completed: true });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('Updated Task');
      expect(updateRes.body.completed).toBe(true);
    });

    it('admin should delete task for another user', async () => {
      const adminRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'admin2', password: 'password' });

      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user5', password: 'password' });

      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin2', password: 'password' });

      const adminToken = adminLogin.body.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Task', description: 'Task to be deleted', userId: userRes.body.id });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);
    });
  })

  describe('DELETE /tasks', () => {
    it('should delete task', async () => {
      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user4', password: 'password' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'user4', password: 'password' });

      const userToken = loginRes.body.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Task to Update', description: 'Update this task', userId: userRes.body.id });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId: userRes.body.id });

      expect(deleteRes.status).toBe(204);
    });

    it('admin should delete task for another user', async () => {
      const adminRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'admin2', password: 'password' });

      const userRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'user4', password: 'password' });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'admin2', password: 'password' });

      const adminToken = loginRes.body.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Task to Update', description: 'Update this task', userId: userRes.body.id });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: userRes.body.id });

      expect(deleteRes.status).toBe(204);
    });
  })
});




