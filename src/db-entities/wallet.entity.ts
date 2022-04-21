import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

export enum BlockchainNetwork {
    // ETH = "ETH",
    ETH_ROPSTEN = "ropETH",
    // ETH_RINKEBY = "rinkETH",
    // ETH_GOERLI = "gETH",
    // BTC = "BTC",
    // BTC_TESTNET = "tBTC",
    // XRP = "XRP",
    // ADA = "ADA",
    DEFAULT = "INVALID"
}

export enum BlockchainTypeCategory {
    EVM = "EVM", // ETH Like addresses
    // BTC = "BTC",
    // BTC_TESTNET = "tBTC",
    // XRP = "XRP",
    // ADA = "ADA",
    DEFAULT = "INVALID"
}

export enum HDDerivationScheme {
    BIP44 = "BIP44",
    BIP32 = "BIP32",
    BIP49 = "BIP49"
}

@Entity()
@Unique(['userId', 'derivationPathIndex'])
export class UserWallet {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: number;

    @Column()
    publicAddress: string;

    @Column({ default: false })
    isActive: boolean;

    @Column({
        type: 'enum',
        enum: BlockchainTypeCategory,
        default: BlockchainTypeCategory.DEFAULT
    })
    blockchainCategory: BlockchainTypeCategory;

    @Column()
    derivationPathIndex: number;

    @Column({
        type: 'enum',
        enum: HDDerivationScheme,
        default: HDDerivationScheme.BIP44
    })
    derivationScheme: HDDerivationScheme;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}