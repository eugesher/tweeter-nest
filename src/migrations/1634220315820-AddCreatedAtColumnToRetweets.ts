import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtColumnToRetweets1634220315820
  implements MigrationInterface
{
  name = 'AddCreatedAtColumnToRetweets1634220315820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_2e06cfa5561e614951d2582916b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2e06cfa5561e614951d2582916"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_887b2fa6f899ad9e3499dea9cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_2e06cfa5561e614951d2582916b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" DROP CONSTRAINT "FK_2e06cfa5561e614951d2582916b"`,
    );
    await queryRunner.query(`ALTER TABLE "retweets" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_887b2fa6f899ad9e3499dea9cf" ON "retweets" ("tweet_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2e06cfa5561e614951d2582916" ON "retweets" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_887b2fa6f899ad9e3499dea9cf1" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "retweets" ADD CONSTRAINT "FK_2e06cfa5561e614951d2582916b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
