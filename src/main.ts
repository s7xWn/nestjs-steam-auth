import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import session from 'express-session';
import passport from 'passport';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const redis = createClient({
    socket: {
      host: config.getOrThrow<string>('REDIS_HOST'),
      port: config.getOrThrow<number>('REDIS_PORT'),
    },
    password: config.get<string>('REDIS_PASSWORD'),
  });

  redis.on('error', (error) => {
    console.error('Redis error:', error);
  });

  await redis.connect();

  app.use(
    session({
      name: 'sid',
      store: new RedisStore({ client: redis }),
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  });

  await app.listen(3300);
}
await bootstrap();
