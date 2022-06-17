export interface gameRoom {
  state: Match;
  players: [userInfo, userInfo];
  friendly: boolean;
}

export interface userInfo {
  id: string;
  username: string;
  id_42: string;
  avatar: string;
  status: string;
  pongSocketId?: string;
}

export type Match = {
  playerLeft: player;
  playerRight: player;
  ball: ball;
  ballBonus: ball;
  isFinish: boolean;
  options: Options;
};

export type ball = {
  x: number;
  y: number;
  radius: number;
  acceleration: number;
  velocityX: number;
  velocityY: number;
  color: string;
};

export type player = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
};

export interface clientToRoom {
  [clientId: string]: string;
}

export interface Options {
  doubleBall: boolean;
  paddle: boolean;
}
