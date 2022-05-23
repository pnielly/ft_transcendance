import { createContext } from 'react';
import io, { Socket } from 'socket.io-client';

interface Context {
  socketChat: Socket;
  socketPong: Socket;
}

export const socketChat = io(`${process.env.REACT_APP_DEFAULT_URL}/chat`);
export const socketPong = io(`${process.env.REACT_APP_DEFAULT_URL}/pong`, { query: { param: 'IwaaWondering' } });
export const SocketContext = createContext<Context>({
  socketChat,
  socketPong
});
