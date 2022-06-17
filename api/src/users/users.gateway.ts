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
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from './users.service';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { Channel } from 'src/channel/entities/channel.entities';

@WebSocketGateway({
  namespace: '/users',
  cors: { origin: [`${process.env.URL_FRONT}`], credentials: true },
})
export class UsersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly channelService: ChannelService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger();

  afterInit(server: any) {
    this.logger.log('Users Initialized!');
  }

  private disconnect(client: Socket) {
    client.emit('Error', new WsException('Invalid credentials'));
    client.disconnect();
  }

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
    console.log(client.id, 'users connected');
  }

  handleDisconnect(client: any) {
    console.log(client.id, ' users DISCONNECTED');
  }

  @SubscribeMessage('online')
  online(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    client.join(userId); // allows to easily send friend requests to this particular user
  }

  // Friend Request ///////////////////////
  @SubscribeMessage('friendRequestSent')
  async friendRequestSent(
    @MessageBody() param: { fromId: string; toId: string },
  ) {
    //console.log('enter function friendReuessent')
    const tmp = await this.userService.addFriendRequest(param.toId, param.fromId);
    //console.log('friend request sent', tmp)
    //console.log('to Id is : ', param.toId)
    this.server.to(param.toId).emit('updateFriendRequestList');
  }

  @SubscribeMessage('friendRequestResponse')
  async friendAccepted(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    param: { accept: boolean; name: string; fromId: string; toId: string },
  ) {
    if (param.accept === true) {
      console.log('toto')
      // create private channel (channel name : 'dm-{smallerId}{higherId})
      let chanArr = await this.channelService.findByName(param.name);
      let chan = chanArr[0];
      if (!chanArr[0]) {
        chan = await this.channelService.createChannel({
          name: param.name,
          access: 'private',
          password: '',
          userId: param.toId,
        });
        chan
          ? await this.channelService.addMember(chan.id, param.fromId)
          : console.log('CHAN DID NOT GET CREATED');
      }
      // add friends
      await this.userService.addFriend(param.fromId, param.toId);
      await this.userService.addFriend(param.toId, param.fromId);
      this.server.to(param.fromId).emit('updateFriendList');
      this.server.to(param.toId).emit('updateFriendList');
      this.server.to(param.toId).emit('updateChannelList');
      this.server.to(param.fromId).emit('updateChannelList');

      // tell other friend to join channel
      this.server.to(param.toId).emit('newFriend', param);
    }
    await this.userService.removeFriendRequest(param.fromId, param.toId);
    this.server.to(param.fromId).emit('updateFriendRequestList');
  }

  @SubscribeMessage('unfriend')
  async unfriend(@MessageBody() param: { fromId: string; toId: string }) {
    await this.userService.removeFriend(param.fromId, param.toId);
    await this.userService.removeFriend(param.toId, param.fromId);
    this.server.to(param.toId).emit('updateFriendList');
    this.server.to(param.fromId).emit('updateFriendList');
    this.server.to(param.toId).emit('updateChannelList');
    this.server.to(param.fromId).emit('updateChannelList');
  }

  @SubscribeMessage('blockUser')
  async blockUser(@MessageBody() param: { fromId: string; blockId: string }) {
    await this.userService.addBlock(param.fromId, param.blockId);
    this.server.to(param.fromId).emit('updateBlockList');
    this.server.to(param.blockId).emit('gotBlocked', param.fromId);

    const channel: Channel = await this.channelService.findDMByMembers(
      param.fromId,
      param.blockId,
    );
    await this.channelService.addBanned(channel.id, param.blockId);
    this.server.to(channel.id).emit('updateBanList');
  }

  @SubscribeMessage('unblockUser')
  async unblockUser(@MessageBody() param: { fromId: string; blockId: string }) {
    await this.userService.removeBlock(param.fromId, param.blockId);
    this.server.to(param.fromId).emit('updateBlockList');

    const channel: Channel = await this.channelService.findDMByMembers(
      param.fromId,
      param.blockId,
    );
    await this.channelService.removeBanned(channel.id, param.blockId);
    this.server.to(channel.id).emit('updateBanList');
  }
}
