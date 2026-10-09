import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import SteamStrategy from '@dessly/passport-steam';
import { UsersService } from '../../users/users.service.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SteamAuthStrategy extends PassportStrategy(
  SteamStrategy,
  'steam',
) {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {
    // super({
    //   returnUrl: `${config.getOrThrow<string>('BACKEND_URL')}/auth/steam/return`,
    //   realm: `${config.getOrThrow<string>('BACKEND_URL')}/`,
    //   fetchUserProfile: false,
    // });
    super({
      returnUrl: `${config.getOrThrow<string>('BACKEND_URL')}/auth/steam/return`,
      realm: `${config.getOrThrow<string>('BACKEND_URL')}/`,
      fetchUserProfile: false,
    });
  }

  async validate(steamUser: { getSteamID64(): string }) {
    const steamId = steamUser.getSteamID64();

    return this.usersService.findOrCreateBySteamId(steamId);
  }
}
