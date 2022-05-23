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
import { PongService } from './pong.service';
import {
  clientToRoom,
  gameRoomMap,
  userInfo,
} from './interfaces/pong.interfaces';
import { MatchService } from '../match/match.service';
import { Logger } from '@nestjs/common';

interface invite {
  sender: userInfo;
  roomId: string;
}

interface answer {
  accept: boolean;
  invitation: invite;
  guest: userInfo;
}

@WebSocketGateway({ namespace: '/pong', cors: true })
export class PongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly pongService: PongService,
    private readonly matchService: MatchService,
  ) {}

  @WebSocketServer()
  server: Server;

  private clientToRoom: clientToRoom = {}; // key=clientId, value=roomId (roomId === clientId)
  private gameRooms: gameRoomMap = {}; // key=roomId, value=room state & playerCount

  // List of Online / offline / inGame users
  private usersStatus: { [userId: number]: 'online' | 'ingame' } = {}; // key userId value = Status
  private clientToUser: { [socketId: string]: number } = {}; // key = socketId value= userId

  private limitLoop = 0;

  private logger: Logger = new Logger();
  afterInit(server: any) {}

  async handleConnection(client: any, ...args: any[]) {
    this.logger.log('CONNECTION TO GAMEEE: ' + client.id);
  }

  handleDisconnect(client: any) {
    this.logger.log('DISCONNECT FROM GAME: ' + client.id);
    delete this.clientToRoom[client.id];

    // delete UserStatus to offline
    const userId = this.clientToUser[client.id];
    if (userId) delete this.usersStatus[userId];
    delete this.clientToUser[client.id];
    this.server.emit('statusOfUsers', this.usersStatus);
  }

  @SubscribeMessage('online')
  online(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    this.usersStatus[userId] = 'online';
    this.clientToUser[client.id] = userId;
    client.join(String(userId));
    this.server.emit('statusOfUsers', this.usersStatus);
  }

  @SubscribeMessage('gameInvitation')
  handleInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody() invite: { sender: userInfo; guestId: number },
  ) {
    client.data.side = 0; // set Side of Sender Left
    this.server
      .to(String(invite.guestId))
      .emit('pendingInvitation', { sender: invite.sender, roomId: client.id });
  }

  @SubscribeMessage('answerInvitation')
  handleAnswerInvitation(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    answer: answer,
  ) {
    if (answer.accept === false) return;
    const roomId = answer.invitation.roomId;
    // Check if sender or guest are already in game or offline
    if (
      this.usersStatus[answer.invitation.sender.id] != 'online' ||
      this.usersStatus[answer.guest.id] != 'online'
    ) {
      this.server
        .to(String(answer.guest.id))
        .emit('invitationExpired', answer.invitation);
      return;
    }
    // Create new Rom with clientId of Sender
    this.gameRooms[roomId] = {
      state: this.pongService.createGameState(),
      players: [
        { ...answer.invitation.sender, pongSocketId: roomId },
        { ...answer.guest, pongSocketId: client.id },
      ],
      intervalId: undefined,
      friendly: true,
    };
    this.clientToRoom[client.id] = roomId; // Link Room Id to the guest client.id
    this.clientToRoom[roomId] = roomId; // Link Room Id to sender client.id
    client.data.side = 1;
    client.join(roomId);
    this.startGame(roomId);
  }

  handleRefuseInvitation(roomId: string) {
    if (!this.gameRooms[roomId]) return;
    const playerSocketId = this.gameRooms[roomId].players[0].pongSocketId;
    delete this.clientToRoom[playerSocketId];
    delete this.gameRooms[roomId];
  }

  @SubscribeMessage('watchGame')
  handleWatchGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    // Check if user is inGame
    if (this.usersStatus[userId] != 'ingame') return;

    // Search User in available GameRooms
    for (const [keyRoom, gameRoom] of Object.entries(this.gameRooms)) {
      if (
        gameRoom.players[0].id === userId ||
        gameRoom.players[1].id === userId
      ) {
        const roomId = keyRoom;
        client.join(roomId);
        this.server.to(client.id).emit('gameStarting', roomId);
        return;
      }
    }
  }

  @SubscribeMessage('isInGame')
  IsInGame(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    for (const [key, value] of Object.entries(this.gameRooms)) {
      if (
        value.players[0].id == userId ||
        (value.players[1] && value.players[1].id == userId)
      ) {
        client.join(key);
        client.data.side = value.players[0].id == userId ? 0 : 1;
        this.clientToRoom[client.id] = key;
        this.server.to(key).emit('gameStarting', key);
      }
    }
  }

  @SubscribeMessage('joinWaitList')
  handleWaitList(
    @ConnectedSocket() client: Socket,
    @MessageBody() user: userInfo,
  ) {
    this.limitLoop = 0;
    this.joinGame(client, user);
  }

  joinGame(client: Socket, user: userInfo) {
    this.limitLoop++;
    const availableGameRooms: string[] = [];
    for (let roomId in this.gameRooms) {
      if (this.gameRooms[roomId].players[1] === undefined) {
        availableGameRooms.push(roomId);
      }
    }
    if (this.limitLoop > 20 || availableGameRooms.length === 0) {
      return this.createGameRoom(client, user);
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
      this.startGame(roomId);
    } else return this.joinGame(client, user);
  }

  createGameRoom(client: Socket, user: userInfo) {
    this.gameRooms[client.id] = {
      state: this.pongService.createGameState(),
      players: [{ ...user, pongSocketId: client.id }, undefined],
      intervalId: undefined,
      friendly: false,
    };
    this.clientToRoom[client.id] = client.id; // the roomId === the first client.id
    client.data.side = 0;
  }

  startGame(roomId: string) {
    // Update User Status
    const userId1 = this.gameRooms[roomId].players[0].id;
    const userId2 = this.gameRooms[roomId].players[1].id;
    this.usersStatus[userId1] = 'ingame';
    this.usersStatus[userId2] = 'ingame';
    this.server.emit('statusOfUsers', this.usersStatus);

    this.server.to(roomId).emit('gameStarting', roomId); // Game Start
    setTimeout(() => {
      const interval: NodeJS.Timer = setInterval(() => {
        if (!this.gameRooms[roomId]) return;
        const winner = this.pongService.updateMatch(
          this.gameRooms[roomId].state,
        );
        if (winner) {
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
      if (this.gameRooms[roomId]) this.gameRooms[roomId].intervalId = interval;
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
        this.gameRooms[roomId].state.playerLeft.y = clientY;
      } else {
        this.gameRooms[roomId].state.playerRight.y = clientY;
      }
    }
  }

  endGame(roomId: string, winner: number) {
    if (!this.gameRooms[roomId]) return;
    const gameRoom = this.gameRooms[roomId];
    this.matchService.createMatch({
      player1: gameRoom.players[0].id,
      player2: gameRoom.players[1].id,
      score1: gameRoom.state.playerLeft.score,
      score2: gameRoom.state.playerRight.score,
      winner: winner,
      status: gameRoom.friendly ? 'friendly' : 'ladder',
    });
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
    clearInterval(this.gameRooms[roomId].intervalId);
    delete this.clientToRoom[player1.pongSocketId];
    delete this.clientToRoom[player2.pongSocketId];
    delete this.gameRooms[roomId];
  }
}
