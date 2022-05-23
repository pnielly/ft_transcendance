import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entities';
import { Message } from './entities/message.entities';
import { User } from '../users/entities/user.entities';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message, User]), UsersModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChatGateway],
})
export class ChannelModule {}
