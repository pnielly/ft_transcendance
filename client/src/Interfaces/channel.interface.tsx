import User from "./user.interface";

interface Channel {
  id: string;
  name: string;
  access: string;
  password?: string;
  owner: User;
  // members: User[];
  // messages: Message[];
  // createdAt: Date;
}
export default Channel;
