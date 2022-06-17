import User from "./user.interface";

interface Options {
  doubleBall: boolean;
  paddle: boolean;
}

interface GameInvite {
    sender: User;
    roomId: string;
    options: Options;
  }

  export default GameInvite