import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRetweets1634209824804 implements MigrationInterface {
  name = 'CreateRetweets1634209824804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_replies_tweets" ("user_id" uuid NOT NULL, "tweet_id" uuid NOT NULL, CONSTRAINT "PK_8fcdbda28d821bca845c8a1f40d" PRIMARY KEY ("user_id", "tweet_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2af59e43e0435d99d8acf01585" ON "users_replies_tweets" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f766a68883da7f23e568797fc" ON "users_replies_tweets" ("tweet_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users_replies_tweets" ADD CONSTRAINT "FK_2af59e43e0435d99d8acf01585d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_replies_tweets" ADD CONSTRAINT "FK_1f766a68883da7f23e568797fc1" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_replies_tweets" DROP CONSTRAINT "FK_1f766a68883da7f23e568797fc1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_replies_tweets" DROP CONSTRAINT "FK_2af59e43e0435d99d8acf01585d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f766a68883da7f23e568797fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2af59e43e0435d99d8acf01585"`,
    );
    await queryRunner.query(`DROP TABLE "users_replies_tweets"`);
  }
}
