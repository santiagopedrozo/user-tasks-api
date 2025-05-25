import { MigrationInterface, QueryRunner } from 'typeorm';

export class MovedToNormalIdFromUUID1747713156759
  implements MigrationInterface
{
  name = 'MovedToNormalIdFromUUID1747713156759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_cf34ff7f1de7b973b7ad5f536de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_e3f6e0d1ae9286f293a2e0111fd"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assignedUserId"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "assignedUserId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "createdByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdByUserId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" DROP CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" DROP CONSTRAINT "REL_52403f2133a7b1851d8ab4dc9d"`,
    );
    await queryRunner.query(`ALTER TABLE "user_auth" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD "userId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD CONSTRAINT "UQ_52403f2133a7b1851d8ab4dc9db" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_cf34ff7f1de7b973b7ad5f536de" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_e3f6e0d1ae9286f293a2e0111fd" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_e3f6e0d1ae9286f293a2e0111fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_cf34ff7f1de7b973b7ad5f536de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" DROP CONSTRAINT "UQ_52403f2133a7b1851d8ab4dc9db"`,
    );
    await queryRunner.query(`ALTER TABLE "user_auth" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD CONSTRAINT "REL_52403f2133a7b1851d8ab4dc9d" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "createdByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdByUserId" uuid NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assignedUserId"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "assignedUserId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_e3f6e0d1ae9286f293a2e0111fd" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_cf34ff7f1de7b973b7ad5f536de" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
