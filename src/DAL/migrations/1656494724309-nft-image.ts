import {MigrationInterface, QueryRunner} from "typeorm";

export class nftImage1656494724309 implements MigrationInterface {
    name = 'nftImage1656494724309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" ADD "nft_image" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_Cave_Citizens" DROP COLUMN "nft_image"`);
    }

}
