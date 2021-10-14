import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRepliesCountToTweets1634215454830
  implements MigrationInterface
{
  name = 'AddRepliesCountToTweets1634215454830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" ADD "replies_count" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tweets" DROP COLUMN "replies_count"`);
  }
}
