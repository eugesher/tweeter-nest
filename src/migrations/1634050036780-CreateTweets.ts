import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTweets1634050036780 implements MigrationInterface {
  name = 'CreateTweets1634050036780';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tweets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying NOT NULL, "image" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "author_id" uuid, CONSTRAINT "PK_19d841599ad812c558807aec76c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tweets" ADD CONSTRAINT "FK_6783f8d04acbff7ce2b2ee823f7" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tweets" DROP CONSTRAINT "FK_6783f8d04acbff7ce2b2ee823f7"`,
    );
    await queryRunner.query(`DROP TABLE "tweets"`);
  }
}
