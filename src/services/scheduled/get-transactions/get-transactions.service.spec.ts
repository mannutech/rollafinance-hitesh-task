import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionsService } from './get-transactions.service';

describe('GetTransactionsService', () => {
  let service: GetTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetTransactionsService],
    }).compile();

    service = module.get<GetTransactionsService>(GetTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
