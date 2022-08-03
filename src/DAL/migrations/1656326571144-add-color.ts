import {MigrationInterface, QueryRunner} from "typeorm";

export class addColor1656326571144 implements MigrationInterface {
    name = 'addColor1656326571144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_User" ADD "color" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Civilization_User" DROP COLUMN "color"`);
    }

}
