import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBalance } from '../../../db-entities/balances.entity';
import { BlockchainTypeCategory, UserWallet } from '../../../db-entities/wallet.entity';
import * as indexerApi from '@tatumio/tatum';
import { GetBalancesService } from '../get-balances/get-balances.service';

const TRANSFER_SIGNATURE = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

@Injectable()
export class GetTransactionsService {
    private logger = new Logger(GetTransactionsService.name);
    private inMemoryTxnHistoryTable = new Map<string, indexerApi.EthTx[]>();

    constructor(
        @InjectRepository(UserBalance) private userBalancesRepo: Repository<UserBalance>,
        @InjectRepository(UserWallet) private walletRepo: Repository<UserWallet>,
        private readonly balanceUpdateService: GetBalancesService
    ) {

    }

    @Interval(30 * 1000)
    async fetchTransactionsForAllEVMAddresses() {
        this.logger.log(`[fetchTransactionsForAllEVMAddresses] Fetching all Wallets for txHistory.`);

        // Fetch all addresses
        const walletList = await this.walletRepo.find({
            blockchainCategory: BlockchainTypeCategory.EVM,
            isActive: true
        });

        this.logger.log(`[fetchTransactionsForAllEVMAddresses] Number of Wallets to fetch transactions: ${walletList.length}.`);

        if (!walletList || walletList.length < 1) {
            this.logger.log(`No address to watch.`);
            return;
        }


        walletList.forEach(wallet => {
            this.logger.log(`[fetchTransactionsForAllEVMAddresses] Fetching transactions for: ${wallet.publicAddress}.`);
            indexerApi
                .ethGetAccountTransactions(wallet.publicAddress)
                .then(ethTx => {

                    this.logger.log(`Fetched ${ethTx.length} transactions for address ${wallet.publicAddress}`);

                    // skipping pagination
                    // Store tx List to in-memory table
                    const updateTxHistoryResult = this.upsertTxHistoryForAddress(
                        wallet.publicAddress,
                        ethTx
                    );

                    if (updateTxHistoryResult.affectedCount > 0) {
                        this.logger.log(`Triggering balance update for address ${wallet.publicAddress}`);

                        // Trigger native balance update
                        this.balanceUpdateService.fetchAndUpdateBalanceByAddress(wallet.publicAddress);

                        // Trigger ERC20 balance update
                        updateTxHistoryResult.erc20ContractAddresses.forEach(contractAddress => {
                            this.balanceUpdateService.fetchAndUpdateERC20BalanceByAddress(wallet.publicAddress, contractAddress);
                        })
                    }
                })
        })
    }

    private upsertTxHistoryForAddress(address: string, txs: indexerApi.EthTx[]) {

        let erc20ContractAddresses = [];

        // If map doesn't contain address, initialise
        if (!this.inMemoryTxnHistoryTable.has(address)) {

            // Update in-memory txHistory
            this.inMemoryTxnHistoryTable.set(address, txs);

            // Get all ERC20 Token contract addresses
            erc20ContractAddresses = this.getContractAddressesFromTxList(txs);
            this.logger.log(`[upsertTxHistoryForAddress] Added ${txs.length} transactions to the txHistory of ${address}.`)
            return { affectedCount: txs.length, erc20ContractAddresses };
        }

        // Fetch all existing txs for an address
        const txHistory = this.inMemoryTxnHistoryTable.get(address);

        let newTxs: indexerApi.EthTx[] = [];
        txs.forEach(ethTx => {
            if (!txHistory.find((txRecord, idx) => txRecord.transactionHash === ethTx.transactionHash && txRecord.status === ethTx.status)) {
                // Add tx to the old list
                newTxs.push(ethTx);
                // this.logger.log(`[upsertTxHistoryForAddress] [${address}] 
                // Added to txHistory: {${ethTx.transactionHash}, ${ethTx.blockNumber}, ${ethTx.to}}`);
            }
        });

        // Update contract address list
        erc20ContractAddresses = this.getContractAddressesFromTxList(newTxs);

        // Update in memory txHistory 
        const newTxHistory = txHistory.concat(newTxs);
        this.inMemoryTxnHistoryTable.set(address, newTxHistory);

        this.logger.log(`[upsertTxHistoryForAddress] Added ${newTxs.length} transactions to the txHistory of ${address}.`)
        return { affectedCount: newTxs.length, erc20ContractAddresses }
    }

    private getContractAddressesFromTxList(txList: indexerApi.EthTx[]) {
        let erc20ContractAddresses = [];

        this.logger.log(`[getContractAddressesFromTxList] Extracting ERC20 Contract addresses from transaction.`)
        txList.forEach(tx => {

            if (
                tx.contractAddress === null // NOT CONTRACT CREATION
                &&
                tx.logs.length > 0 // Is a smart contract transaction
            ) {
                // Iterate through all log set
                tx.logs.forEach((log: any) => {
                    if (this._isERC20Log({ topics: log.topics })) {
                        erc20ContractAddresses.push(log.address);
                    }
                });
            }
        });

        this.logger.debug(`[getContractAddressesFromTxList] ERC20 ContractAddresses:  ${erc20ContractAddresses.length}`);
        return erc20ContractAddresses;
    }

    _isERC20Log(log: { topics: string[] }) {
        return (
            log.topics
            && log.topics[0] == TRANSFER_SIGNATURE
            && log.topics.length == 3 // index 0 is the signature, and then 2 indexed topics
        );

    }
}
