import { Injectable } from '@nestjs/common';
import { Match, ball, player } from './interfaces/pong.interfaces';

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 600;

@Injectable()
export class PongService {
  constructor() {}

  createGameState(): Match {
    return {
      playerLeft: {
        x: 0,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: 'YELLOW',
        score: 0,
      },
      playerRight: {
        x: CANVAS_WIDTH - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: 'GREEN',
        score: 0,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        acceleration: 1.1,
        velocityX: 5,
        velocityY: 5,
        color: 'WHITE',
      },
      intervalId: undefined,
      isFinish: false,
    };
  }
  updateMatch(match: Match): number {
    // moving the this.ball
    match.ball.x += match.ball.velocityX;
    match.ball.y += match.ball.velocityY;

    // this.ball/canvas collision
    if (
      match.ball.y + match.ball.radius > CANVAS_HEIGHT ||
      match.ball.y - match.ball.radius < 0
    ) {
      match.ball.velocityY *= -1;
    }

    // this.ball/players collision
    let player =
      match.ball.x < CANVAS_WIDTH / 2 ? match.playerLeft : match.playerRight;

    if (this.collision(match.ball, player)) {
      match.ball.velocityX *= -1;
      match.ball.velocityX *= match.ball.acceleration;
      match.ball.velocityY *= match.ball.acceleration;
    }

    // update score
    if (match.ball.x + match.ball.radius < 0) {
      match.playerRight.score++;
      this.resetBall(match);
    } else if (match.ball.x - match.ball.radius > CANVAS_WIDTH) {
      match.playerLeft.score++;
      this.resetBall(match);
    }
    // Is Ending Game ?
    if (match.playerLeft.score >= 2) return 1;
    if (match.playerRight.score >= 2) return 2;

    return 0;
  }
  // COMPUTING FUNCTIONS
  collision(b: ball, p: player) {
    const bTop = b.y - b.radius;
    const bBottom = b.y + b.radius;
    const bLeft = b.x - b.radius;
    const bRight = b.x + b.radius;

    const pTop = p.y;
    const pBottom = p.y + p.height;
    const pLeft = p.x;
    const pRight = p.x + p.width;

    // returns true if collision between ball and players'paddle
    return bRight > pLeft && bLeft < pRight && bTop < pBottom && bBottom > pTop;
  }

  resetBall(match: Match) {
    match.ball.x = CANVAS_WIDTH / 2;
    match.ball.y = CANVAS_HEIGHT / 2;

    match.ball.velocityY = 5;
    if (match.ball.velocityX > 0) match.ball.velocityX = -5;
    else match.ball.velocityX = 5;
  }
}
