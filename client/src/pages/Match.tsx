import { Container } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Options } from '../Components/Game/Canvas';
import InGame from '../Components/Game/InGame';
import { SocketContext } from '../Contexts/socket';
import { UserContext } from '../Contexts/userContext';
import { GameResult } from '../Interfaces/gameResult.interface';
import { userInfo } from '../Interfaces/gameRoom.interface';

type Props = {};

type GameSettings = {
  players: Players;
  options: Options;
};

type Players = {
  player1: userInfo;
  player2: userInfo;
};

const Match = (props: Props) => {
  const { state } = useLocation();
  const param = useParams();
  const sockContext = useContext(SocketContext);
  const [gameResult, setGameResult] = useState<GameResult | undefined>(undefined);
  const [gameSettings, setGameSettings] = useState<GameSettings>(state as GameSettings);
  const me = useContext(UserContext).user;
  const endGame = useCallback((gameResult: GameResult) => {
    setGameResult(gameResult);
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('endGame', endGame);
  }, []);

  useEffect(() => {
    sockContext.socketPong.emit('isInGame', me.id);
  }, []);

  return (
    <Container maxWidth="xl" style={{ height: '100vh' }}>
      {param.roomId && <InGame playerLeft={gameSettings.players.player1} playerRight={gameSettings.players.player2} roomId={param.roomId} options={gameSettings.options} gameResult={gameResult} />}
    </Container>
  );
};

export default Match;
