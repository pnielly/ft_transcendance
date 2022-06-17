import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createMessageDto } from './dto/create.message';
import { createChannelDto } from './dto/create.channel';
import { ChannelService } from './channel.service';
import { Channel } from './entities/channel.entities';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/utils/roles.decorator';
import { Role } from 'src/utils/role.enum';
import RolesGuardsSocket from 'src/auth/guards/roles-socket.guards';

interface invite {
  channelId: string;
  channelName: string;
  guestId: string;
}

interface muteState {
  userId: string;
  intervalId: NodeJS.Timer;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [`${process.env.URL_FRONT}`],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  private muteStateTable: { [channelId: string]: muteState[] } = {};

  private logger: Logger = new Logger();

  async handleConnection(client: any, ...args: any[]) {
    client.join('General');
    let cookie = JSON.stringify(client.handshake.headers.cookie);
    cookie = cookie?.substring(cookie.indexOf('access_token') + 13);
    cookie = cookie?.substring(0, cookie.length - 1);
    if (!cookie) return this.disconnect(client);
    try {
      const decodedToken = await this.authService.verifyJwt(cookie);
      const user = await this.userService.getOne(decodedToken.userId);
      if (!user) return client.disconnect();
      client.data.user = user;
    } catch {
      return this.disconnect(client);
    }
    console.log(client.id, 'chat connected');
  }

  private disconnect(client: Socket) {
    client.emit('Error', new WsException('Invalid credentials'));
    client.disconnect();
  }

  handleDisconnect(client: any) {
    console.log(client.id, ' chat DISCONNECTED');
  }

  afterInit(server: any) {
    this.logger.log('Chat Initialized!!!!!');
  }

  @SubscribeMessage('online')
  online(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(userId); // allows to easily send friend requests to this particular user
  }

  @SubscribeMessage('sentMessage')
  async chatToServer(@MessageBody() message: createMessageDto): Promise<void> {
    await this.channelService.createMessage(message);
    const channel = await this.channelService.findOne(message.channelId);
    this.server.to(channel.id).emit('updateMessageList', message);
  }

  // Handle Room //////////////////////////
  @SubscribeMessage('createChatRoom')
  async createChannel(
    @MessageBody() channel: createChannelDto,
  ): Promise<Channel> {
    const newChannel = await this.channelService.createChannel(channel);
    await this.channelService.addMember(newChannel.id, channel.userId);
    await this.channelService.addAdmin(newChannel.id, channel.userId);
    this.server.emit('updateChannelList');
    return newChannel;
  }

  @Roles(Role.Owner)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('channelDelete')
  async channelDeleted(@MessageBody() param: { channelId: string }) {
    await this.channelService.remove(param.channelId);
    this.server.emit('updateChannelList');
  }

  @SubscribeMessage('accessRoom')
  accessRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() channel: Channel,
  ): void {
    client.join(channel.id);
    this.server.emit('updateChannelList');
  }

  @SubscribeMessage('accessChange')
  async accessChange(
    @MessageBody()
    param: {
      access: string;
      password: string;
      channelId: string;
    },
  ) {
    await this.channelService.changeAccess(param);
    this.server.to(param.channelId).emit('updateChannelList');
  }

  /////////////////////////////////// ADMIN PANEL

  // Hanle Member /////////////////////////////
  @SubscribeMessage('addMember')
  async addMember(
    @MessageBody() param: { channelId: string; memberId: string },
  ) {
    await this.channelService.addMember(param.channelId, param.memberId);
    this.server.to(param.channelId).emit('updateMemberList');
    this.server.to(param.channelId).emit('updateChannelList');
  }

  @SubscribeMessage('removeMember')
  async removeMember(
    @MessageBody() param: { channelId: string; memberId: string },
  ) {
    await this.channelService.removeMember(param.channelId, param.memberId);
    this.server.to(param.channelId).emit('updateMemberList');
    this.server.to(param.channelId).emit('updateChannelList');
  }

  // Handle Admin /////////////////////////////
  @Roles(Role.Owner)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('setAdmin')
  async setAdmin(@MessageBody() param: { channelId: string; adminId: string }) {
    await this.channelService.addAdmin(param.channelId, param.adminId);
    this.server.to(param.channelId).emit('updateAdminList');
  }

  @Roles(Role.Owner)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('unAdmin')
  async unsetAdmin(
    @MessageBody() param: { channelId: string; adminId: string },
  ) {
    await this.channelService.removeAdmin(param.channelId, param.adminId);
    this.server.to(param.channelId).emit('updateAdminList');
  }

  // Handle Ban /////////////////////////////
  @Roles(Role.Admin)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('addBan')
  async addBan(@MessageBody() param: { channelId: string; bannedId: string }) {
    try {
      await this.channelService.addBanned(param.channelId, param.bannedId);
    } catch (err) {
      throw err;
    } finally {
      this.server.to(param.channelId).emit('updateBanList');
    }
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('removeBan')
  async removeBan(
    @MessageBody() param: { channelId: string; bannedId: string },
  ) {
    await this.channelService.removeBanned(param.channelId, param.bannedId);
    this.server.to(param.channelId).emit('updateBanList');
  }

  // Handle Mute //////////////////////////////
  @Roles(Role.Admin)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('addMute')
  async addMute(
    @MessageBody()
    param: {
      channelId: string;
      userId: string;
      muteTime: number;
    },
  ) {
    const intervalId = await this.channelService.addMuted(
      param.channelId,
      param.userId,
      param.muteTime,
    );
    if (!this.muteStateTable[param.channelId])
      this.muteStateTable[param.channelId] = [];
    this.muteStateTable[param.channelId].push({
      userId: param.userId,
      intervalId: intervalId,
    });
    this.server.to(param.channelId).emit('updateMuteList');

    // re-update after time out to unmute user in front
    setTimeout(() => {
      this.server.to(param.channelId).emit('updateMuteList');
    }, param.muteTime + 3000);
  }

  @Roles(Role.Admin)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('removeMute')
  async removeMute(
    @MessageBody() param: { channelId: string; muteId: string },
  ) {
    // cancel current mute timeout
    if (
      this.muteStateTable[param.channelId] &&
      this.muteStateTable[param.channelId][0]
    ) {
      const muteStateIndex = this.muteStateTable[param.channelId].findIndex(
        (i) => i.userId === param.muteId,
      );
      if (muteStateIndex !== -1) {
        const muteState: muteState =
          this.muteStateTable[param.channelId][muteStateIndex];
        clearInterval(muteState.intervalId);
        delete this.muteStateTable[param.channelId][muteStateIndex];
      }
    }
    await this.channelService.removeMuted(param.channelId, param.muteId);
    this.server.to(param.channelId).emit('updateMuteList');
  }

  // Handle Invite (an admin can invite a user to a channel) ////////////////////////////////
  @Roles(Role.Admin)
  @UseGuards(RolesGuardsSocket)
  @SubscribeMessage('inviteChannel')
  async inviteChannel(@MessageBody() invite: invite) {
    const tmp = await this.userService.addChatInvite(invite);
    console.log('user', tmp)
    console.log('to Id:  ', invite.guestId)
    this.server.to(invite.guestId).emit('updateChatInviteList');
  }

  @SubscribeMessage('inviteResponse')
  async inviteResponse(
    @MessageBody() answer: { accept: boolean; invite: invite },
  ) {
    if (answer.accept === true) {
      this.channelService.addMember(
        answer.invite.channelId,
        answer.invite.guestId,
      );
      this.server.to(answer.invite.channelId).emit('updateMemberList');
      this.server.emit('updateChannelList');
    }
    await this.userService.removeChatInvite(
      answer.invite.guestId,
      answer.invite.channelId,
    );
    this.server.to(answer.invite.guestId).emit('updateChatInviteList');
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(
    @MessageBody() param: { channelId: string; userId: string },
  ) {
    await this.channelService.removeMember(param.channelId, param.userId);
    this.server.to(param.channelId).emit('updateMemberList');
    this.server.to(param.channelId).emit('updateChannelList');
  }

  @SubscribeMessage('newOwner')
  async newOwner(@MessageBody() param: { channelId: string; heirId: string }) {
    await this.channelService.changeOwner(param.channelId, param.heirId);
  }
}
