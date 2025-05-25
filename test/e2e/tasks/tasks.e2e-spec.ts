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

  let authedAdminUserBody;
  let authedNonAdminUserBody;

  async function setupUsers(app: INestApplication) {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'admin', password: 'password' });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'password' });

    authedAdminUserBody = adminLogin.body;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'user', password: 'password' });

    const nonAdminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user', password: 'password' });

    authedNonAdminUserBody = nonAdminLogin.body;
  }

  async function deleteUsers() {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `TRUNCATE TABLE "user_auth", "users" RESTART IDENTITY CASCADE`,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

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

    await setupUsers(app);
  });

  afterEach(async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `TRUNCATE TABLE "tasks" RESTART IDENTITY CASCADE`,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  });

  afterAll(async () => {
    await deleteUsers();
    await app.close();
  });

  describe('POST /tasks ', () => {
    it('admin should create a task for another user', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authedAdminUserBody.access_token}`)
        .send({
          title: 'Admin Task',
          description: 'Task by admin',
          userId: authedNonAdminUserBody.userId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('non admin shouldnt create a task for another user', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authedNonAdminUserBody.access_token}`)
        .send({
          title: 'Admin Task',
          description: 'Task by admin',
          userId: authedAdminUserBody.userId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /tasks', () => {
    it('admin should delete task for another user', async () => {
      const adminToken = authedAdminUserBody.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Task',
          description: 'Task to be deleted',
          userId: authedNonAdminUserBody.userId,
        });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(204);
    });

    it('non admin shouldnt delete task for another user', async () => {
      const adminToken = authedAdminUserBody.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Task',
          description: 'Task to be deleted',
          userId: authedNonAdminUserBody.userId,
        });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authedNonAdminUserBody.access_token}`);

      expect(deleteRes.status).toBe(403);
    });
  });

  describe('DELETE /tasks', () => {
    it('admin should delete task for another user', async () => {
      const adminToken = authedAdminUserBody.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Task to Update',
          description: 'Update this task',
          userId: authedNonAdminUserBody.userId,
        });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: authedNonAdminUserBody.userId });

      expect(deleteRes.status).toBe(204);
    });

    it('non admin shouldnt delete task for another user', async () => {
      const adminToken = authedAdminUserBody.access_token;

      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Task to Update',
          description: 'Update this task',
          userId: authedNonAdminUserBody.userId,
        });

      const taskId = taskRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authedNonAdminUserBody.access_token}`)
        .send({ userId: authedAdminUserBody.userId });

      expect(deleteRes.status).toBe(403);
    });
  });
});
