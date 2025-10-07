import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

export const GuessNumber = () => {
    const [targetNumber, setTargetNumber] = useState(0);
    const [guess, setGuess] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [maxAttempts] = useState(10);
    const [message, setMessage] = useState("");
    const [gameWon, setGameWon] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState("Easy");

    const getDifficultyRange = () => {
        switch (difficulty) {
            case "Easy":
                return {min: 1, max: 50};
            case "Medium":
                return {min: 1, max: 100};
            case "Hard":
                return {min: 1, max: 200};
            default:
                return {min: 1, max: 50};
        }
    };

    const initializeGame = () => {
        const range = getDifficultyRange();
        setTargetNumber(Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
        setGuess("");
        setAttempts(0);
        setMessage(`I'm thinking of a number between ${range.min} and ${range.max}. Can you guess it?`);
        setGameWon(false);
        setGameOver(false);
    };

    useEffect(() => {
        initializeGame();
    }, [difficulty]);

    const handleGuess = () => {
        const numGuess = parseInt(guess);
        const range = getDifficultyRange();

        if (isNaN(numGuess) || numGuess < range.min || numGuess > range.max) {
            setMessage(`Please enter a valid number between ${range.min} and ${range.max}`);
            return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (numGuess === targetNumber) {
            setGameWon(true);
            setGameOver(true);
            setMessage(`🎉 Congratulations! You guessed it in ${newAttempts} attempts!`);
        } else if (newAttempts >= maxAttempts) {
            setGameOver(true);
            setMessage(`😔 Game over! The number was ${targetNumber}. Better luck next time!`);
        } else {
            const difference = Math.abs(numGuess - targetNumber);
            let hint = "";

            if (difference <= 5) {
                hint = "🔥 Very hot!";
            } else if (difference <= 10) {
                hint = "♨️ Hot!";
            } else if (difference <= 20) {
                hint = "🌡️ Warm";
            } else {
                hint = "❄️ Cold";
            }

            const direction = numGuess < targetNumber ? "higher" : "lower";
            setMessage(`${hint} Try ${direction}! (${maxAttempts - newAttempts} attempts left)`);
        }

        setGuess("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !gameOver) {
            handleGuess();
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[600px]">
            <Card className="w-96 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl gradient-text">Guess the Number</CardTitle>
                    <div className="flex gap-2 justify-center mt-4">
                        {["Easy", "Medium", "Hard"].map((level) => (
                            <Button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                variant={difficulty === level ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                            >
                                {level}
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Range: {getDifficultyRange().min} - {getDifficultyRange().max}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Attempts: {attempts}/{maxAttempts}
                        </p>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-lg text-center min-h-[60px] flex items-center justify-center">
                        <p className="text-sm">{message}</p>
                    </div>

                    {!gameOver && (
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your guess"
                                className="flex-1"
                                min={getDifficultyRange().min}
                                max={getDifficultyRange().max}
                            />
                            <Button onClick={handleGuess} className="bg-primary hover:bg-primary/80" disabled={!guess}>
                                Guess
                            </Button>
                        </div>
                    )}

                    <Button onClick={initializeGame} className="w-full bg-secondary hover:bg-secondary/80">
                        New Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
