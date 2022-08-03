import {MigrationInterface, QueryRunner} from "typeorm";

export class civilizationGameInit1656059378802 implements MigrationInterface {
    name = 'civilizationGameInit1656059378802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Civilization_User" ("id" SERIAL NOT NULL, "role" integer, "balance" integer NOT NULL DEFAULT '0', "user_id" integer, CONSTRAINT "REL_e6dcb9221f551c1ebd3e0b8a5b" UNIQUE ("user_id"), CONSTRAINT "PK_a17c2159a2685acec1ecdf2ce76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Civilization_Cave_Citizens" ("id" SERIAL NOT NULL, "nft_id" integer NOT NULL, "last_citizen_payment_date" TIMESTAMP, "last_revenue_collection_date" TIMESTAMP, "caveId" integer, "citizenId" integer, CONSTRAINT "PK_4cfa3e189a393c9a356c8b38c9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Civilization_Cave" ("id" SERIAL NOT NULL, "segmentId" integer, CONSTRAINT "PK_7b9f201a713eac737bcda07bbca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Civilization_Segment" ("id" SERIAL NOT NULL, "last_owner_payment_date" TIMESTAMP, "segment_id" integer, CONSTRAINT "REL_67b0594cd58d81ea0fb0e06a40" UNIQUE ("segment_id"), CONSTRAINT "PK_e00bc063cc03fee426de9efcc3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "nft_segment" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" DROP CONSTRAINT "FK_87e031fa9333eb1df261efd4600"`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" ADD CONSTRAINT "UQ_87e031fa9333eb1df261efd4600" UNIQUE ("segment_id")`);
        await queryRunner.query(`ALTER TABLE "socials" DROP CONSTRAINT "FK_29083db218aae74c09bb92f939a"`);
        await queryRunner.query(`ALTER TABLE "socials" ADD CONSTRAINT "UQ_29083db218aae74c09bb92f939a" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" ADD CONSTRAINT "FK_87e031fa9333eb1df261efd4600" FOREIGN KEY ("segment_id") REFERENCES "nft_segment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "socials" ADD CONSTRAINT "FK_29083db218aae74c09bb92f939a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Civilization_User" ADD CONSTRAINT "FK_e6dcb9221f551c1ebd3e0b8a5b8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" ADD CONSTRAINT "FK_5c67ae4e7d065c2b8fe684be255" FOREIGN KEY ("caveId") REFERENCES "Civilization_Cave"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" ADD CONSTRAINT "FK_aafed06c64a16ab85c5d09c63d1" FOREIGN KEY ("citizenId") REFERENCES "Civilization_User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave" ADD CONSTRAINT "FK_b0331fd690c86f29969c973c385" FOREIGN KEY ("segmentId") REFERENCES "Civilization_Segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Civilization_Segment" ADD CONSTRAINT "FK_67b0594cd58d81ea0fb0e06a40d" FOREIGN KEY ("segment_id") REFERENCES "nft_segment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_segment" ADD CONSTRAINT "FK_82b206d1bbd73cd4e0246b79cd9" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nft_segment" DROP CONSTRAINT "FK_82b206d1bbd73cd4e0246b79cd9"`);
        await queryRunner.query(`ALTER TABLE "Civilization_Segment" DROP CONSTRAINT "FK_67b0594cd58d81ea0fb0e06a40d"`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave" DROP CONSTRAINT "FK_b0331fd690c86f29969c973c385"`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" DROP CONSTRAINT "FK_aafed06c64a16ab85c5d09c63d1"`);
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" DROP CONSTRAINT "FK_5c67ae4e7d065c2b8fe684be255"`);
        await queryRunner.query(`ALTER TABLE "Civilization_User" DROP CONSTRAINT "FK_e6dcb9221f551c1ebd3e0b8a5b8"`);
        await queryRunner.query(`ALTER TABLE "socials" DROP CONSTRAINT "FK_29083db218aae74c09bb92f939a"`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" DROP CONSTRAINT "FK_87e031fa9333eb1df261efd4600"`);
        await queryRunner.query(`ALTER TABLE "socials" DROP CONSTRAINT "UQ_29083db218aae74c09bb92f939a"`);
        await queryRunner.query(`ALTER TABLE "socials" ADD CONSTRAINT "FK_29083db218aae74c09bb92f939a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" DROP CONSTRAINT "UQ_87e031fa9333eb1df261efd4600"`);
        await queryRunner.query(`ALTER TABLE "nft_segment_meta" ADD CONSTRAINT "FK_87e031fa9333eb1df261efd4600" FOREIGN KEY ("segment_id") REFERENCES "nft_segment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nft_segment" DROP COLUMN "ownerId"`);
        await queryRunner.query(`DROP TABLE "Civilization_Segment"`);
        await queryRunner.query(`DROP TABLE "Civilization_Cave"`);
        await queryRunner.query(`DROP TABLE "Civilization_Cave_Citizens"`);
        await queryRunner.query(`DROP TABLE "Civilization_User"`);
    }

}
