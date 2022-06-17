import React, { useContext, useEffect } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { SocketContext } from '../Contexts/socket';
import { UserContext } from '../Contexts/userContext';
import { Options } from '../Components/Game/Canvas';
import { Grid, Container, Button } from '@mui/material';
import { UserRanking } from './Ranking';
import axios from 'axios';
import OptionsGame from '../Components/Game/OptionsGame';
import MatchList from '../Components/Game/CurrentMatchList.tsx/MatchList';
import TableRanking from '../Components/Game/Ranking/TableRanking';
import { userInfo } from '../Interfaces/gameRoom.interface';
import { useNavigate } from 'react-router-dom';
import '../CSS/Pong.css';
import '../CSS/hudgeButton.css';
import '../CSS/rainbow.css';
import '../CSS/rankingButton.css';
import useWindowSize from '../Hooks/useWindowSize';

type Props = {};

const Pong = (props: Props) => {
  let navigate = useNavigate();
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const modes = ['normal', 'doubleBall', 'paddle'];
  const [option, setOption] = useState<string>(modes[0]); // used to get the right option
  const [options, setOptions] = useState<Options>({ doubleBall: false, paddle: false });
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const sizeScreen = useWindowSize();

console.log('me:', me)

  useEffect(() => {
    switch (option) {
      case modes[1]:
        setOptions({ doubleBall: true, paddle: false });
        break;
      case modes[2]:
        setOptions({ doubleBall: false, paddle: true });
        break;
      default:
        setOptions({ doubleBall: false, paddle: false });
    }
  }, [option]);

  const handleClickRanking = () => {
    navigate('/ranking');
  };
  // SAY HELLOW I AM LOGIN
  useEffect(() => {
    sockContext.socketPong.emit('online', me.id);
  }, [sockContext.socketPong]);

  // Ask if The User is already In Game, if yes , the backend emit GameStarting
  useEffect(() => {
    sockContext.socketPong.emit('isInGame', me.id);
  }, []);

  // Ask for Matchmaking !
  function joinWaitList(e: React.MouseEvent<HTMLButtonElement>) {
    if (isWaiting) {
      sockContext.socketPong.emit('removeUserFromWaitList', { user: me });
    } else {
      sockContext.socketPong.emit('joinWaitList', { user: me, option: option });
    }
    setIsWaiting(!isWaiting);
  }

  // Join Game when the back end say it's ready
  const joinGame = useCallback((param: { roomId: string; players: { player1: userInfo; player2: userInfo }; options: Options }) => {
    navigate(`/match/${param.roomId}`, { state: { players: param.players, options: param.options } });
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('gameStarting', joinGame);
  }, []);

  /// RIGHT SIDE
  const [ranking, setRanking] = useState<UserRanking[]>([]);

  useEffect(() => {
    axios
      .get<UserRanking[]>(`${process.env.REACT_APP_DEFAULT_URL}/ranking?limit=5`, { withCredentials: true })
      .then((res) => setRanking(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Container sx={{ backgroundColor: 'rgb(35,35,35)', height: '100vh' }} maxWidth="xl">
      <Grid container justifyContent="center" sx={{ paddingTop: '35px' }}>
        <Grid item md={6} xs={12}>
          <Grid container direction="column" alignItems="center" justifyContent="center" spacing={4}>
            <Grid item>
              <button className={isWaiting ? 'hudge-glow-loading' : 'hudge-glow'} onClick={joinWaitList}>
                {isWaiting ? (
                  <p className="rainbow rainbow_text_animated" style={{ fontSize: '1.5em' }}>
                    Cancel research
                  </p>
                ) : (
                  <p className="rainbow rainbow_text_animated" style={{ fontSize: '1.5em' }}>
                    Join MatchMaking
                  </p>
                )}
              </button>
            </Grid>
            <Grid item>
              <OptionsGame option={option} setOption={setOption} modes={modes} />
            </Grid>
            <Grid item>
              <h2 className="classic" style={{ fontSize: '1.5em' }}>
                Current Matches
              </h2>
              <MatchList />
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={6} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Grid container justifyContent="center">
            <h1 className="classic" style={{ fontSize: '2em', paddingTop: '70px' }}>
              Best players
            </h1>
            <TableRanking ranking={ranking} />
            <Button className="ranking-glow neon" style={{ marginTop: '50px' }} onClick={handleClickRanking}>
              SEE FULL RANKING
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Pong;
