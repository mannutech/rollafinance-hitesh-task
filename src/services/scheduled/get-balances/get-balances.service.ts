import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as indexerApi from "@tatumio/tatum";
import { Repository } from 'typeorm';
import { AssetType, UserBalance } from '../../../db-entities/balances.entity';
import { BlockchainNetwork, BlockchainTypeCategory, UserWallet } from '../../../db-entities/wallet.entity';
process.env.TATUM_API_KEY = "f747ee4e-8f1e-4d4d-a156-2f13fd5bb138";

@Injectable()
export class GetBalancesService {
    private logger = new Logger(GetBalancesService.name);

    constructor(
        @InjectRepository(UserBalance) private userBalancesRepo: Repository<UserBalance>,
    ) {

    }

    async fetchAndUpdateBalanceByAddress(publicAddress: string) {
        // Asyncronously fetching balance from the blockchain indexing api
        indexerApi
            .ethGetAccountBalance(publicAddress)
            .then((ethBalance: any) => {
                this.logger.debug(`[fetchAndUpdateBalanceByAddress] ${publicAddress} --> ${ethBalance.balance}`);
                // Update new balance in the database | calling it asynchronously without `awaiting`
                this.upsertNativeBalanceForAddress(publicAddress, ethBalance.balance);
            })
            .catch(e => {
                this.logger.debug(`[fetchAndUpdateBalanceByAddress]`, e)
                // For now ignore
                this.logger.error(`[fetchAndUpdateBalanceByAddress] Couldnt fetch balance for ${publicAddress} | Reason: ${JSON.stringify(e)}`);
            });

    }

    async fetchAndUpdateERC20BalanceByAddress(publicAddress: string, contractAddress: string) {
        // Asyncronously fetching balance from the blockchain indexing api
        indexerApi
            .ethGetAccountErc20Address(publicAddress, contractAddress)
            .then(erc20Balance => {
                this.logger.debug(`[fetchAndUpdateERC20BalanceByAddress] ${publicAddress} --> ${erc20Balance.balance}`);
                // Update new balance in the database | calling it asynchronously without `awaiting`
                this.upsertERC20BalanceForAddress(publicAddress, erc20Balance.balance.toString(), contractAddress);
            })
            .catch(e => {
                // For now ignore
                this.logger.error(`[fetchAndUpdateERC20BalanceByAddress] Couldnt fetch balance for ${publicAddress} | Reason: ${JSON.stringify(e)}`);
            });

    }

    /**
     * Updates/inserts native balance for an address
     * @param address 
     * @param balanceInString 
     */
    private async upsertNativeBalanceForAddress(
        address: string,
        balanceInString: string,
        network: BlockchainNetwork = BlockchainNetwork.ETH_ROPSTEN // Because the indexer api uses ropsten
    ) {
        this.logger.log(`[upsertNativeBalanceForAddress] updating address balance {${address}, ${balanceInString}}.`);

        // Todo: Can be optimised as batch insert to db
        this.userBalancesRepo
            .upsert({
                address,
                balanceInString: balanceInString,
                assetType: AssetType.NATIVE,
                network: network // Hardcoded because of indexing service network
            },
                {
                    conflictPaths: ['address', 'contractAddress', 'network', 'assetType'],
                    skipUpdateIfNoValuesChanged: true
                })
            .then(updateResult => {
                this.logger.log(`[upsertNativeBalanceForAddress] Successfully upserted balance ${balanceInString} for address ${address}. Results: ${JSON.stringify(updateResult)}`);
            })
            .catch(err => {
                this.logger.error(`[upsertNativeBalanceForAddress] Error updating balance for address ${address}`);
            });
    }

    /**
     * Updates/inserts ERC20 balance for an address
     * @param address 
     * @param balanceInString 
     * @param contractAddress 
     * @param network 
     */
    private async upsertERC20BalanceForAddress(
        address: string,
        balanceInString: string,
        contractAddress: string,
        network: BlockchainNetwork = BlockchainNetwork.ETH_ROPSTEN // Because the indexer api uses ropsten
    ) {
        this.logger.log(`[upsertERC20BalanceForAddress] updating address balance {${address}, ${balanceInString}}.`);

        // Todo: Can be optimised as batch insert to db
        this.userBalancesRepo
            .upsert({
                address,
                balanceInString: balanceInString,
                assetType: AssetType.TOKEN,
                contractAddress,
                network: network // Hardcoded because of indexing service network
            }, {
                conflictPaths: ['address', 'contractAddress', 'network', 'assetType'],
                skipUpdateIfNoValuesChanged: true
            })
            .then(updateResult => {
                this.logger.log(`[upsertERC20BalanceForAddress] Successfully upserted balance ${balanceInString} for address ${address}. Results: ${JSON.stringify(updateResult)}`);
            })
            .catch(err => {
                this.logger.error(`[upsertERC20BalanceForAddress] Error updating balance for address ${address}`);
            });
    }


}
