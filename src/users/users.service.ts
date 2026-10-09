import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findBySteamId(steamId: string) {
    return this.prisma.user.findUnique({
      where: { steamId },
    });
  }

  findOrCreateBySteamId(steamId: string) {
    return this.prisma.user.upsert({
      where: { steamId },
      update: {},
      create: { steamId },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
