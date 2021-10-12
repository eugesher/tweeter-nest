import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDeletedAtColumnFromUsers1634029210607
  implements MigrationInterface
{
  name = 'DropDeletedAtColumnFromUsers1634029210607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
  }
}
