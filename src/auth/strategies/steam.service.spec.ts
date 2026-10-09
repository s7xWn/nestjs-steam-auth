import { Test, TestingModule } from '@nestjs/testing';
import { SteamAuthStrategy } from './steam.strategy.js';

describe('SteamService', () => {
  let service: SteamAuthStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SteamAuthStrategy],
    }).compile();

    service = module.get<SteamAuthStrategy>(SteamAuthStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
