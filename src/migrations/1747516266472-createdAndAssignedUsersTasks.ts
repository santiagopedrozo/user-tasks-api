import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedAndAssignedUsersTasks1747516266472
  implements MigrationInterface
{
  name = 'CreatedAndAssignedUsersTasks1747516266472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_166bd96559cb38595d392f75a35"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "assignedUserId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdByUserId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" DROP CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ALTER COLUMN "userId" SET NOT NULL`,
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
      `ALTER TABLE "user_auth" ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth" ADD CONSTRAINT "FK_52403f2133a7b1851d8ab4dc9db" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN "createdByUserId"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "assignedUserId"`);
    await queryRunner.query(`ALTER TABLE "tasks" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_166bd96559cb38595d392f75a35" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
