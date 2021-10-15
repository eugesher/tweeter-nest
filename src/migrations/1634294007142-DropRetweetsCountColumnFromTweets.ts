import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRetweetsCountColumnFromTweets1634294007142
  implements MigrationInterface
{
  name = 'DropRetweetsCountColumnFromTweets1634294007142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" DROP COLUMN "retweets_count"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" ADD "retweets_count" integer NOT NULL DEFAULT '0'`,
    );
  }
}
