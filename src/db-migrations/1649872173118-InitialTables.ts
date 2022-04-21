import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";
import { BlockchainTypeCategory, HDDerivationScheme } from '../db-entities/wallet.entity';

export class InitialTables1649872173118 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userTable = new Table({
            name: 'User',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                // {
                //     name: 'username',
                //     type: 'enum',
                //     enumName: 'PlatformTypeEnum',
                //     enum: [PlatformType.DISCORD_CDC],
                //     default: "'DISCORD_CDC'",
                // },
                {
                    name: 'username',
                    type: 'varchar',
                },
                {
                    name: 'passwordHash',
                    type: 'varchar',
                },
                {
                    name: 'isActive',
                    type: 'boolean',

                },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        });
        const walletsTable = new Table({
            name: 'UserWallet',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'userId',
                    type: 'integer',
                },
                {
                    name: 'publicAddress',
                    type: 'varchar',
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                    default: false

                },
                {
                    name: 'blockchainCategory',
                    type: 'enum',
                    enumName: 'BlockchainTypeCategoryEnums',
                    enum: [
                        BlockchainTypeCategory.EVM,
                        // BlockchainTypeCategory.BTC,
                        BlockchainTypeCategory.DEFAULT
                    ],
                    default: "'INVALID'",
                },
                {
                    name: 'derivationPathIndex',
                    type: 'integer',
                    default: -1

                },
                {
                    name: 'derivationScheme',
                    type: 'enum',
                    enumName: 'HDDerivationSchemeEnum',
                    enum: [
                        HDDerivationScheme.BIP44,
                        HDDerivationScheme.BIP32,
                        HDDerivationScheme.BIP49,

                    ],
                    default: "'BIP44'",
                },
                {
                    name: 'createdAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamptz',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        });

        // Enable uuid_generate_v4() func
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.createTable(userTable, true);
        await queryRunner.createTable(walletsTable, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable('UserWallet', true);
        await queryRunner.dropTable('User', true);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);

    }

}
