import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameRepliesRelationToRetweet1634217573908
  implements MigrationInterface
{
  name = 'RenameRepliesRelationToRetweet1634217573908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" RENAME COLUMN "replies_count" TO "retweets_count"`,
    );
    await queryRunner.query(
      `CREATE TABLE "retweets" ("user_id" uuid NOT NULL, "tweet_id" uuid NOT NULL, CONSTRAINT "PK_c2d5a1fdf055f5fcc7d0783df60" PRIMARY KEY ("user_id", "tweet_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e06cfa5561e614951d2582916" ON "retweets" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_887b2fa6f899ad9e3499dea9cf" ON "retweets" ("tweet_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_2e06cfa5561e614951d2582916b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_2e06cfa5561e614951d2582916b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_887b2fa6f899ad9e3499dea9cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e06cfa5561e614951d2582916"`,
    );
    await queryRunner.query(`DROP TABLE "retweets"`);
    await queryRunner.query(
      `ALTER TABLE "tweets" RENAME COLUMN "retweets_count" TO "replies_count"`,
    );
  }
}
