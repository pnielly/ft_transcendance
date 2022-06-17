import { createContext } from 'react';
import io, { Socket } from 'socket.io-client';

interface Context {
  socketChat: Socket;
  socketPong: Socket;
  socketUser: Socket;
}

export const socketChat = io(`${process.env.REACT_APP_SOCKET_URL}/chat`, { withCredentials: true });
export const socketPong = io(`${process.env.REACT_APP_SOCKET_URL}/pong`, { withCredentials: true });
export const socketUser = io(`${process.env.REACT_APP_SOCKET_URL}/users`, { withCredentials: true });
export const SocketContext = createContext<Context>({
  socketChat,
  socketPong,
  socketUser
});
