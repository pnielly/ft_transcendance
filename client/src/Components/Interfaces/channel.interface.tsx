import User from "./user.interface";

interface Channel {
  id: number;
  name: string;
  access: string;
  password?: string;
  owner: User;
  // members: User[];
  // messages: Message[];
  // createdAt: Date;
}
export default Channel;
