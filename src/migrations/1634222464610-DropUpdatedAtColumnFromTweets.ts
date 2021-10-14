import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUpdatedAtColumnFromTweets1634222464610
  implements MigrationInterface
{
  name = 'DropUpdatedAtColumnFromTweets1634222464610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tweets" DROP COLUMN "updated_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
