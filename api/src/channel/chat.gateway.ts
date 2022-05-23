import { Body, Logger, Param } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createMessageDto } from './dto/create.message';
import { createChannelDto } from './dto/create.channel';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entities';

interface invite {
  channelId: number;
  channelName: string;
  guestId: number;
}

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly channelService: ChannelService) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger();

  async handleConnection(client: any, ...args: any[]) {
    client.join('General');
  }

  handleDisconnect(client: any) {
    console.log('CHAT DISCONNECTED');
  }

  afterInit(server: any) {
    this.logger.log('Initialized!!!!!');
  }

  @SubscribeMessage('online')
  online(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    client.join(String(userId)); // allows to easily send friend requests to this particular user
  }

  @SubscribeMessage('sentMessage')
  async chatToServer(@MessageBody() message: createMessageDto): Promise<void> {
    await this.channelService.createMessage(message);
    const channel = await this.channelService.findOne(message.channelId);
    if (channel.name.substring(0, 3) === 'dm-') {
      this.server.to(channel.name).emit('receivedMessage', message);
    } else {
      this.server.to(String(channel.id)).emit('receivedMessage', message);
    }
  }

  // Handle Room //////////////////////////
  @SubscribeMessage('createChatRoom')
  async createRoom(@MessageBody() channel: createChannelDto): Promise<void> {
    const chan = await this.channelService.findByName(channel.name);
    // if the direct messaging channel already exists, do nothing (if you befriend -> unfriend -> befriend someone, the channel remains the same)
    if (channel.name.substring(0, 3) === 'dm-' && chan) return null;
    const newChannel = await this.channelService.createChannel(channel);
    await this.channelService.addMember(newChannel.id, channel.userId);
    await this.channelService.addAdmin(newChannel.id, channel.userId);
    this.server.emit('channelListUpdated');
  }

  @SubscribeMessage('channelDelete')
  async channelDeleted(@MessageBody() channelId: number) {
    await this.channelService.remove(channelId);
    this.server.emit('channelListUpdated');
  }

  @SubscribeMessage('accessRoom')
  accessRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): void {
    // the direct message channels are found by name = 'dm-{smallerId}{biggerId}' so no risk of name collision and easy to find
    if (channel.name.substring(0, 3) === 'dm-') client.join(channel.name);
    else {
      client.join(String(channel.id));
      // this.server.to(String(channel.id)).emit('updateMember');
    }
  }

  @SubscribeMessage('accessChange')
  accessChange(
    @Body() param: { access: string; password: string; channelId: number },
  ) {
    this.channelService.changeAccess(param);
  }

  // Friend Request ///////////////////////
  @SubscribeMessage('friendRequestAccepted')
  friendAccepted(
    @ConnectedSocket() client: Socket,
    @MessageBody() param: { name: string; fromId: number; toId: number },
  ) {
    this.server.to(String(param.toId)).emit('newFriend', param);
    // join private channel (channel name : 'dm-{smallerId}{higherId})
    client.join(param.name);
  }

  @SubscribeMessage('joinNewFriendChannel')
  joinNewFriendChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() name: string,
  ) {
    // join private channel (channel name : 'dm-{smallerId}{higherId})
    client.join(name);
  }
  ///////////////////////////////////

  // Hanle Member /////////////////////////////
  @SubscribeMessage('addMember')
  addMember(@MessageBody() param: { channelId: number; memberId: number }) {
    this.channelService.addMember(param.channelId, param.memberId);
    this.server.to(String(param.channelId)).emit('updateMemberList');
  }

  @SubscribeMessage('removeMember')
  async removeMember(
    @MessageBody() param: { channelId: number; memberId: number },
  ) {
    await this.channelService.removeMember(param.channelId, param.memberId);
    this.server.to(String(param.channelId)).emit('updateMemberList');
  }

  // Handle Admin /////////////////////////////
  @SubscribeMessage('setAdmin')
  async setAdmin(@MessageBody() param: { channelId: number; adminId: number }) {
    await this.channelService.addAdmin(param.channelId, param.adminId);
    this.server.to(String(param.channelId)).emit('updateAdminList');
  }

  @SubscribeMessage('unAdmin')
  async unsetAdmin(
    @MessageBody() param: { channelId: number; adminId: number },
  ) {
    await this.channelService.removeAdmin(param.channelId, param.adminId);
    this.server.to(String(param.channelId)).emit('updateAdminList');
  }

  // Handle Ban /////////////////////////////
  @SubscribeMessage('addBan')
  addBan(@MessageBody() param: { channelId: number; banId: number }) {
    console.log('addban: id : ', param.banId);
    this.channelService.addBanned(param.channelId, param.banId);
    this.server.to(String(param.channelId)).emit('updateBanList');
    this.server.to(String(param.channelId)).emit('updateMemberList');
  }

  @SubscribeMessage('removeBan')
  removeBan(@MessageBody() param: { channelId: number; banId: number }) {
    this.channelService.removeBanned(param.channelId, param.banId);
    this.server.to(String(param.channelId)).emit('updateBanList');
    this.server.to(String(param.channelId)).emit('updateMemberList');
  }

  // Handle Mute //////////////////////////////
  @SubscribeMessage('addMute')
  addMute(
    @MessageBody()
    param: {
      channelId: number;
      muteId: number;
      muteTime: number;
    },
  ) {
    this.channelService.addMuted(param.channelId, param.muteId, param.muteTime);
    this.server.to(String(param.channelId)).emit('updateMuteList');
  }

  @SubscribeMessage('removeMute')
  removeMute(@MessageBody() param: { channelId: number; muteId: number }) {
    this.channelService.removeMuted(param.channelId, param.muteId);
    this.server.to(String(param.channelId)).emit('updateMuteList');
  }

  // Handle Invite (an admin can invite a user to a channel) ////////////////////////////////
  @SubscribeMessage('inviteChannel')
  inviteChannel(@MessageBody() invite: invite) {
    this.server.to(String(invite.guestId)).emit('inviteChannel', invite);
  }

  @SubscribeMessage('inviteResponse')
  inviteResponse(@MessageBody() answer: { accept: boolean; invite: invite }) {
    if (answer.accept === false) return;
    this.channelService.addMember(
      answer.invite.channelId,
      answer.invite.guestId,
    );
    this.server.to(String(answer.invite.channelId)).emit('updateMemberList');
    this.server.to(String(answer.invite.guestId)).emit('channelListUpdated');
  }
}
