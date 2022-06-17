import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { gameRoom } from '../../../Interfaces/gameRoom.interface';
import { Avatar, Grid, ListItem } from '@mui/material';
import { List, ListItemText, ListItemButton } from '@mui/material';

type Props = {};

const MatchList = (props: Props) => {
  const [gameRooms, setGameRooms] = useState<gameRoom[]>([]);
  const sockContext = useContext(SocketContext);

  const updateGameRoomList = useCallback((gameRoomList: Map<string, gameRoom>) => {
    let tab: gameRoom[] = [];
    for (const [keyRoom, gameRoom] of Object.entries(gameRoomList)) {
      tab.push(gameRoom);
    }
    setGameRooms(tab);
  }, []);

  useEffect(() => {
    sockContext.socketPong.emit('requestUpdateGameRoomList');
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('updateGameRoomList', updateGameRoomList);
    return () => {
      sockContext.socketChat.off('updateGameRoomList', updateGameRoomList);
    };
  }, []);

  const watchGame = (roomId: string) => {
    sockContext.socketPong.emit('watchGame', roomId);
  };

  function onGoing(e: gameRoom) {
    if (e.players[1]) return true;
    return false;
  }

  const displayListing = (e: gameRoom) => {
    return (
      <ListItem key={e.players[0].id} sx={{ width: '400px' }} alignItems="flex-start">
        <ListItemButton onClick={() => watchGame(e.players[0].id)}>
          <Avatar alt={e.players[0].username} src={e.players[0].avatar} />
          <ListItemText sx={{ textAlign: 'center' }}>
            <Grid container justifyContent="space-around">
              <span>{e.players[0].username}</span> <span>VS</span> <span>{e.players[1].username}</span>
            </Grid>
          </ListItemText>
          <Avatar alt={e.players[1].username} src={e.players[1].avatar} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <div>
      {gameRooms.filter((e: gameRoom) => onGoing(e))[0] ? (
        <List>{gameRooms.filter((e: gameRoom) => onGoing(e)).map((e: gameRoom) => displayListing(e))}</List>
      ) : (
        'There is currently no match to watch...'
      )}
    </div>
  );
};

export default MatchList;
