import { createContext } from 'react';
import User from '../Components/Interfaces/user.interface';

export interface context {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

export const UserContext = createContext<context>({
  user: { id: -1, username: '', id_42: '', avatar: '' },
  setUser: () => {}
});
