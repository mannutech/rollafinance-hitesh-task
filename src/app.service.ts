import { Injectable } from '@nestjs/common';
import { BlockchainNetwork } from './db-entities/wallet.entity';

@Injectable()
export class AppService {
  getSupportedBlockchainNetworks() {
    return {
      data: Object.values(BlockchainNetwork)
    };
  }
}
