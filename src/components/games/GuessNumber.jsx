import React, {useState, useEffect, useCallback, useRef} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils"; // Assuming you have a utility for class concatenation

// --- NEW: CSS animations are defined here as a string ---
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(10px); }
  }
  @keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0.7); }
    70% { transform: scale(1.02); box-shadow: 0 0 15px rgba(255,255,255,0.3); }
    100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0.7); }
  }
  @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
`;

export const GuessNumber = () => {
    const [targetNumber, setTargetNumber] = useState(0);
    const [guess, setGuess] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [maxAttempts] = useState(10);
    const [message, setMessage] = useState("");
    const [gameWon, setGameWon] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [difficulty, setDifficulty] = useState("Medium"); // Default to Medium
    const [previousGuesses, setPreviousGuesses] = useState([]); // To show history
    const inputRef = useRef(null); // Ref for input focus

    const getDifficultyRange = useCallback(() => {
        switch (difficulty) {
            case "Easy":
                return {min: 1, max: 20}; // Adjusted for easier play
            case "Medium":
                return {min: 1, max: 50};
            case "Hard":
                return {min: 1, max: 100};
            default:
                return {min: 1, max: 50};
        }
    }, [difficulty]); // Memoize based on difficulty

    const initializeGame = useCallback(() => {
        const range = getDifficultyRange();
        setTargetNumber(Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
        setGuess("");
        setAttempts(0);
        setMessage(`I'm thinking of a number between ${range.min} and ${range.max}.`);
        setGameWon(false);
        setGameOver(false);
        setPreviousGuesses([]);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [getDifficultyRange]);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]); // Depend on initializeGame to re-run when difficulty changes

    const handleGuess = () => {
        const numGuess = parseInt(guess);
        const range = getDifficultyRange();

        if (isNaN(numGuess) || numGuess < range.min || numGuess > range.max) {
            setMessage(`⛔ Please enter a valid number between ${range.min} and ${range.max}.`);
            return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPreviousGuesses((prev) => [...prev, numGuess]); // Add guess to history

        if (numGuess === targetNumber) {
            setGameWon(true);
            setGameOver(true);
            setMessage(`🎉 Congratulations! You guessed the number ${targetNumber} in ${newAttempts} attempts!`);
        } else if (newAttempts >= maxAttempts) {
            setGameOver(true);
            setMessage(`😔 Game over! The number was ${targetNumber}.`);
        } else {
            const difference = Math.abs(numGuess - targetNumber);
            let hint = "";

            if (difference <= 3) {
                // Tighter range for hot/cold
                hint = "🔥 Very Hot!";
            } else if (difference <= 7) {
                hint = "♨️ Hot!";
            } else if (difference <= 15) {
                hint = "🌡️ Warm";
            } else {
                hint = "🧊 Cold";
            }

            const direction = numGuess < targetNumber ? "higher" : "lower";
            setMessage(`${hint} Try ${direction}! (${maxAttempts - newAttempts} attempts left)`);
        }

        setGuess("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !gameOver && guess) {
            // Only allow if there's a guess
            handleGuess();
        }
    };

    const Confetti = () => {
        const colors = ["#fde047", "#f87171", "#a78bfa", "#34d399", "#60a5fa"];
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({length: 50}).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                            left: `${Math.random() * 100}%`,
                            animation: `confetti-fall ${2 + Math.random() * 3}s ease-out forwards infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0,
                        }}
                    ></div>
                ))}
            </div>
        );
    };

    const getMessageColor = () => {
        if (gameWon) return "text-green-400";
        if (gameOver) return "text-red-400";
        if (message.includes("Very Hot")) return "text-red-300";
        if (message.includes("Hot")) return "text-orange-300";
        if (message.includes("Warm")) return "text-yellow-300";
        if (message.includes("Cold")) return "text-blue-300";
        if (message.includes("Please enter a valid number")) return "text-yellow-300";
        return "text-white/80";
    };

    return (
        <div className="relative flex justify-center items-center min-h-[100vh] w-full bg-gradient-to-br from-[#1a202c] to-[#2d3748] p-4 font-sans">
            <style>{animationStyles}</style> {/* Injecting our custom animations */}
            {gameWon && <Confetti />}
            <Card className="w-96 bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl shadow-purple-500/20 relative z-10">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
                        Guess the Number
                    </CardTitle>
                    <p className="text-white/70 text-sm">Mind game challenge!</p>
                    <div className="flex gap-2 justify-center mt-4">
                        {["Easy", "Medium", "Hard"].map((level) => (
                            <Button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                variant={difficulty === level ? "default" : "outline"}
                                className={cn(
                                    "text-xs px-4 py-2 transition-all duration-200",
                                    difficulty === level
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                        : "bg-transparent text-white/70 border-white/20 hover:bg-white/10"
                                )}
                            >
                                {level}
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center text-white/70 text-lg flex justify-between px-2">
                        <span>
                            Attempts:{" "}
                            <span className="font-semibold text-white">
                                {attempts}/{maxAttempts}
                            </span>
                        </span>
                        <span>
                            Range:{" "}
                            <span className="font-semibold text-white">
                                {getDifficultyRange().min}-{getDifficultyRange().max}
                            </span>
                        </span>
                    </div>

                    <div
                        className={cn(
                            "bg-black/20 p-4 rounded-xl text-center min-h-[80px] flex flex-col items-center justify-center transition-colors duration-300 animate-[fadeIn_0.3s_ease-out]",
                            gameWon && "border-2 border-green-500 shadow-lg shadow-green-500/20",
                            gameOver && !gameWon && "border-2 border-red-500 shadow-lg shadow-red-500/20"
                        )}
                    >
                        <p className={cn("text-lg font-medium", getMessageColor(), "transition-colors duration-300")}>
                            {message}
                        </p>
                    </div>

                    {!gameOver ? (
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                type="number"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Enter guess (${getDifficultyRange().min}-${getDifficultyRange().max})`}
                                className="flex-1 bg-white/10 text-white placeholder:text-white/50 border-white/20 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 text-base py-2 rounded-lg"
                                min={getDifficultyRange().min}
                                max={getDifficultyRange().max}
                            />
                            <Button
                                onClick={handleGuess}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all duration-200"
                                disabled={!guess || isNaN(parseInt(guess))}
                            >
                                Guess
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-3">
                            {gameWon && (
                                <p className="text-white/70 text-sm italic">
                                    The number was: <span className="font-bold text-yellow-400">{targetNumber}</span>
                                </p>
                            )}
                            {!gameWon && (
                                <p className="text-white/70 text-sm italic">
                                    The number was: <span className="font-bold text-red-400">{targetNumber}</span>
                                </p>
                            )}
                        </div>
                    )}

                    <Button
                        onClick={initializeGame}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold text-lg py-3 rounded-lg shadow-md transition-all duration-200"
                    >
                        {gameOver ? "Play Again" : "Reset Game"}
                    </Button>

                    {previousGuesses.length > 0 && !gameWon && (
                        <div className="mt-6 text-center text-white/60 text-sm">
                            <p className="font-semibold mb-2">Your Guesses:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {previousGuesses.map((g, index) => (
                                    <span
                                        key={index}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-mono",
                                            g === targetNumber
                                                ? "bg-green-500 text-white"
                                                : Math.abs(g - targetNumber) <= 5
                                                ? "bg-red-600 text-white"
                                                : Math.abs(g - targetNumber) <= 10
                                                ? "bg-orange-500 text-white"
                                                : Math.abs(g - targetNumber) <= 20
                                                ? "bg-yellow-500 text-black"
                                                : "bg-blue-600 text-white"
                                        )}
                                    >
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
