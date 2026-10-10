import {
  BadGatewayException,
  Controller,
  GatewayTimeoutException,
  Get,
  NotFoundException,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

type AuthenticatedRequest = Request & {
  user?: { id: string; steamId: string };
};

@Controller('me')
export class UsersController {
  @Get('inventory')
  async meInventory(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const url = new URL(
      `https://steamcommunity.com/inventory/${req.user.steamId}/730/2`,
    );

    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'curl/8.5.0',
          Accept: '*/*',
        },
        signal: AbortSignal.timeout(10000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new GatewayTimeoutException('Steam request timed out');
      }

      throw new ServiceUnavailableException('Could not connect to Steam');
    }

    if (response.status === 429) {
      throw new ServiceUnavailableException('Steam rate limit exceeded');
    }

    if (!response.ok) {
      console.log(response);
      throw new BadGatewayException({
        message: 'Steam inventory request failed',
        steamStatus: response.status,
      });
    }

    let data: any;

    try {
      data = await response.json();
    } catch {
      throw new BadGatewayException('Steam returned invalid JSON');
    }

    if (data.success !== 1) {
      throw new BadGatewayException(
        'Steam inventory is private or unavailable',
      );
    }
    return data;
  }
}
