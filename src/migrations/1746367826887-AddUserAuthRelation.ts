import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAuthRelation1746367826887 implements MigrationInterface {
  name = 'AddUserAuthRelation1746367826887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hashedRefreshToken" character varying, "refreshTokenJti" character varying, "lastLoginAt" TIMESTAMP, "tokenExpiresAt" TIMESTAMP, "userId" uuid, CONSTRAINT "REL_52403f2133a7b1851d8ab4dc9d" UNIQUE ("userId"), CONSTRAINT "PK_56d00ec31dc3eed1c3f6bff4f58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "hashedRefreshToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_auth" DROP CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "hashedRefreshToken" character varying`,
    );
    await queryRunner.query(`DROP TABLE "user_auth"`);
  }
}
