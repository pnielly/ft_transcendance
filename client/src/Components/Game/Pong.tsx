import React, { useContext, useEffect } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { UserContext } from '../../Contexts/userContext';
import Canvas from './Canvas';
import './Pong.css';
import UserList from './UserList';
import GameInvitation from './GameInvitation';

type Props = {};

const Pong = (props: Props) => {
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [roomId, setRoomId] = useState<string>('');

  // SAY HELLOW I AM LOGIN
  useEffect(() => {
    sockContext.socketPong.emit('online', me.id);
  }, [sockContext.socketPong]);

  // Ask if The User is already In Game, if yes , the back end emit GameStarting
  useEffect(() => {
    sockContext.socketPong.emit('isInGame', me.id);
  }, []);

  // Ask for Matchmaking !
  function joinWaitList(e: React.MouseEvent<HTMLButtonElement>) {
    sockContext.socketPong.emit('joinWaitList', me);
  }

  // Join Game when the back end say it's ready
  const joinGame = useCallback((roomId: string) => {
    setRoomId(roomId);
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('gameStarting', joinGame);
  }, []);

  return (
    <div>
      {roomId ? (
        <Canvas />
      ) : (
        <div>
          <UserList />
          <GameInvitation />
          <button onClick={joinWaitList}>MATCHMAKING</button>
        </div>
      )}
    </div>
  );
};
export default Pong;
