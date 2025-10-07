import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

export const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);

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
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === "move") {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }

        if (type === "win") {
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.6);
        }
    };

    const checkWinner = (board) => {
        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const handleClick = (index) => {
        if (board[index] || winner || gameOver) return;

        playSound("move");
        const newBoard = [...board];
        newBoard[index] = currentPlayer;
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
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
    };

    return (
        <div className="flex justify-center items-center min-h-[600px]">
            <Card className="w-96 bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl gradient-text font-['Comfortaa',sans-serif]">Tic Tac Toe</CardTitle>
                    {!gameOver && <p className="text-muted-foreground">Player {currentPlayer}'s turn</p>}
                    {winner && <p className="text-green-500 font-semibold animate-bounce">Player {winner} wins! 🎉</p>}
                    {gameOver && !winner && <p className="text-yellow-500 font-semibold">It's a tie! 🤝</p>}
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {board.map((cell, index) => (
                            <button
                                key={index}
                                onClick={() => handleClick(index)}
                                className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/70 hover:from-secondary/80 hover:to-secondary/50 border-2 border-border rounded-lg text-2xl font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                                disabled={!!cell || gameOver}
                            >
                                {cell && (
                                    <span className={cell === "X" ? "text-blue-500" : "text-red-500"}>{cell}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={resetGame}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 shadow-lg"
                    >
                        New Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
