export interface gameRoom {
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
