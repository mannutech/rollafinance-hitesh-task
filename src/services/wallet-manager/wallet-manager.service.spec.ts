import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainNetwork, BlockchainTypeCategory } from '../../db-entities/wallet.entity';
import { WalletManagerService } from './wallet-manager.service';

describe('WalletManagerService', () => {
  let service: WalletManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletManagerService],
    }).compile();

    service = module.get<WalletManagerService>(WalletManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    console.log(service.deriveAddressAtPath(1, BlockchainTypeCategory.EVM));
  });
});
