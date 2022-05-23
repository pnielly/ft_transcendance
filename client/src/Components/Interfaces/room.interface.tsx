import User from "./user.interface";

export default interface Room {
    id: number;
    name: string;
    access: string;
    members: User[]; 
    owner?: User;
    admins?: User[]; 
}