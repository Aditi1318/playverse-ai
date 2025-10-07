import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

// Create AudioContext once outside the component to avoid re-creation on re-renders
const audioContext = typeof window !== "undefined" ? new (window.AudioContext || window.webkitAudioContext)() : null;

// --- NEW: CSS animations are defined here as a string ---
// We will inject this into the document head using a <style> tag.
const animationStyles = `
  @keyframes pop-in {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  @keyframes draw-line {
      0% {
          transform-origin: left;
          transform: scaleX(0);
      }
      100% {
          transform-origin: left;
          transform: scaleX(1);
      }
  }
  @keyframes draw-line-diag {
      0% {
          transform-origin: center;
          transform: scale(0) rotate(45deg);
      }
      100% {
          transform-origin: center;
          transform: scale(1) rotate(45deg);
      }
  }
    @keyframes draw-line-diag-rev {
      0% {
          transform-origin: center;
          transform: scale(0) rotate(-45deg);
      }
      100% {
          transform-origin: center;
          transform: scale(1) rotate(-45deg);
      }
  }
`;

export const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [winningCombo, setWinningCombo] = useState([]);

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
    ];

    const playSound = (type) => {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === "move") {
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }

        if (type === "win") {
            const now = audioContext.currentTime;
            gainNode.gain.setValueAtTime(0.3, now);
            oscillator.frequency.setValueAtTime(523.25, now);
            oscillator.frequency.setValueAtTime(659.26, now + 0.1);
            oscillator.frequency.setValueAtTime(783.99, now + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            oscillator.start(now);
            oscillator.stop(now + 0.4);
        }
    };

    const checkWinner = (currentBoard) => {
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return {winner: currentBoard[a], combo: combo};
            }
        }
        return {winner: null, combo: []};
    };

    const handleClick = (index) => {
        if (board[index] || gameOver) return;

        playSound("move");
        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const {winner: gameWinner, combo: winningLine} = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            setWinningCombo(winningLine);
            setGameOver(true);
            playSound("win");
        } else if (newBoard.every((cell) => cell !== null)) {
            setGameOver(true);
        } else {
            setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setGameOver(false);
        setWinningCombo([]);
    };

    const getWinningLineClass = () => {
        if (!winner) return "";
        const comboStr = winningCombo.toString();

        // Base class for the line styling
        let baseClass = "absolute bg-yellow-400 h-1.5 rounded-full";

        // Using Tailwind's arbitrary values to apply the animations we defined in the <style> tag.
        switch (comboStr) {
            case "0,1,2":
                return `${baseClass} w-full top-[16.6%] left-0 animate-[draw-line_0.5s_ease-out_forwards]`;
            case "3,4,5":
                return `${baseClass} w-full top-[50%] left-0 -translate-y-1/2 animate-[draw-line_0.5s_ease-out_forwards]`;
            case "6,7,8":
                return `${baseClass} w-full top-[83.3%] left-0 animate-[draw-line_0.5s_ease-out_forwards]`;
            case "0,3,6":
                return `${baseClass} h-full w-1.5 top-0 left-[16.6%] animate-[draw-line_0.5s_ease-out_forwards] [transform-origin:top] [transform:scaleY(0)] animate-fill-mode-forwards [animation-name:draw-line-y]`;
            case "1,4,7":
                return `${baseClass} h-full w-1.5 top-0 left-[50%] -translate-x-1/2 animate-[draw-line_0.5s_ease-out_forwards] [transform-origin:top] [transform:scaleY(0)] animate-fill-mode-forwards [animation-name:draw-line-y]`;
            case "2,5,8":
                return `${baseClass} h-full w-1.5 top-0 left-[83.3%] animate-[draw-line_0.5s_ease-out_forwards] [transform-origin:top] [transform:scaleY(0)] animate-fill-mode-forwards [animation-name:draw-line-y]`;
            case "0,4,8":
                return `${baseClass} w-[120%] top-1/2 left-[-10%] animate-[draw-line-diag_0.5s_ease-out_forwards]`;
            case "2,4,6":
                return `${baseClass} w-[120%] top-1/2 left-[-10%] animate-[draw-line-diag-rev_0.5s_ease-out_forwards]`;
            default:
                return "";
        }
    };

    const getStatusMessage = () => {
        if (winner) {
            return <p className="text-yellow-400 font-bold text-2xl animate-bounce">Player {winner} wins! 🎉</p>;
        }
        if (gameOver && !winner) {
            return <p className="text-gray-400 font-semibold text-xl">It's a tie! 🤝</p>;
        }
        return (
            <p className="text-lg text-white">
                Turn:{" "}
                <span className={`font-bold ${currentPlayer === "X" ? "text-cyan-400" : "text-pink-400"}`}>
                    {currentPlayer}
                </span>
            </p>
        );
    };

    return (
        // Add the style tag here to inject our keyframes into the document
        <div className="flex justify-center items-center min-h-[600px] w-full bg-gradient-to-br from-[#1a202c] to-[#2d3748]">
            <style>{animationStyles}</style>
            <Card className="w-96 bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl shadow-cyan-500/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 pb-2">
                        Tic Tac Toe
                    </CardTitle>
                    <div className="h-12 flex items-center justify-center">{getStatusMessage()}</div>
                </CardHeader>
                <CardContent>
                    <div className="relative grid grid-cols-3 gap-3 p-3 bg-white/5 rounded-lg">
                        {board.map((cell, index) => (
                            <button
                                key={index}
                                onClick={() => handleClick(index)}
                                className="w-24 h-24 bg-black/20 rounded-lg flex items-center justify-center text-5xl font-extrabold transition-all duration-300 hover:bg-white/10"
                                disabled={!!cell || gameOver}
                            >
                                {cell && (
                                    // Using Tailwind's arbitrary value syntax to apply the animation
                                    <span
                                        className={`${
                                            cell === "X" ? "text-cyan-400" : "text-pink-400"
                                        } animate-[pop-in_0.3s_ease-out_forwards]`}
                                    >
                                        {cell}
                                    </span>
                                )}
                            </button>
                        ))}
                        {winner && <div className={getWinningLineClass()}></div>}
                    </div>

                    {gameOver && (
                        // Using Tailwind's arbitrary value syntax to apply the animation
                        <Button
                            onClick={resetGame}
                            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold text-lg py-6 transition-transform hover:scale-105 animate-[pop-in_0.5s_ease-out_forwards]"
                        >
                            Play Again
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
