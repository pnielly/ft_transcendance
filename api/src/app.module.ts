import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entities';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { Message } from './channel/entities/message.entities';
import { PongModule } from './pong/pong.module';
import { ChannelModule } from './channel/channel.module';
import { Channel } from './channel/entities/channel.entities';
import { Match } from './match/entities/match.entity';
import { MatchModule } from './match/match.module';
import { Elo } from './match/entities/elo.entity';
import { MulterModule } from '@nestjs/platform-express';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import JwtTwoFactorGuard from './auth/guards/jwt-two-factor.guard';
import { LoggingFilterInterceptor } from './utils/logs.interceptor';
import { EloModule } from './elo/elo.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', // type of our database
      host: process.env.POSTGRES_HOST, // database host
      port: parseInt(process.env.POSTGRES_PORT), // database host
      username: process.env.POSTGRES_USER, // username
      password: process.env.POSTGRES_PASSWORD, // user password
      database: process.env.POSTGRES_DB, // name of our database,
      autoLoadEntities: true, // models will be loaded automatically
      entities: [User, Message, Channel, Match, Elo],
      synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
    }),
    AuthModule,
    PongModule,
    MatchModule,
    ChannelModule,
    EloModule,
    MulterModule.register({
      dest: './files',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtTwoFactorGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingFilterInterceptor },
  ],
})
export class AppModule {}
