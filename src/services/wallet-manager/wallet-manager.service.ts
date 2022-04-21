import { Injectable, Logger } from '@nestjs/common';
import { ethers } from "ethers";
import { BlockchainNetwork, BlockchainTypeCategory } from '../../db-entities/wallet.entity';

@Injectable()
export class WalletManagerService {

    private readonly logger = new Logger(WalletManagerService.name);

    // extended pubkey depth: 4 
    private readonly xPubKey = {
        ETH: 'xpub6EPfsDEAbHgy3po59DupCXxzo4bdhnE6eqYxzbgNmFtvLAJs3VWW7E5N3Ah14AyohMU3fNrm6oMXqZZ8nkZyii6yPLbhAXdBJ9CX1xqxCTA'
    };

    constructor() {
    }

    async deriveAddressAtPath(idx: number, blockchainCategory: BlockchainTypeCategory = BlockchainTypeCategory.EVM): Promise<string> {

        // Create a neutered HD Node
        const hdNode = ethers.utils.HDNode.fromExtendedKey(this.xPubKey.ETH)

        // Derive at `index` and return created address
        return hdNode.derivePath(idx.toString(10)).address;
    }

}
