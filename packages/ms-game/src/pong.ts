import p5 from "p5";
import "./styles.scss";
import { Config } from "./config/Config";
import { Paddle } from "./Paddle";
import { Board } from "./Board";
import { Ball } from "./Ball";
import { Side } from "./Board";
import { AI } from "./AI";
import { loadConfigFromJson } from "./config/ConfigLoader";

let retroFont: p5.Font | null = null;

// Tournament context interface
interface TournamentContext {
  matchId: string;
  tournamentId: string;
  isTournamentMatch: boolean;
  gameServiceUrl: string;
}

// Tournament match data interface
interface TournamentMatchData {
  matchId: string;
  tournamentId: string;
  player1: {
    id: string;
    displayName: string;
    isAI: boolean;
    aiDifficulty?: string;
    userId?: string;
  };
  player2: {
    id: string;
    displayName: string;
    isAI: boolean;
    aiDifficulty?: string;
    userId?: string;
  };
  status: string;
}

const sketch = (p: p5) => {
  const targetFrameRate = 144;

  enum GameState {
    Loading,
    StartScreen,
    Countdown,
    Playing,
    End,
    TournamentSubmitting,
  }

  let gameState: GameState = GameState.Loading;
  let player1: Paddle;
  let player2: Paddle;
  let ball: Ball;
  const textSize: number = Board.diag / 10;
  let countdownStartTime: number = 0;

  //AI variables
  let ai1: AI;
  let ai2: AI;
  let aiUpdateTimer: number = 0;
  let currentTime: number;

  let config: Config;
  let tournamentContext: TournamentContext | null = null;
  let tournamentMatchData: TournamentMatchData | null = null;

  p.preload = () => {
    // Try to load font, but don't fail if it doesn't exist
    try {
      // Use a web-safe fallback font instead of loading external font
      retroFont = null; // Will use default font
    } catch (error) {
      console.warn("Font loading failed, using default font");
      retroFont = null;
    }
  };

  p.setup = async () => {
    const canvas = p.createCanvas(Board.width, Board.height);
    canvas.parent("pong");

    p.frameRate(targetFrameRate);

    // Check for tournament context
    tournamentContext = (window as any).TOURNAMENT_CONTEXT || null;
    
    if (tournamentContext?.isTournamentMatch) {
      console.log('Loading tournament match:', tournamentContext);
      await loadTournamentMatch();
    } else {
      await loadRegularGame();
    }

    gameState = GameState.StartScreen;
  };

  async function loadTournamentMatch() {
    try {
      // Fetch match details from game service API
      const response = await fetch(`/api/tournament/match/${tournamentContext!.matchId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load match details: ${response.status}`);
      }
      
      const result = await response.json();
      tournamentMatchData = result.data;
      
      console.log('Tournament match data loaded:', tournamentMatchData);
      
      // Create config from tournament data
      config = new Config(
        tournamentMatchData.player1.displayName,
        tournamentMatchData.player2.displayName,
        tournamentMatchData.player1.isAI,
        tournamentMatchData.player2.isAI,
        1000 // AI update interval
      );
      
    } catch (error) {
      console.error('Failed to load tournament match:', error);
      // Fallback to regular game
      await loadRegularGame();
    }
    
    // Initialize game objects
    initializeGameObjects();
  }

  async function loadRegularGame() {
    config = await loadConfigFromJson();
    initializeGameObjects();
  }

  function initializeGameObjects() {
    player1 = new Paddle(Board.backBorder, p.height / 2);
    player2 = new Paddle(
      Board.width - Board.backBorder - Paddle.width,
      p.height / 2,
    );
    ball = new Ball();
    
    if (config.player1IsAI) {
      ai1 = new AI(ball, player1, player2);
    }
    if (config.player2IsAI) {
      ai2 = new AI(ball, player2, player1);
    }
    
    aiUpdateTimer = p.millis();
  }

  p.draw = () => {
    p.clear();
    p.background(0);

    if (gameState === GameState.Loading) {
      displayLoadingScreen();
      return;
    }

    if (gameState === GameState.StartScreen) {
      displayStartScreen();
      return;
    }

    if (gameState === GameState.TournamentSubmitting) {
      displaySubmittingScreen();
      return;
    }

    displayGameElements(player1, player2);
    
    if (gameState === GameState.Countdown) {
      displayCountdown();
    }

    player1.update();
    player2.update();

    if (gameState === GameState.Playing) {
      handleAI();
      ball.update();
      handleCollision(player1, player2, ball);
      checkForPoint(player1, player2, ball);
      displayBall(ball);
    }

    checkScore(player1, player2);
    if (gameState === GameState.End) {
      displayWinnerScreen(player1, player2);
    }
  };

  p.keyPressed = () => {
    if (gameState === GameState.StartScreen) {
      if (p.key === " ") {
        gameState = GameState.Countdown;
        countdownStartTime = p.millis();
      }
    }
    if (!config.player1IsAI) {
      switch (p.key) {
        case "a":
        case "A": {
          player1.goUp = true;
          break;
        }
        case "z":
        case "Z": {
          player1.goDown = true;
          break;
        }
      }
    }
    if (!config.player2IsAI) {
      switch (p.keyCode) {
        case p.UP_ARROW: {
          player2.goUp = true;
          break;
        }
        case p.DOWN_ARROW: {
          player2.goDown = true;
          break;
        }
      }
    }
  };

  p.keyReleased = () => {
    if (!config.player1IsAI) {
      switch (p.key) {
        case "a":
        case "A": {
          player1.goUp = false;
          break;
        }
        case "z":
        case "Z": {
          player1.goDown = false;
          break;
        }
      }
    }
    if (!config.player2IsAI) {
      switch (p.keyCode) {
        case p.UP_ARROW: {
          player2.goUp = false;
          break;
        }
        case p.DOWN_ARROW: {
          player2.goDown = false;
          break;
        }
      }
    }
  };

  function displayLoadingScreen() {
    if (retroFont) {
      p.textFont(retroFont);
    }
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.noStroke();
    p.textSize(textSize / 2);
    p.text("Loading Tournament Match...", Board.width / 2, Board.height / 2);
  }

  function displaySubmittingScreen() {
    if (retroFont) {
      p.textFont(retroFont);
    }
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.noStroke();
    p.textSize(textSize / 2);
    p.text("Submitting Results...", Board.width / 2, Board.height / 2);
  }

  function displayPlayerNames() {
    if (retroFont) {
      p.textFont(retroFont);
    }
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(100);
    p.noStroke();
    p.textSize(textSize / 8);
    const textHeight: number = 0.95 * Board.height;
    p.text(config.player1, Board.width / 4, textHeight);
    p.text(config.player2, (3 * Board.width) / 4, textHeight);
  }

  function displayStartScreen() {
    if (retroFont) {
      p.textFont(retroFont);
    }
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.noStroke();
    p.textSize(textSize);
    
    if (tournamentContext?.isTournamentMatch) {
      p.text("TOURNAMENT MATCH", Board.width / 2, Board.height / 2 - textSize);
      p.textSize(textSize / 3);
      p.text(`${config.player1} vs ${config.player2}`, Board.width / 2, Board.height / 2);
      p.text("Press SPACE to Start!", Board.width / 2, Board.height / 2 + textSize / 2);
    } else {
      p.text("PONG", Board.width / 2, Board.height / 2 - textSize / 2);
      p.textSize(textSize / 3);
      p.text("Press SPACE to Start!", Board.width / 2, Board.height / 2 + textSize / 3);
    }
  }

  function displayWinnerScreen(player1: Paddle, player2: Paddle) {
    if (retroFont) {
      p.textFont(retroFont);
    }
    const arrow: string =
      player1.currentScore > player2.currentScore ? "<---" : "--->";
    const winner = player1.currentScore > player2.currentScore ? config.player1 : config.player2;
    
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.noStroke();
    p.textSize(textSize / 2);
    p.text(`${winner} Wins!`, Board.width / 2, Board.height / 2 - textSize / 2);
    p.text(arrow, Board.width / 2, Board.height / 2);
    p.textSize(textSize / 3);
    p.text("Game Over", Board.width / 2, Board.height / 2 + textSize / 3);

    // Auto-submit tournament result if this is a tournament match
    if (tournamentContext?.isTournamentMatch && tournamentMatchData && gameState === GameState.End) {
      submitTournamentResult();
    }
  }

  async function submitTournamentResult() {
    if (!tournamentMatchData || !tournamentContext) return;
    
    gameState = GameState.TournamentSubmitting;
    
    try {
      // Determine winner
      const player1Won = player1.currentScore > player2.currentScore;
      const winnerId = player1Won ? tournamentMatchData.player1.id : tournamentMatchData.player2.id;
      const winnerUserId = player1Won ? tournamentMatchData.player1.userId : tournamentMatchData.player2.userId;

      const resultData = {
        matchId: tournamentMatchData.matchId,
        winnerId: winnerId,
        player1Score: player1.currentScore,
        player2Score: player2.currentScore,
        userId: winnerUserId || 'system' // Fallback for AI matches
      };

      console.log('Submitting tournament result:', resultData);

      const response = await fetch('/api/tournament/match/result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit result: ${response.status}`);
      }

      const result = await response.json();
      console.log('Tournament result submitted successfully:', result);

      // Show success message and redirect
      setTimeout(() => {
        window.location.href = `/tournament/${tournamentMatchData!.tournamentId}`;
      }, 3000);

    } catch (error) {
      console.error('Failed to submit tournament result:', error);
      // Show error and allow manual retry or redirect
      setTimeout(() => {
        window.location.href = `/tournament/${tournamentMatchData!.tournamentId}`;
      }, 5000);
    }
  }

  function displayCountdown() {
    const countdownDuration: number = 4000;

    if (retroFont) {
      p.textFont(retroFont);
    }
    const elapsed = p.millis() - countdownStartTime;
    let count = 3 - Math.floor(elapsed / 1000);
    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();
    p.fill(255);
    p.textSize(textSize);
    if (count > 0) {
      p.text(count.toString(), Board.width / 2, Board.height / 2);
    } else if (elapsed < countdownDuration) {
      p.text("GO!", Board.width / 2, Board.height / 2);
    } else {
      gameState = GameState.Playing;
    }
    return;
  }

  function displayPaddle(paddle: Paddle) {
    p.stroke(255);
    p.fill(255);
    p.rect(paddle.x, paddle.y, Paddle.width, Paddle.height);
  }

  function displayBall(ball: Ball) {
    p.stroke(255);
    p.fill(255);
    p.square(ball.currentX, ball.currentY, 2 * Ball.radius);
  }

  function displayCenterLine() {
    p.stroke(100);
    p.strokeWeight(4);
    p.strokeCap(p.SQUARE);
    p.fill(255);
    const dashLength = (Board.height / 500) * 20;
    const gapLength = (Board.height / 500) * 15;
    const totalSegment = dashLength + gapLength;

    for (let y = 0; y < Board.height; y += totalSegment) {
      const dashEnd = Math.min(y + dashLength, Board.height);
      p.line(Board.width / 2, y, Board.width / 2, dashEnd);
    }
    p.strokeWeight(1);
  }

  function displayScore(player: Paddle, side: Side) {
    if (retroFont) {
      p.textFont(retroFont);
    }
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(100);
    p.noStroke();
    p.textSize(textSize);
    const x_pos: number = -textSize / 4 + Board.width / 4;
    const y_pos: number = Board.height / 4;
    if (side === Side.Left) {
      p.text(player.currentScore, x_pos, y_pos);
    } else if (side === Side.Right) {
      p.text(player.currentScore, Board.width / 2 + x_pos, y_pos);
    }
  }

  function displayGameElements(player1: Paddle, player2: Paddle) {
    displayCenterLine();
    displayScore(player1, Side.Left);
    displayScore(player2, Side.Right);
    displayPaddle(player1);
    displayPaddle(player2);
    displayPlayerNames();
  }

  function handleCollision(player1: Paddle, player2: Paddle, ball: Ball) {
    ball.collisionFromBottomToTop(0);
    ball.collisionFromTopToBottom(Board.height);
    if (
      ball.isInFrontOf(player1.y + Paddle.height, player1.y) &&
      ball.collisionFromRightToLeft(player1.x + Paddle.width)
    ) {
      ball.ballPaddleHit(player1.currentSpeed);
      return;
    }
    if (
      ball.isInFrontOf(player2.y + Paddle.height, player2.y) &&
      ball.collisionFromLeftToRight(player2.x)
    ) {
      ball.ballPaddleHit(player2.currentSpeed);
      return;
    }
  }

  function checkForPoint(player1: Paddle, player2: Paddle, ball: Ball) {
    if (ball.currentX <= 0) {
      ball.reset(Side.Left);
      player2.scoreUp();
    } else if (ball.currentX + 2 * Ball.radius >= Board.width) {
      ball.reset(Side.Right);
      player1.scoreUp();
    }
  }

  function checkScore(player1: Paddle, player2: Paddle) {
    if (player1.currentScore < 3 && player2.currentScore < 3) return;
    if (Math.abs(player1.currentScore - player2.currentScore) >= 2) {
      gameState = GameState.End;
    }
  }

  function handleAI() {
    currentTime = p.millis();
    if (currentTime - aiUpdateTimer >= config.aiUpdateInterval) {
      if (ai1) {
        ai1.predict(ball);
      }
      if (ai2) {
        ai2.predict(ball);
      }
      aiUpdateTimer = currentTime;
    }

    if (ai1) {
      ai1.movePaddle();
    }
    if (ai2) {
      ai2.movePaddle();
    }
  }
};

new p5(sketch, document.getElementById("app") as HTMLElement);
