import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Bubbles = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);
    const [level, setLevel] = useState(1);

    const gameLoopRef = useRef();
    const bubbleIdRef = useRef(0);

    const GAME_WIDTH = 600;
    const GAME_HEIGHT = 400;
    const BUBBLE_SIZE = 50;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400"];

    // Sound effects
    const playSound = (type) => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "pop") {
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === "gameOver") {
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        }
    };

    // Create bubble
    const createBubble = () => {
        const speed = 0.25 + level * 0.05; // faster fall
        return {
            id: bubbleIdRef.current++,
            letter: letters[Math.floor(Math.random() * letters.length)],
            x: Math.random() * (GAME_WIDTH - BUBBLE_SIZE),
            y: -BUBBLE_SIZE,
            speed: speed + Math.random() * 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    };

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setLevel(1);
        setBubbles([]);
        bubbleIdRef.current = 0;
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameOver(true);
        cancelAnimationFrame(gameLoopRef.current);
        playSound("gameOver");

        toast({
            title: "Game Over!",
            description: `A bubble reached the bottom! Final Score: ${score}`,
            variant: "destructive",
        });
    };

    const handleKeyPress = useCallback(
        (e) => {
            if (!isPlaying || gameOver) return;
            const letter = e.key.toUpperCase();
            if (!letters.includes(letter)) return;

            setBubbles((prev) => {
                const index = prev.findIndex((b) => b.letter === letter);
                if (index !== -1) {
                    const updated = [...prev];
                    updated.splice(index, 1);
                    playSound("pop");
                    setScore((s) => s + 10);
                    return updated;
                }
                return prev;
            });
        },
        [isPlaying, gameOver]
    );

    const gameLoop = useCallback(() => {
        setBubbles((prevBubbles) => {
            const updated = prevBubbles.map((b) => ({...b, y: b.y + b.speed}));

            // End game if any bubble touches the bottom
            if (updated.some((b) => b.y + BUBBLE_SIZE >= GAME_HEIGHT)) {
                endGame();
                return prevBubbles;
            }

            const filtered = updated.filter((b) => b.y < GAME_HEIGHT);

            // Dynamic spawn rate
            const baseSpawnRate = 0.008 + level * 0.001; // slightly higher spawn rate
            if (Math.random() < baseSpawnRate) {
                filtered.push(createBubble());
            }

            return filtered;
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [level]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [isPlaying, gameOver, gameLoop]);

    useEffect(() => {
        if (score > 0 && score % 100 === 0) {
            const newLevel = level + 1;
            setLevel(newLevel);
            setTimeout(() => {
                toast({
                    title: "Level Up!",
                    description: `Level ${newLevel} - Bubbles move faster!`,
                });
            }, 0);
        }
    }, [score]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="flex justify-center items-center min-h-[600px] p-4">
            <Card className="w-full max-w-4xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl gradient-text mb-2 font-['Comfortaa',sans-serif]">
                        🫧 Bubble Type
                    </CardTitle>
                    <div className="flex justify-between items-center text-lg">
                        <p className="font-semibold text-primary">Score: {score}</p>
                        <p className="font-semibold text-secondary-foreground">Level: {level}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        className="relative mx-auto bg-gradient-to-b from-cyan-100 to-blue-300 dark:from-cyan-900 dark:to-blue-800 border-4 border-blue-400 rounded-lg overflow-hidden shadow-inner"
                        style={{width: GAME_WIDTH, height: GAME_HEIGHT}}
                    >
                        {bubbles.map((b) => (
                            <div
                                key={b.id}
                                className={`absolute rounded-full ${b.color} border-2 border-white/50 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse hover:scale-110 transition-transform`}
                                style={{
                                    left: b.x,
                                    top: b.y,
                                    width: BUBBLE_SIZE,
                                    height: BUBBLE_SIZE,
                                }}
                            >
                                {b.letter}
                            </div>
                        ))}

                        {gameOver && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-2 font-['Comfortaa',sans-serif]">
                                        Game Over!
                                    </h3>
                                    <p className="text-lg">Final Score: {score}</p>
                                    <p className="text-lg">Level Reached: {level}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            onClick={startGame}
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-lg px-8 shadow-lg"
                        >
                            {!isPlaying || gameOver ? "🎮 Start Game" : "🔄 Restart"}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-6 space-y-1">
                        <p>Type the letters on the bubbles to pop them before they reach the bottom!</p>
                        <p>Speed increases gradually with each level. 🎈</p>
                        <p className="text-green-500">+10 points per bubble popped</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
