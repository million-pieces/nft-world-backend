import {MigrationInterface, QueryRunner} from "typeorm";

export class init1653647157779 implements MigrationInterface {
    name = 'init1653647157779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lands_for_sale" ("id" SERIAL NOT NULL, "country" character varying NOT NULL, "coordinates" character varying NOT NULL, "price" numeric(12,4) NOT NULL, "link" character varying NOT NULL, "picture" character varying NOT NULL, CONSTRAINT "PK_051a4c051992f7996680a9fd310" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_segment_meta" ("country" character varying NOT NULL, "artwork" character varying NOT NULL, "image" character varying NOT NULL, "segment_id" integer NOT NULL, CONSTRAINT "REL_87e031fa9333eb1df261efd460" UNIQUE ("segment_id"), CONSTRAINT "PK_87e031fa9333eb1df261efd4600" PRIMARY KEY ("segment_id"))`);
        await queryRunner.query(`CREATE TABLE "nft_segment" ("id" integer NOT NULL, "coordinates" character varying NOT NULL, "site_url" character varying, "image" character varying, "image_mini" character varying, "merged_segment_id" integer, CONSTRAINT "PK_994e751422c532fcf4ddc36c0cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "merged_segment" ("id" SERIAL NOT NULL, "image_mini" character varying, "image" character varying, "site_url" character varying, "top_left" character varying NOT NULL, "bottom_right" character varying NOT NULL, CONSTRAINT "PK_421f1a0ae2bc22f801c534c96b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nft_world" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "date" TIMESTAMP NOT NULL, CONSTRAINT "PK_fc4f61d8952853fda77a2d83ed8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "avatar" character varying NOT NULL DEFAULT '', "username" character varying NOT NULL DEFAULT '', "wallet_address" character varying NOT NULL DEFAULT '', "nonce" integer NOT NULL DEFAULT '0', "claimable_tokens" integer NOT NULL DEFAULT '0', "piece_balance" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "population_id" integer, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "population" ("id" SERIAL NOT NULL, "total_owners" integer NOT NULL, "emperors" integer NOT NULL, "imperialists" integer NOT NULL, "conquerors" integer NOT NULL, "lords" integer NOT NULL, "settlers" integer NOT NULL, "landowners" integer NOT NULL, CONSTRAINT "PK_1cedb69330ebde5aee2cdc9bda4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "segment_image_log" ("id" SERIAL NOT NULL, "image" character varying, "action" integer NOT NULL, "wallet_address" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87f1c35e54b45e2f122abd327b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "socials" ("facebook" character varying NOT NULL DEFAULT '', "linkedin" character varying NOT NULL DEFAULT '', "instagram" character varying NOT NULL DEFAULT '', "twitter" character varying NOT NULL DEFAULT '', "discord" character varying NOT NULL DEFAULT '', "telegram" character varying NOT NULL DEFAULT '', "user_id" integer NOT NULL, CONSTRAINT "REL_29083db218aae74c09bb92f939" UNIQUE ("user_id"), CONSTRAINT "PK_29083db218aae74c09bb92f939a" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "segment_image_log_segments_nft_segment" ("segmentImageLogId" integer NOT NULL, "nftSegmentId" integer NOT NULL, CONSTRAINT "PK_d7dd89c76422614a98e29a4a5c6" PRIMARY KEY ("segmentImageLogId", "nftSegmentId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c497ff8c49ef42cb9be978a240" ON "segment_image_log_segments_nft_segment" ("segmentImageLogId") `);
        await queryRunner.query(`CREATE INDEX "IDX_aac104dc43eda1eff5327779c2" ON "segment_image_log_segments_nft_segment" ("nftSegmentId") `);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" ADD CONSTRAINT "FK_87e031fa9333eb1df261efd4600" FOREIGN KEY ("segment_id") REFERENCES "nft_segment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_segment" ADD CONSTRAINT "FK_9be9afa7a774d32523e1087e668" FOREIGN KEY ("merged_segment_id") REFERENCES "merged_segment"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_841183a0029a47ef25035b910c2" FOREIGN KEY ("population_id") REFERENCES "population"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "socials" ADD CONSTRAINT "FK_29083db218aae74c09bb92f939a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "segment_image_log_segments_nft_segment" ADD CONSTRAINT "FK_c497ff8c49ef42cb9be978a2408" FOREIGN KEY ("segmentImageLogId") REFERENCES "segment_image_log"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "segment_image_log_segments_nft_segment" ADD CONSTRAINT "FK_aac104dc43eda1eff5327779c2d" FOREIGN KEY ("nftSegmentId") REFERENCES "nft_segment"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "segment_image_log_segments_nft_segment" DROP CONSTRAINT "FK_aac104dc43eda1eff5327779c2d"`);
        await queryRunner.query(`ALTER TABLE "segment_image_log_segments_nft_segment" DROP CONSTRAINT "FK_c497ff8c49ef42cb9be978a2408"`);
        await queryRunner.query(`ALTER TABLE "socials" DROP CONSTRAINT "FK_29083db218aae74c09bb92f939a"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_841183a0029a47ef25035b910c2"`);
        await queryRunner.query(`ALTER TABLE "nft_segment" DROP CONSTRAINT "FK_9be9afa7a774d32523e1087e668"`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" DROP CONSTRAINT "FK_87e031fa9333eb1df261efd4600"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aac104dc43eda1eff5327779c2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c497ff8c49ef42cb9be978a240"`);
        await queryRunner.query(`DROP TABLE "segment_image_log_segments_nft_segment"`);
        await queryRunner.query(`DROP TABLE "socials"`);
        await queryRunner.query(`DROP TABLE "segment_image_log"`);
        await queryRunner.query(`DROP TABLE "population"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "nft_world"`);
        await queryRunner.query(`DROP TABLE "merged_segment"`);
        await queryRunner.query(`DROP TABLE "nft_segment"`);
        await queryRunner.query(`DROP TABLE "nft_segment_meta"`);
        await queryRunner.query(`DROP TABLE "lands_for_sale"`);
    }

}
