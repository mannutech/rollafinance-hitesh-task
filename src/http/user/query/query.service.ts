import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../../../db-entities/user.entity';
import { UserWallet, BlockchainNetwork, BlockchainTypeCategory } from '../../../db-entities/wallet.entity';
import { AssetType, UserBalance } from '../../../db-entities/balances.entity';
import * as indexerApi from "@tatumio/tatum";
process.env.TATUM_API_KEY = "f747ee4e-8f1e-4d4d-a156-2f13fd5bb138";

@Injectable()
export class UserQueryService {
    private readonly logger = new Logger(UserQueryService.name);

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(UserWallet)
        private walletRepo: Repository<UserWallet>,
        @InjectRepository(UserBalance)
        private userBalancesRepo: Repository<UserBalance>,

    ) {
    }

    async getUserDetailsByUserId(userId: number) {
        this.logger.log(`[getUserDetailsByUserId] Finding userId: ${userId}`);

        // Find a user by Id
        const userRecord = await this.userRepo.findOne({
            id: userId
        });

        if (!userRecord) {
            throw new NotFoundException(`User does not exist.`);
        }

        this.logger.log(`[getUserDetailsByUserId] Fetching wallet details for userId: ${userId}`);

        // Fetch all 
        const userWallets = await this.walletRepo.find({
            userId
        });

        this.logger.log(`[getUserDetailsByUserId] Fetched Wallet details for userId: ${userId} | Results: ${JSON.stringify(userWallets)}`);


        // Transform walletList payload
        const finalWalletList = userWallets.map(wallet => ({
            "depositAddress": wallet.publicAddress,
            "isActive": wallet.isActive,
            "blockchainCategory": wallet.blockchainCategory,
            "lastUpdatedAt": wallet.updatedAt
        }));

        const response = {
            data: {
                username: userRecord.username,
                userCreatedAt: userRecord.createdAt,
                wallets: finalWalletList,
            }
        };

        return response;

    }

    async getUsernameByUserId(userId: number) {

        // Find a single record for `userId`
        const userRecord = await this.userRepo.findOne({
            id: userId
        });

        // Return 404 if user not found
        if (!userRecord) {
            throw new NotFoundException(`User does not exist.`);
        }

        const response = {
            data: {
                username: userRecord.username,
            }
        };

        return response;

    }

    async getDepositAddressByUserId(userId: number, blockchainNetworkList?: BlockchainNetwork[]) {

        // Where userId = ${userId}
        let findQuery: any = { userId };

        if (blockchainNetworkList && blockchainNetworkList.length > 0) {
            // Fetch blockchain category
            // @Todo : Assuming category to be EVM
            findQuery.blockchainCategory = In([BlockchainTypeCategory.EVM]);
        }

        // Fetch all wallets assigned to `userId`
        const userWallets = await this.walletRepo.find(findQuery);

        // Transform response payload
        const walletList = userWallets.map((wallet) => {
            return {
                depositAddress: wallet.publicAddress,
                blockchainCategory: wallet.blockchainCategory
            }
        })

        // Non-paginated response
        const response = {
            data: {
                wallets: walletList,
            }
        };

        return response;

    }

    async getNativeBalanceByUserIdAndNetwork(userId: number, network?: BlockchainNetwork) {
        this.logger.log(`[getNativeBalanceByUserIdAndNetwork] Processing token balances for userId: ${userId}`);

        // Find a single record for `userId`
        const userWallet = await this.walletRepo.findOne({
            userId: userId,
            // @Todo: Dynamically derive a list of BlockchainTypeCategory from network provided
            blockchainCategory: In([BlockchainTypeCategory.EVM])
        });

        // Return 404 if user not found
        if (!userWallet) {
            throw new NotFoundException(`User does not exist.`);
        }

        const userBalance = await this.userBalancesRepo.findOne({
            address: userWallet.publicAddress,
            network: network ?? BlockchainNetwork.ETH_ROPSTEN,
            assetType: AssetType.NATIVE
        })

        this.logger.log(`[getNativeBalanceByUserIdAndNetwork] Fetched Native balances: ${JSON.stringify(userBalance)}`);

        const response = {
            data: {
                network: network ?? BlockchainNetwork.ETH_ROPSTEN,
                address: userWallet.publicAddress,
                balance: userBalance ? userBalance.balanceInString : '0'
            }
        };

        return response;

    }

    async getTokenBalanceByUserIdNetworkAndContractAddress(
        userId: number,
        network?: BlockchainNetwork,
        contractAddress?: string,
    ) {
        this.logger.log(`[getTokenBalanceByUserIdAndNetwork] Processing token balances for ${userId}, ${contractAddress}`);

        // Find a single record for `userId`
        const userWallet = await this.walletRepo.findOne({
            userId: userId,
            // @Todo: Dynamically derive a list of BlockchainTypeCategory from network provided
            blockchainCategory: In([BlockchainTypeCategory.EVM])
        });

        // Return 404 if user not found
        if (!userWallet) {
            throw new NotFoundException(`User does not exist.`);
        }

        let findQuery = {
            address: userWallet.publicAddress,
            assetType: AssetType.TOKEN
        };

        if (network) {
            findQuery['network'] = network;
        }

        if (contractAddress) {
            findQuery['contractAddress'] = contractAddress;
        }

        const tokenBalances = await this.userBalancesRepo.find(findQuery);

        this.logger.log(`[getTokenBalanceByUserIdAndNetwork] Fetched token balances: ${JSON.stringify(tokenBalances)}`);

        const response = {
            data: tokenBalances ? tokenBalances.map(tokenBalance => ({
                network: tokenBalance.network.toString(),
                address: tokenBalance.address,
                contractAddress: tokenBalance.contractAddress,
                balance: tokenBalance ? tokenBalance.balanceInString : '0'
            })) : []
        };

        return response;

    }
}
