import { Board, checkWinner, getAvailableMoves, type Player } from "./logic";

type MessageCategory =
  | "game_start"
  | "player_good_move"
  | "player_bad_move"
  | "bot_winning"
  | "bot_losing"
  | "bot_wins"
  | "player_wins"
  | "draw"
  | "thinking"
  | "after_player_move";

const messages: Record<MessageCategory, string[]> = {
  game_start: [
    "Ready to lose? 😏",
    "Let's see what you've got!",
    "I've been training for this moment...",
    "You go first. I'm generous like that.",
  ],
  player_good_move: [
    "Hmm, not bad... not bad at all.",
    "Okay, you actually know what you're doing.",
    "Lucky move! 🍀",
    "I see you. Interesting strategy...",
  ],
  player_bad_move: [
    "Are you sure about that? 😂",
    "Oh no... I mean, great move! 😈",
    "That's exactly where I wanted you to go.",
    "My grandma plays better than this!",
  ],
  bot_winning: [
    "I can see the finish line! 🏁",
    "This is almost too easy...",
    "You're walking right into my trap!",
    "GG incoming... 💀",
  ],
  bot_losing: [
    "Wait, hold on... let me recalculate.",
    "Okay, I'll admit you're good.",
    "This wasn't supposed to happen! 😰",
    "Can we start over? Asking for a friend.",
  ],
  bot_wins: [
    "Better luck next time! 🏆",
    "GG! I am the champion! 🎉",
    "Don't feel bad, I'm literally a computer.",
    "Rematch? I promise I'll go easy... maybe.",
  ],
  player_wins: [
    "Impossible! How did you...?! 😱",
    "Okay, you got me. Well played! 👏",
    "I demand a rematch immediately!",
    "You're better than I expected! 🤝",
  ],
  draw: [
    "A draw? I'll take it... this time.",
    "Perfectly balanced, as all things should be.",
    "You're tougher than I thought! 🤝",
    "Neither of us loses. How boring! 😄",
  ],
  thinking: [
    "Hmm, let me think...",
    "Calculating optimal move...",
    "Processing... 🤔",
    "One moment, genius at work...",
  ],
  after_player_move: [
    "Interesting choice... let me respond.",
    "Good move! Now it's my turn.",
    "I see what you did there...",
    "Challenge accepted!",
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function analyzePlayerMove(board: Board, moveIndex: number, humanPlayer: Player, aiPlayer: Player): MessageCategory {
  const boardCopy = [...board];

  // Check if player is about to win
  const movesLeft = getAvailableMoves(boardCopy);
  let playerCanWinNext = false;
  for (const move of movesLeft) {
    boardCopy[move] = humanPlayer;
    if (checkWinner(boardCopy).winner === humanPlayer) {
      playerCanWinNext = true;
    }
    boardCopy[move] = null;
  }

  if (playerCanWinNext) return "bot_losing";

  // Check if bot is in a strong position
  let botCanWinNext = false;
  for (const move of movesLeft) {
    boardCopy[move] = aiPlayer;
    if (checkWinner(boardCopy).winner === aiPlayer) {
      botCanWinNext = true;
    }
    boardCopy[move] = null;
  }

  if (botCanWinNext) return "bot_winning";

  // Check if center or corner (generally good moves)
  const goodMoves = [0, 2, 4, 6, 8];
  if (goodMoves.includes(moveIndex)) return "player_good_move";

  return "player_bad_move";
}

export function getBotMessage(
  category: MessageCategory
): string;
export function getBotMessage(
  category: "after_player_move",
  board: Board,
  moveIndex: number,
  humanPlayer: Player,
  aiPlayer: Player
): string;
export function getBotMessage(
  category: MessageCategory | "after_player_move",
  board?: Board,
  moveIndex?: number,
  humanPlayer?: Player,
  aiPlayer?: Player
): string {
  if (category === "after_player_move" && board && moveIndex !== undefined && humanPlayer && aiPlayer) {
    const analyzed = analyzePlayerMove(board, moveIndex, humanPlayer, aiPlayer);
    return pickRandom(messages[analyzed]);
  }

  if (category !== "after_player_move") {
    return pickRandom(messages[category]);
  }

  return pickRandom(messages.thinking);
}
