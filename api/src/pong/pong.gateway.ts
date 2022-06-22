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
import { PongService } from './pong.service';
import { clientToRoom, gameRoom, userInfo } from './interfaces/pong.interfaces';
import { MatchService } from '../match/match.service';
import { Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

interface invite {
  sender: userInfo;
  roomId: string;
  options: Options;
}

interface answer {
  accept: boolean;
  invitation: invite;
  guest: userInfo;
}

interface Options {
  doubleBall: boolean;
  paddle: boolean;
}

@WebSocketGateway({
  namespace: '/pong',
  cors: {
    origin: [`${process.env.URL_FRONT}`],
    credentials: true,
  },
})
export class PongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly pongService: PongService,
    private readonly matchService: MatchService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  private clientToRoom: clientToRoom = {}; // key=clientId, value=roomId (roomId === clientId)
  private gameRooms = new Map<string, gameRoom[]>(); // key=roomId, value=room state & playerCount
  private gameInvites: { [userId: string]: invite[] } = {}; // key = userId, value = senderId[]

  // List of Online / offline / inGame users
  private usersStatus: { [userId: string]: 'online' | 'ingame' } = {}; // key userId value = Status
  private clientToUser: { [socketId: string]: string } = {}; // key = socketId value= userId

  private intervalRoomId: { [roomId: string]: NodeJS.Timer } = {}; //key room Id value = intervale
  private limitLoop = 0;

  private logger: Logger = new Logger();
  afterInit(server: any) {}

  async handleConnection(client: any, ...args: any[]) {
    let cookie = JSON.stringify(client.handshake.headers.cookie);
    cookie = cookie?.substring(cookie.indexOf('access_token') + 13);
    cookie = cookie?.substring(0, cookie.length - 1);
    if (!cookie) return this.disconnect(client);
    try {
      const decodedToken = await this.authService.verifyJwt(cookie);
      const user = await this.authService.findMe(decodedToken.userId);
      client.data.user = user;
      this.logger.log('CONNECTION TO GAME: ' + client.id);
    } catch {
      return this.disconnect(client);
    }



    console.log(client.id, 'pong connected');
  }

  private disconnect(client: Socket) {
    client.emit('Error', new WsException('Invalid credentials'));
    client.disconnect();
    console.log(client.id, 'pong disconnected');
  }

  handleDisconnect(client: any) {
    this.logger.log('DISCONNECT FROM GAME: ' + client.id);
    delete this.clientToRoom[client.id];

    // delete UserStatus to offline
    const userId = this.clientToUser[client.id];
    if (userId) delete this.usersStatus[userId];
    delete this.clientToUser[client.id];
    delete this.gameInvites[client.id];

    // Remove User for Wait List but not if is in Game
    if (this.gameRooms[client.id] && !this.gameRooms[client.id].players[1]) {
      delete this.gameRooms[client.id];
    }
    this.server.emit('statusOfUsers', this.usersStatus);
  }

  @SubscribeMessage('online')
  online(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    this.usersStatus[userId] = 'online';
    this.clientToUser[client.id] = userId;
    client.join(String(userId));
    this.server.emit('statusOfUsers', this.usersStatus);
    if (this.gameInvites[userId])
      this.server
        .to(userId)
        .emit('updateGameInviteList', this.gameInvites[userId]);
  }

  @SubscribeMessage('gameInvitation')
  handleInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    invite: { sender: userInfo; guestId: string; options: Options },
  ) {
    client.data.side = 0; // set Side of Sender Left
    // save in backend (only if invite doesn't exist yet)
    if (this.gameInvites[invite.guestId]) {
      // check if invite already exists
      let exists: boolean = false;
      for (let k in this.gameInvites[invite.guestId]) {
        var entry = this.gameInvites[invite.guestId][k];
        for (let i in entry) {
          let inviteString = JSON.stringify(entry[i]);
          inviteString = inviteString.substring(inviteString.indexOf('id') + 5);
          const senderId = inviteString.substring(0, inviteString.indexOf('"'));
          if (senderId === invite.sender.id) exists = true;
        }
      }
      if (!exists) {
        this.gameInvites[invite.guestId].push({
          sender: invite.sender,
          roomId: client.id,
          options: invite.options,
        });
      }
    } else {
      this.gameInvites[invite.guestId] = [
        { sender: invite.sender, roomId: client.id, options: invite.options },
      ];
    }
    this.server
      .to(invite.guestId)
      .emit('updateGameInviteList', this.gameInvites[invite.guestId]);
  }

  @SubscribeMessage('checkInviteExpired')
  checkInviteExpired(
    @ConnectedSocket() client: Socket,
    @MessageBody() answer: answer,
  ) {
    // Check if sender or guest are already in game or offline
    if (
      this.usersStatus[answer.invitation.sender.id] != 'online' ||
      this.usersStatus[answer.guest.id] != 'online'
    ) {
      this.server
        .to(answer.guest.id)
        .emit('invitationExpired', answer.invitation);
      this.server
        .to(answer.guest.id)
        .emit('updateGameInvites', this.gameInvites);
      return;
    }
    this.server.to(answer.guest.id).emit('invitationValid', answer);
    return;
  }

  @SubscribeMessage('answerInvitation')
  async handleAnswerInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    answer: answer,
  ) {
    // remove invite from gameInvites
    const userId = this.clientToUser[client.id];

    const toDelete = this.gameInvites[userId].findIndex(
      (i) => i.sender.id === answer.invitation.sender.id,
    );
    this.gameInvites[userId].splice(toDelete, 1);
    if (!this.gameInvites[userId][0]) delete this.gameInvites[userId];
    this.server
      .to(answer.guest.id)
      .emit('updateGameInviteList', this.gameInvites);

    if (answer.accept === false) return;

    // Create new Room with clientId of Sender
    const roomId = answer.invitation.roomId;
    this.gameRooms[roomId] = {
      state: this.pongService.createGameState({
        doubleBall: answer.invitation.options.doubleBall,
        paddle: answer.invitation.options.paddle,
      }),
      players: [
        { ...answer.invitation.sender, pongSocketId: roomId },
        { ...answer.guest, pongSocketId: client.id },
      ],
      friendly: true,
    };
    this.clientToRoom[client.id] = roomId; // Link Room Id to the guest client.id
    this.clientToRoom[roomId] = roomId; // Link Room Id to sender client.id
    client.data.side = 1;
    client.join(roomId);
    this.server.to(answer.invitation.sender.id).emit('gameInviteAccepted', {
      invite: answer.invitation,
      guest: answer.guest,
    });

    this.startGame(roomId, answer.invitation.options);
  }

  // useless?
  handleRefuseInvitation(roomId: string) {
    if (!this.gameRooms[roomId]) return;
    const playerSocketId = this.gameRooms[roomId].players[0].pongSocketId;
    delete this.clientToRoom[playerSocketId];
    delete this.gameRooms[roomId];
  }

  @SubscribeMessage('watchGame')
  handleWatchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    // Check if user is inGame
    // if (this.usersStatus[roomId] != 'ingame') return;
    // Search User in available GameRooms
    for (const [keyRoom, gameRoom] of Object.entries(this.gameRooms)) {
      if (gameRoom.players[0].id === roomId) {
        client.join(keyRoom);
        this.server.to(client.id).emit('gameStarting', {
          roomId: keyRoom,
          players: {
            player1: this.gameRooms[keyRoom].players[0],
            player2: this.gameRooms[keyRoom].players[1],
          },
          options: this.gameRooms[keyRoom].state.options,
        });
        return;
      }
    }
  }

  @SubscribeMessage('isInGame')
  IsInGame(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    for (const [key, value] of Object.entries(this.gameRooms)) {
      if (
        (value.players[0].id === userId && value.players[1]) ||
        (value.players[1] && value.players[1].id === userId)
      ) {
        client.join(key);
        client.data.side = value.players[0].id == userId ? 0 : 1;
        this.clientToRoom[client.id] = key;
        this.server.to(key).emit('gameStarting', {
          roomId: key,
          players: {
            player1: this.gameRooms[key].players[0],
            player2: this.gameRooms[key].players[1],
          },
          options: this.gameRooms[key].state.options,
        });
      }
    }
  }

  @SubscribeMessage('removeUserFromWaitList')
  handleRemoveUserFromWaitList(@ConnectedSocket() client: Socket) {
    if (this.gameRooms[client.id]) {
      delete this.gameRooms[client.id];
    }
  }

  @SubscribeMessage('joinWaitList')
  handleWaitList(
    @ConnectedSocket() client: Socket,
    @MessageBody() param: { user: userInfo; option: string },
  ) {
    this.limitLoop = 0;
    const gameOptions = { doubleBall: false, paddle: false };
    if (param.option === 'paddle') {
      gameOptions.paddle = true;
    } else if (param.option === 'doubleBall') {
      gameOptions.doubleBall = true;
    }
    this.joinGame(client, param.user, gameOptions);
  }

  joinGame(client: Socket, user: userInfo, options: Options) {
    // Check available Room, if not create his own Room
    this.limitLoop++;
    const availableGameRooms: string[] = [];
    for (let roomId in this.gameRooms) {
      if (
        this.gameRooms[roomId].players[1] === undefined &&
        this.gameRooms[roomId].state.options.doubleBall ===
          options.doubleBall &&
        this.gameRooms[roomId].state.options.paddle === options.paddle
      ) {
        availableGameRooms.push(roomId);
      }
    }

    if (this.limitLoop > 10 || availableGameRooms.length === 0) {
      return this.createGameRoom(client, user, options);
    }
    const randPick = Math.floor(Math.random() * availableGameRooms.length);
    const roomId = availableGameRooms[randPick];
    if (
      !this.gameRooms[roomId].players[1] &&
      this.gameRooms[roomId].players[0].id != user.id
    ) {
      this.clientToRoom[client.id] = roomId; // Link clientId to RoomID
      this.gameRooms[roomId].players[1] = { ...user, pongSocketId: client.id };
      client.join(roomId);
      client.data.side = 1;
      this.startGame(roomId, options);
    } else return this.joinGame(client, user, options);
  }

  createGameRoom(client: Socket, user: userInfo, options: Options) {
    this.gameRooms[client.id] = {
      state: this.pongService.createGameState(options),
      players: [{ ...user, pongSocketId: client.id }, undefined],
      friendly: false,
    };
    this.clientToRoom[client.id] = client.id; // the roomId === the first client.id
    this.intervalRoomId[client.id] = undefined;
    client.data.side = 0;
    // this.server.emit('updateGameRoomList', this.gameRooms);
  }

  startGame(roomId: string, options: Options) {
    // Update User Status
    this.server.emit('updateGameRoomList', this.gameRooms);
    const userId1 = this.gameRooms[roomId].players[0].id;
    const userId2 = this.gameRooms[roomId].players[1].id;
    this.usersStatus[userId1] = 'ingame';
    this.usersStatus[userId2] = 'ingame';
    this.server.emit('statusOfUsers', this.usersStatus);

    this.server.to(roomId).emit('gameStarting', {
      roomId: roomId,
      players: {
        player1: this.gameRooms[roomId].players[0],
        player2: this.gameRooms[roomId].players[1],
      },
      options: options,
    }); // Game Start
    let count = 0;

    setTimeout(() => {
      const interval: NodeJS.Timer = setInterval(() => {
        if (!this.gameRooms[roomId]) return;
        const winner = this.pongService.updateMatch(
          this.gameRooms[roomId].state,
        );
        if (winner && !count) {
          count++;
          this.server
            .to(roomId)
            .emit('matchUpdate', this.gameRooms[roomId].state);
          this.endGame(roomId, winner);
        } else {
          this.server
            .to(roomId)
            .emit('matchUpdate', this.gameRooms[roomId].state);
        }
      }, 20);
      if (this.gameRooms[roomId]) this.intervalRoomId[roomId] = interval;
    }, 1000);
  }

  @SubscribeMessage('mouseMoved')
  handleMouseMove(
    @ConnectedSocket() client: any,
    @MessageBody() clientY: number,
  ): void {
    const roomId = this.clientToRoom[client.id];
    if (roomId) {
      if (client.data.side === 0) {
        // '* 1.5' is an empiric value (to center the paddle at the level of the mouse)
        this.gameRooms[roomId].state.playerLeft.y = clientY;
        // - this.gameRooms[roomId].state.playerLeft.height / 2;
      } else {
        this.gameRooms[roomId].state.playerRight.y = clientY;
        //  - this.gameRooms[roomId].state.playerRight.height / 2;
      }
    }
  }

  @SubscribeMessage('disconnectClientFromGame')
  disconnectClientToRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (client.id !== roomId) client.leave(roomId);
  }

  async endGame(roomId: string, winner: number) {
    if (!this.gameRooms[roomId]) return;
    const gameRoom = this.gameRooms[roomId];
    // Create Match is and send the result to the front
    const match = await this.matchService.createMatch({
      player1: gameRoom.players[0].id,
      player2: gameRoom.players[1].id,
      score1: gameRoom.state.playerLeft.score,
      score2: gameRoom.state.playerRight.score,
      winner: winner,
      status: this.matchService.setStatusOfMatch(gameRoom),
      mode: this.matchService.setModeOfMatch(gameRoom),
    });
    this.server.to(roomId).emit('endGame', match);
    // Update Elo of players if it's not friendly
    if (gameRoom.friendly === false) {
      this.matchService.updateEloPlayer({
        user1: gameRoom.players[0],
        user2: gameRoom.players[1],
        winner: winner,
      });
    }
    // Update User Status
    const player1 = gameRoom.players[0];
    const player2 = gameRoom.players[1];
    this.usersStatus[player1.id] = 'online';
    this.usersStatus[player2.id] = 'online';
    this.server.emit('statusOfUsers', this.usersStatus);

    // End Game and remove ClientIdToRoom + GameRoom
    clearInterval(this.intervalRoomId[roomId]);
    delete this.intervalRoomId[roomId];
    delete this.clientToRoom[player1.pongSocketId];
    delete this.clientToRoom[player2.pongSocketId];
    delete this.gameRooms[roomId];
    // Emit Update Game Room List
    this.server.emit('updateGameRoomList', this.gameRooms);
  }

  @SubscribeMessage('requestUpdateGameRoomList')
  requestUpdateGameRoomList() {
    this.server.emit('updateGameRoomList', this.gameRooms);
  }
}
