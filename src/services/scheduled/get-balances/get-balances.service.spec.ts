import { Test, TestingModule } from '@nestjs/testing';
import { GetBalancesService } from './get-balances.service';

describe('GetBalancesService', () => {
  let service: GetBalancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetBalancesService],
    }).compile();

    service = module.get<GetBalancesService>(GetBalancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
