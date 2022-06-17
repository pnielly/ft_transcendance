import { Grid } from '@mui/material';
import React from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { useState } from 'react';
import { GameResult } from '../../Interfaces/gameResult.interface';
import { userInfo } from '../../Interfaces/gameRoom.interface';
import Canvas from './Canvas';
import CanvasMobile from './CanvasMobile';
import DisplayEndGameResult from './DisplayEndGameResult';

type Props = {
  playerLeft: userInfo | undefined;
  playerRight: userInfo | undefined;
  roomId: string;
  gameResult: GameResult | undefined;
  options: Options;
};

interface Options {
  doubleBall: boolean;
  paddle: boolean;
}

const InGame = (props: Props) => {
  const [screenWidth, setScreenWidth] = useState<number | undefined>(0);
  const { playerLeft, playerRight, gameResult, roomId, options } = props;

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth != screenWidth) setScreenWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <React.Fragment>
      {screenWidth && screenWidth > 600 ? (
        <Grid container justifyContent="center" alignItems="center" sx={{ paddingTop: '50px' }} spacing={4}>
          <Grid item xs={12} md={8}>
            <Canvas options={options} />
          </Grid>
          <Grid item md={5} xs={12}>
            <h1 className="player-title" style={{ color: 'green', fontSize: '2em', borderRadius: '20px', backgroundColor: 'rgb(28, 26, 26)', padding: '20px 0 20px 0' }}>
              {playerLeft?.username}
            </h1>
          </Grid>
          <Grid item md={2} xs={12}>
            <span className="rainbow rainbow_text_animated" style={{ fontSize: '5em', fontWeight: 800, display: 'block', textAlign: 'center' }}>
              VS
            </span>
          </Grid>
          <Grid item md={5} xs={12}>
            <h1 className="player-title" style={{ color: 'red', fontSize: '2em', borderRadius: '20px', backgroundColor: 'rgb(28, 26, 26)', padding: '20px 0 20px 0' }}>
              {playerRight?.username}
            </h1>
          </Grid>
        </Grid>
      ) : (
        <Grid container justifyContent="center" sx={{ paddingTop: '150px' }}>
          <CanvasMobile options={options} playerLeft={playerLeft} playerRight={playerRight} />
        </Grid>
      )}
      {gameResult ? <DisplayEndGameResult gameResult={gameResult} roomId={roomId} /> : ''}
    </React.Fragment>
  );
};

export default InGame;
