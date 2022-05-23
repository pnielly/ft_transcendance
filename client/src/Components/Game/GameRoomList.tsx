import React from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { SocketContext } from '../../Contexts/socket';
import GameRoom from '../Interfaces/gameRoom.interface';

type Props = {
  setActiveGameRoom: (gameRoomId: number) => void;
  gameRoomList: GameRoom[];
};

const GameRoomList = (props: Props) => {
  const { gameRoomList, setActiveGameRoom } = props;
  const sockContext = useContext(SocketContext);

  const accessGameRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    const gameRoom = gameRoomList.find((r) => String(r.id) === e.currentTarget.value);
    if (gameRoom) {
      setActiveGameRoom(gameRoom.id);
      sockContext.socketPong.emit('joinWaitList', gameRoom);
    }
  };

  return (
    <div>
      <ul>
        {gameRoomList.map((g) => (
          <li>
            {g.players[0].username}
            {' vs '}
            {g.players[1].username}{' '}
            <button onClick={accessGameRoom} value={g.id}>
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameRoomList;
