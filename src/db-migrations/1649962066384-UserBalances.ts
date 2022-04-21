import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { BlockchainNetwork } from '../db-entities/wallet.entity';
import { AssetType } from '../db-entities/balances.entity';

export class UserBalances1649962066384 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userBalancesTable = new Table({
            name: 'UserBalance',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true
                },
                {
                    name: 'address',
                    type: 'varchar',
                },
                {
                    name: 'balanceInString',
                    type: 'varchar',
                    default: '0'
                },
                {
                    name: 'symbol',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'contractAddress',
                    type: 'varchar',
                    isNullable: true
                },
                {
                    name: 'network',
                    type: 'enum',
                    enumName: 'BlockchainNetworkEnum',
                    enum: [
                        // BlockchainNetwork.ETH,
                        // BlockchainNetwork.ETH_GOERLI,
                        // BlockchainNetwork.ETH_RINKEBY,
                        BlockchainNetwork.ETH_ROPSTEN,
                        // BlockchainNetwork.BTC_TESTNET,
                        // BlockchainNetwork.BTC,
                        BlockchainNetwork.DEFAULT,
                    ],
                    default: "'INVALID'",
                },
                {
                    name: 'assetType',
                    type: 'enum',
                    enumName: 'AssetTypeEnum',
                    enum: [
                        AssetType.NATIVE,
                        AssetType.TOKEN,
                    ],
                    default: "'NATIVE'",
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

        await queryRunner.createTable(userBalancesTable);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('UserBalance');
    }

}
