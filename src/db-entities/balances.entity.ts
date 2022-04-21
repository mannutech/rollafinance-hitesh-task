import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { BlockchainNetwork, UserWallet } from './wallet.entity';

export enum HDDerivationScheme {
    BIP44,
    BIP32,
    BIP49
}

export enum AssetType {
    NATIVE = "NATIVE",
    TOKEN = "TOKEN",
}


@Entity()
@Index(['address'])
@Index(['address', 'network'])
@Index(['address', 'contractAddress', 'network'])
@Unique(['address', 'contractAddress', 'network', 'assetType'])
export class UserBalance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    address: string;

    @Column({ default: '0' })
    balanceInString: string;

    @Column({
        nullable: true
    })
    symbol?: string;

    @Column({
        type: "enum",
        enum: BlockchainNetwork
    })
    network: BlockchainNetwork;

    @Column({
        type: "enum",
        enum: AssetType
    })
    assetType: AssetType;

    @Column({
        nullable: true
    })
    contractAddress?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}