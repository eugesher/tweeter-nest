import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTweetLikes1634559508328 implements MigrationInterface {
  name = 'CreateTweetLikes1634559508328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tweet_likes" ("user_id" uuid NOT NULL, "tweet_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bfa998fb59334a5308ae2cc37c3" PRIMARY KEY ("user_id", "tweet_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tweet_likes" ADD CONSTRAINT "FK_a4242dd40869e106aceae558dbd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tweet_likes" ADD CONSTRAINT "FK_b08a22eba5b3c4b56e5666f44a6" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweet_likes" DROP CONSTRAINT "FK_b08a22eba5b3c4b56e5666f44a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tweet_likes" DROP CONSTRAINT "FK_a4242dd40869e106aceae558dbd"`,
    );
    await queryRunner.query(`DROP TABLE "tweet_likes"`);
  }
}
