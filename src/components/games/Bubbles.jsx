import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Bubbles = () => {
    // --- STATE & REFS ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);
    const [level, setLevel] = useState(1);
    const [gameSize, setGameSize] = useState({width: 600, height: 400});

    const gameLoopRef = useRef(null);
    const gameContainerRef = useRef(null);
    const bubbleIdRef = useRef(0);
    const audioCtxRef = useRef(null);

    // --- CONSTANTS & DERIVED VALUES ---
    const bubbleSize = gameSize.width / 12;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400"];

    // --- SOUND FUNCTION ---
    const playSound = useCallback((type) => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // ... sound logic from previous step
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        switch (type) {
            case "pop": {
                const randomFreq = 600 + Math.random() * 600;
                osc.type = "sine";
                gain.gain.setValueAtTime(0.4, now);
                osc.frequency.setValueAtTime(randomFreq, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }
            case "levelUp": {
                const notes = [523.25, 659.25, 783.99, 1046.5];
                osc.type = "triangle";
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
                notes.forEach((freq, i) => {
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                });
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            }
            case "start": {
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            }
            case "gameOver": {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            }
            default:
                break;
        }
    }, []);

    // --- GAME LOGIC ---

    const startGame = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        playSound("start");
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setLevel(1);
        setBubbles([]);
        bubbleIdRef.current = 0;
    };

    const endGame = useCallback(() => {
        if (gameOver) return;
        setIsPlaying(false);
        setGameOver(true);
        playSound("gameOver");
        toast({
            title: "Game Over!",
            description: `A bubble reached the bottom! Final Score: ${score}`,
            variant: "destructive",
        });
    }, [score, gameOver, playSound]);

    const createBubble = useCallback(() => {
        const speed = 0.25 + level * 0.05;
        return {
            id: bubbleIdRef.current++,
            letter: letters[Math.floor(Math.random() * letters.length)],
            x: Math.random() * (gameSize.width - bubbleSize),
            y: -bubbleSize,
            speed: speed + Math.random() * 0.1,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    }, [level, gameSize.width, bubbleSize]);

    // MODIFIED/FIXED: The main game loop function
    const gameLoop = useCallback(() => {
        // THIS IS THE FIX: This guard clause ensures the loop only runs when the game is active.
        if (!isPlaying || gameOver) {
            return;
        }

        setBubbles((prevBubbles) => {
            const updated = prevBubbles.map((b) => ({...b, y: b.y + b.speed}));
            if (updated.some((b) => b.y + bubbleSize >= gameSize.height)) {
                endGame();
                return prevBubbles;
            }
            const filtered = updated.filter((b) => b.y < gameSize.height);
            const baseSpawnRate = 0.008 + level * 0.001;
            if (Math.random() < baseSpawnRate) {
                filtered.push(createBubble());
            }
            return filtered;
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, gameOver, level, gameSize.height, bubbleSize, createBubble, endGame]); // MODIFIED: Added gameOver to dependency array

    const handleKeyPress = useCallback(
        (e) => {
            if (!isPlaying || gameOver) return;
            const letter = e.key.toUpperCase();
            if (!letters.includes(letter)) return;
            setBubbles((prev) => {
                const index = prev.findIndex((b) => b.letter === letter);
                if (index !== -1) {
                    playSound("pop");
                    const updated = [...prev];
                    updated.splice(index, 1);
                    setScore((s) => s + 10);
                    return updated;
                }
                return prev;
            });
        },
        [isPlaying, gameOver, playSound]
    );

    // --- EFFECTS ---

    useEffect(() => {
        const container = gameContainerRef.current;
        if (!container) return;
        const updateSize = () => {
            setGameSize({width: container.offsetWidth, height: container.offsetHeight});
        };
        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // This effect now correctly starts and stops the loop
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            cancelAnimationFrame(gameLoopRef.current);
        }
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [isPlaying, gameOver, gameLoop]);

    useEffect(() => {
        if (score > 0 && score % 100 === 0) {
            const newLevel = Math.floor(score / 100) + 1;
            if (newLevel > level) {
                setLevel(newLevel);
                playSound("levelUp");
                toast({title: `Level Up to ${newLevel}!`, description: "Bubbles are now faster!"});
            }
        }
    }, [score, level, playSound]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    // --- JSX (No changes) ---
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 p-2 sm:p-4 font-sans antialiased">
            <Card className="w-full max-w-4xl bg-card/70 backdrop-blur-lg shadow-2xl border border-primary/20 rounded-xl p-4 sm:p-6 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl sm:text-3xl gradient-text mb-3 font-['Comfortaa',sans-serif]">
                        🫧 Bubble Type
                    </CardTitle>
                    <div className="flex justify-around items-center text-base sm:text-lg">
                        <p className="font-semibold text-primary-foreground text-xl drop-shadow-md">Score: {score}</p>
                        <p className="font-semibold text-primary-foreground text-xl drop-shadow-md">Level: {level}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        ref={gameContainerRef}
                        className="relative w-full max-w-[600px] mx-auto aspect-[3/2] bg-gradient-to-b from-cyan-100 to-blue-300 dark:from-cyan-900 dark:to-blue-800 border-4 border-blue-400 rounded-lg overflow-hidden shadow-inner"
                    >
                        {bubbles.map((b) => (
                            <div
                                key={b.id}
                                className={`absolute rounded-full ${b.color} border-2 border-white/50 flex items-center justify-center text-white font-bold shadow-lg transition-transform duration-100 ease-in-out`}
                                style={{
                                    left: b.x,
                                    top: b.y,
                                    width: bubbleSize,
                                    height: bubbleSize,
                                    fontSize: `${bubbleSize * 0.5}px`,
                                }}
                            >
                                {b.letter}
                            </div>
                        ))}
                        {gameOver && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm animate-fade-in">
                                <div className="text-center text-white p-4">
                                    <h3 className="text-xl sm:text-2xl font-bold mb-2 font-['Comfortaa',sans-serif]">
                                        Game Over!
                                    </h3>
                                    <p className="text-base sm:text-lg">Final Score: {score}</p>
                                    <p className="text-base sm:text-lg">Level Reached: {level}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button
                            onClick={startGame}
                            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-base px-6 py-3 sm:text-lg sm:px-8 shadow-lg rounded-full transition-all duration-300 hover:shadow-xl"
                        >
                            {!isPlaying || gameOver ? "🎮 Start Game" : "🔄 Restart"}
                        </Button>
                    </div>
                    <div className="text-center text-xs sm:text-sm text-muted-foreground mt-6 space-y-1">
                        <p>Type the letters on the bubbles to pop them before they reach the bottom!</p>
                        <p>Speed increases as you level up. 🎈</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
