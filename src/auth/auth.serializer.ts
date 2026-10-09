import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(
    user: { id: string },
    done: (err: Error | null, id?: string) => void,
  ) {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    try {
      const user = await this.usersService.findById(id);
      done(null, user ?? undefined);
    } catch (error) {
      done(error instanceof Error ? error : new Error('Failed to load user'));
    }
  }
}
