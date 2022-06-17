import { MutableRefObject, useContext, useLayoutEffect, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { UserContext } from '../../Contexts/userContext';
import '../../CSS/rainbow.css';
import React from 'react';
import '../../CSS/neon-shadow.css'

const CANVAS_WIDTH = 600;

const PADDING = 0.5;
const RATIO = 2 / 3;

type Props = {
  options: Options;
};

type ball = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  color: string;
};

type player = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  score: number;
};

export interface Options {
  doubleBall: boolean;
  paddle: boolean;
}

export type Match = {
  playerLeft: player;
  playerRight: player;
  ball: ball;
  ballBonus: ball;
  intervalId: undefined;
  isFinish: false;
  options: Options;
};

const Canvas = (props: Props) => {
  const { options } = props;
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  // cvs = canvas
  const cvs = useRef() as MutableRefObject<HTMLCanvasElement>;
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  var ratio: number = (screenWidth * PADDING) / CANVAS_WIDTH;
  var paddleHeight = (screenWidth * PADDING * RATIO) / 4;
  var paddleWidth = (screenWidth * PADDING) / 100;
  var ballRadius = (screenWidth * PADDING) / 100;

  useEffect(() => {
    ratio = (((screenWidth * PADDING) / CANVAS_WIDTH) * 100) / 100;
  }, [screenWidth]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth != screenWidth) {
        const timer = setTimeout(() => {
          setScreenWidth(window.innerWidth);
        }, 500);
        clearTimeout(timer);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    // ctx = context
    const ctx = cvs.current.getContext('2d') as CanvasRenderingContext2D;

    // OBJECTS TO RENDER
    const playerLeft = {
      x: 0,
      y: cvs.current.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      color: 'WHITE',
      score: 0
    };

    // my opponenent's paddle
    const playerRight = {
      x: cvs.current.width - paddleWidth,
      y: cvs.current.height / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      color: 'WHITE',
      score: 0
    };

    // the ball
    const ball = {
      x: cvs.current.width / 2,
      y: cvs.current.height / 2,
      radius: ballRadius,
      speed: 1.1,
      velocityX: 5,
      velocityY: 5,
      color: 'WHITE'
    };

    const ballBonus = {
      x: cvs.current.width / 2,
      y: cvs.current.height / 2,
      radius: ballRadius,
      speed: 1.1,
      velocityX: -5,
      velocityY: -5,
      color: 'YELLOW'
    };

    // the net
    const net = {
      x: ctx.canvas.width / 2,
      y: 0,
      width: 2,
      height: 10,
      color: 'WHITE'
    };

    // DRAWING FUNCTIONS
    function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }

    function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
      // ctx.drawImage(image, x - (radius * 10) / 2, y - (radius * 10) / 3, radius * 10, radius * 10);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }

    function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
      ctx.fillStyle = color;
      ctx.font = '45px arial';
      ctx.fillText(text, x, y);
    }

    function drawNet(ctx: CanvasRenderingContext2D) {
      for (let i = 0; i <= ctx.canvas.height; i += 15) {
        drawRect(ctx, net.x, net.y + i, net.width, net.height, net.color);
      }
    }

    // UPDATE

    // LISTEN TO MY OWN MOUSE MOVEMENTS AND SEND UPDATE TO BACKEND
    cvs.current.addEventListener('mousemove', movePaddle);

    function movePaddle(e: MouseEvent) {
      var rect = ctx.canvas.getBoundingClientRect();
      if ((e.clientY as unknown as string) !== 'undefined') {
        sockContext.socketPong.emit('mouseMoved', Math.round((e.clientY - rect.top - paddleHeight / 2) / ratio));
      }
    }

    // LISTEN FOR UPDATES FROM BACKEND

    function update(match: Match) {
      // update ball
      ball.x = match.ball.x * ratio;
      ball.y = match.ball.y * ratio;

      // update Bonus Ball
      if (match.options.doubleBall === true) {
        ballBonus.x = match.ballBonus.x * ratio;
        ballBonus.y = match.ballBonus.y * ratio;
      }
      //update score
      playerLeft.score = match.playerLeft.score;
      playerRight.score = match.playerRight.score;

      // update players
      playerLeft.x = match.playerLeft.x * ratio;
      playerLeft.y = match.playerLeft.y * ratio;
      playerRight.x = match.playerRight.x * ratio + paddleWidth / 2 + 1;
      playerRight.y = match.playerRight.y * ratio;

      playerLeft.color = match.playerLeft.color;
      playerRight.color = match.playerRight.color;
      // draw(ctx: CanvasRenderingContext2D);

      playerLeft.height = match.playerLeft.height * ratio;
      playerRight.height = match.playerRight.height * ratio;
    }
    sockContext.socketPong.on('matchUpdate', update);

    // RENDERING FUNCTIONS
    function draw() {
      // background
      drawRect(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height, 'BLACK');

      // my paddle and opp's paddle
      drawRect(ctx, playerLeft.x, playerLeft.y, playerLeft.width, playerLeft.height, playerLeft.color);
      drawRect(ctx, playerRight.x, playerRight.y, playerRight.width, playerRight.height, playerRight.color);

      // ball
      drawBall(ctx, ball.x, ball.y, ball.radius, ball.color);
      if (options.doubleBall) {
        drawBall(ctx, ballBonus.x, ballBonus.y, ballBonus.radius, ballBonus.color);
      }
      // score (mine and opp)
      drawText(ctx, playerLeft.score.toString(), ctx.canvas.width / 4, ctx.canvas.height / 5, 'GREEN');
      drawText(ctx, playerRight.score.toString(), (3 * ctx.canvas.width) / 4, ctx.canvas.height / 5, 'RED');

      // net
      drawNet(ctx);
    }

    const interval = setInterval(() => {
      draw();
    }, 20);
    return () => {
      clearInterval(interval);
      sockContext.socketPong.off('matchUpdate');
    };
  }, [sockContext.socketPong, screenWidth]);

  return (
    <React.Fragment>
      <canvas ref={cvs} height={screenWidth * PADDING * RATIO} width={screenWidth * PADDING} id="canvas-game" className='neon-shadow'/>
    </React.Fragment>
  );
};

export default Canvas;
