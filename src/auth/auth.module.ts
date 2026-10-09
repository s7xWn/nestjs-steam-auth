import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { SteamAuthStrategy } from './strategies/steam.strategy.js';
import { AuthSerializer } from './auth.serializer.js';

@Module({
  imports: [UsersModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [SteamAuthStrategy, AuthSerializer],
})
export class AuthModule {}
