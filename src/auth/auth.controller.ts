import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { UsersService } from '../users/users.service.js';

type AuthenticatedRequest = Request & {
  user?: { id: string; steamId: string };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Get('steam')
  @UseGuards(AuthGuard('steam'))
  steamLogin() {
    // Guard перенаправляет браузер на Steam.
  }

  @Get('steam/return')
  @UseGuards(AuthGuard('steam'))
  steamReturn(@Req() req: Request, @Res() res: Response) {
    req.session.save((error) => {
      if (error) {
        return res.status(500).send('Failed to save session');
      }

      return res.redirect(this.config.getOrThrow<string>('FRONTEND_URL'));
    });
  }

  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.logout((error) => {
      if (error) {
        return res.status(500).json({ message: 'Logout failed' });
      }

      req.session.destroy((sessionError) => {
        if (sessionError) {
          return res.status(500).json({
            message: 'Failed to destroy session',
          });
        }

        res.clearCookie('sid', { path: '/' });
        return res.status(200).json({ message: 'Logged out' });
      });
    });
  }
}
