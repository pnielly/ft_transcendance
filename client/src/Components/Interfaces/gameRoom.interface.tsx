import User from "./user.interface";

export default interface GameRoom {
  id: number;
  players: User[];
  viewers: User[];
}
