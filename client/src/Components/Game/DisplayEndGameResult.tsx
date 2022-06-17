import { Grid, Button, Snackbar, SnackbarOrigin, Box } from '@mui/material';
import React, { useContext } from 'react';
import { UserContext } from '../../Contexts/userContext';
import { GameResult } from '../../Interfaces/gameResult.interface';
import User from '../../Interfaces/user.interface';
import '../../CSS/rainbow.css';
import '../../CSS/rankingButton.css';
import '../../CSS/hudgeButton.css';
import { useEffect } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { useNavigate } from 'react-router-dom';
// import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';

type Props = {
  gameResult: GameResult | undefined;
  roomId: string;
};

export interface State extends SnackbarOrigin {
  open: boolean;
}

const isWinner = (user: User, gameResult: GameResult | undefined) => {
  if (!gameResult) return;
  if (user.username === gameResult.player1.username && gameResult.winner === 1) return true;
  if (user.username === gameResult.player2.username && gameResult.winner === 2) return true;
  return false;
};

const DisplayEndGameResult = (props: Props) => {
  let navigate = useNavigate();
  const { gameResult, roomId } = props;
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center'
  });
  const { vertical, horizontal, open } = state;

  useEffect(() => {
    if (gameResult) setState({ open: true, vertical: 'top', horizontal: 'center' });
  }, [gameResult]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // if (reason === 'clickaway') {
    //   return;
    // }
    setState({ ...state, open: false });
    navigate('/game');
  };

  const handleClick = () => {
    navigate('/game');
  };

  useEffect(() => {
    sockContext.socketPong.emit('disconnectClientFromGame', roomId);
  }, []);

  function result() {
    if (me.id === gameResult?.player1.id || me.id === gameResult?.player2.id) {
      if (isWinner(me, gameResult)) {
        return <p className="nice win_text_animated">YOU WIN</p>;
      } else {
        return <p className="nice lose_text_animated">YOU LOOSE</p>;
      }
    } else return <p className="nice lose_text_animated">THE END</p>;
  }

  return (
    <Grid container>
      <Snackbar anchorOrigin={{ vertical, horizontal }} open={open} onClose={handleClose} key={vertical + horizontal} sx={{ height: '60%' }}>
        <div>
          {gameResult ? result() : ''}
          <button onClick={handleClick} className="ranking-glow">
            <span className="rainbow rainbow_text_animated" style={{ fontSize: '1em' }}>
              Back Home Game
            </span>
          </button>
        </div>
      </Snackbar>
    </Grid>
  );
};

export default DisplayEndGameResult;
