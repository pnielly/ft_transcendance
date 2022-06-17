import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ChannelModule } from 'src/channel/channel.module';
import { ChannelService } from 'src/channel/channel.service';
import { Channel } from 'src/channel/entities/channel.entities';
import { Message } from 'src/channel/entities/message.entities';
import { EloModule } from 'src/elo/elo.module';
import { ChatInvite } from './entities/chatInvite.entities';
import { User } from './entities/user.entities';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Channel, User, ChatInvite]),
    EloModule,
    forwardRef(() => ChannelModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway, ChannelService],
  exports: [UsersService],
})
export class UsersModule {}
