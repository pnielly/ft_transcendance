import { useState } from 'react';
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { UserContext } from '../../Contexts/userContext';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;

type Props = {};

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

export type Match = {
  playerLeft: player;
  playerRight: player;
  ball: ball;
};

const Canvas = (props: Props) => {
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  // cvs = canvas
  const cvs = useRef() as MutableRefObject<HTMLCanvasElement>;
  const image = new Image();
  image.src = me.avatar;
  useEffect(() => {
    // ctx = context
    const ctx = cvs.current.getContext('2d') as CanvasRenderingContext2D;

    // OBJECTS TO RENDER
    const playerLeft = {
      x: 0,
      y: cvs.current.height / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: 'WHITE',
      score: 0
    };

    // my opponenent's paddle
    const playerRight = {
      x: cvs.current.width - PADDLE_WIDTH,
      y: cvs.current.height / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      color: 'WHITE',
      score: 0
    };

    // the ball
    const ball = {
      x: cvs.current.width / 2,
      y: cvs.current.height / 2,
      radius: BALL_RADIUS,
      speed: 1.1,
      velocityX: 5,
      velocityY: 5,
      color: 'WHITE'
    };

    // the net
    const net = {
      x: cvs.current.width / 2,
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
      ctx.drawImage(image, x - (radius * 10) / 2, y - (radius * 10) / 3, radius * 10, radius * 10);
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
      for (let i = 0; i <= cvs.current.height; i += 15) {
        drawRect(ctx, net.x, net.y + i, net.width, net.height, net.color);
      }
    }

    // UPDATE

    // LISTEN TO MY OWN MOUSE MOVEMENTS AND SEND UPDATE TO BACKEND
    cvs.current.addEventListener('mousemove', movePaddle);

    function movePaddle(e: MouseEvent) {
      if ((e.clientY as unknown as string) !== 'undefined') {
        sockContext.socketPong.emit('mouseMoved', e.clientY - PADDLE_HEIGHT);
      }
    }

    // LISTEN FOR UPDATES FROM BACKEND

    function update(match: Match) {
      // update ball
      ball.x = match.ball.x;
      ball.y = match.ball.y;

      //update score
      playerLeft.score = match.playerLeft.score;
      playerRight.score = match.playerRight.score;

      // update players
      playerLeft.x = match.playerLeft.x;
      playerLeft.y = match.playerLeft.y;
      playerRight.x = match.playerRight.x;
      playerRight.y = match.playerRight.y;

      playerLeft.color = match.playerLeft.color;
      playerRight.color = match.playerRight.color;
      // draw(ctx: CanvasRenderingContext2D);
    }
    sockContext.socketPong.on('matchUpdate', update);
    // RENDERING FUNCTIONS
    function draw() {
      // background
      drawRect(ctx, 0, 0, cvs.current.width, cvs.current.height, 'BLACK');

      // my paddle and opp's paddle
      drawRect(ctx, playerLeft.x, playerLeft.y, playerLeft.width, playerLeft.height, playerLeft.color);
      drawRect(ctx, playerRight.x, playerRight.y, playerRight.width, playerRight.height, playerRight.color);

      // ball
      drawBall(ctx, ball.x, ball.y, ball.radius, ball.color);

      // score (mine and opp)
      drawText(ctx, playerLeft.score.toString(), cvs.current.width / 4, cvs.current.height / 5, 'WHITE');
      drawText(ctx, playerRight.score.toString(), (3 * cvs.current.width) / 4, cvs.current.height / 5, 'WHITE');

      // net
      drawNet(ctx);
    }

    const interval = setInterval(() => {
      draw();
    }, 20);
    return () => clearInterval(interval);
  }, [sockContext.socketPong]);

  return (
    <div>
      <canvas ref={cvs} height={400} width={600} />
    </div>
  );
};

export default Canvas;
