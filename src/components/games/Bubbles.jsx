import React, {useState, useEffect, useRef, useCallback} from "react";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Bubbles = () => {
    // --- STATE & REFS ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [bubbles, setBubbles] = useState([]);
    const [level, setLevel] = useState(1);
    const [gameSize, setGameSize] = useState({width: 375, height: 667});

    const gameLoopRef = useRef(null);
    const gameContainerRef = useRef(null);
    const bubbleIdRef = useRef(0);
    const audioCtxRef = useRef(null);
    const inputRef = useRef(null);

    // --- ADAPTIVE/RESPONSIVE VALUES ---
    const isMobile = gameSize.width < 768;
    const bubbleSize = gameSize.width / (isMobile ? 12 : 25);
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400"];

    // --- SOUND FUNCTION (Full Implementation) ---
    const playSound = useCallback((type) => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
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

    // --- GAME LOGIC (Full Implementation) ---
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
        inputRef.current?.focus();
    };

    const popBubble = useCallback(
        (letter) => {
            if (!isPlaying || gameOver || !letters.includes(letter)) return;

            setBubbles((prev) => {
                let lowestBubbleIndex = -1;
                let lowestY = -1;
                prev.forEach((bubble, index) => {
                    if (bubble.letter === letter && bubble.y > lowestY) {
                        lowestY = bubble.y;
                        lowestBubbleIndex = index;
                    }
                });

                if (lowestBubbleIndex !== -1) {
                    playSound("pop");
                    const updated = [...prev];
                    updated.splice(lowestBubbleIndex, 1);
                    setScore((s) => s + 10);
                    return updated;
                }
                return prev;
            });
        },
        [isPlaying, gameOver, playSound]
    );

    const handleKeyPress = useCallback(
        (e) => {
            const letter = e.key.toUpperCase();
            if (letter.length === 1) popBubble(letter);
        },
        [popBubble]
    );

    const handleMobileInput = useCallback(
        (e) => {
            const typedValue = e.target.value;
            if (!typedValue) return;
            const letter = typedValue.slice(-1).toUpperCase();
            popBubble(letter);
            e.target.value = "";
        },
        [popBubble]
    );

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
        const speed = gameSize.height / 800 + level * 0.05;
        return {
            id: bubbleIdRef.current++,
            letter: letters[Math.floor(Math.random() * letters.length)],
            x: Math.random() * (gameSize.width - bubbleSize),
            y: -bubbleSize,
            speed: speed + Math.random() * 0.2,
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    }, [level, gameSize.width, gameSize.height, bubbleSize]);

    const gameLoop = useCallback(() => {
        setBubbles((prevBubbles) => {
            const updated = prevBubbles.map((b) => ({...b, y: b.y + b.speed}));
            if (updated.some((b) => b.y + bubbleSize >= gameSize.height)) {
                endGame();
                return prevBubbles;
            }
            const filtered = updated.filter((b) => b.y < gameSize.height);
            const baseSpawnRate = 0.01 + level * 0.0015;
            if (Math.random() < baseSpawnRate) {
                filtered.push(createBubble());
            }
            return filtered;
        });
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [level, gameSize.height, bubbleSize, createBubble, endGame]);

    // --- EFFECTS (Full Implementation) ---
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

    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
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

    // --- JSX ---
    return (
        <div className="w-screen h-screen flex flex-col bg-cyan-900 font-sans antialiased">
            <input
                ref={inputRef}
                type="text"
                onInput={handleMobileInput}
                style={{position: "absolute", top: "-9999px", left: "-9999px", opacity: 0, pointerEvents: "none"}}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />

            <header className="w-full p-4 flex justify-between items-center z-10 text-white bg-black/20">
                <p className="text-xl sm:text-2xl font-bold drop-shadow-md">Score: {score}</p>
                <p className="text-xl sm:text-2xl font-bold drop-shadow-md">Level: {level}</p>
            </header>

            <main
                ref={gameContainerRef}
                className="flex-1 w-full relative bg-gradient-to-b from-cyan-800 to-blue-900 overflow-hidden"
            >
                {bubbles.map((b) => (
                    <div
                        key={b.id}
                        className={`absolute rounded-full ${b.color} border-2 border-white/50 flex items-center justify-center text-white font-bold shadow-lg`}
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
            </main>

            <footer
                onClick={() => inputRef.current?.focus()}
                className="w-full p-2 text-center text-cyan-200 bg-black/20 z-10 cursor-pointer"
            >
                {isPlaying ? "Tap here to type" : "Press Start to Play"}
            </footer>

            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 animate-fade-in">
                    <h1 className="text-5xl sm:text-7xl font-bold gradient-text mb-4 font-['Comfortaa',sans-serif]">
                        Bubble Type
                    </h1>
                    <p className="text-white/80 text-lg sm:text-xl mb-8">Type the letters before the bubbles fall!</p>
                    <Button
                        onClick={startGame}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-lg px-8 py-4 sm:text-xl sm:px-10 sm:py-5 shadow-lg rounded-full transition-all duration-300 hover:shadow-xl"
                    >
                        🎮 Start Game
                    </Button>
                </div>
            )}
            {gameOver && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20 animate-fade-in">
                    <h2 className="text-4xl sm:text-6xl font-bold text-white mb-2">Game Over!</h2>
                    <p className="text-white/90 text-xl sm:text-2xl mb-2">Final Score: {score}</p>
                    <p className="text-white/90 text-xl sm:text-2xl mb-8">Level Reached: {level}</p>
                    <Button
                        onClick={startGame}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-lg px-8 py-4 sm:text-xl sm:px-10 sm:py-5 shadow-lg rounded-full transition-all duration-300 hover:shadow-xl"
                    >
                        🔄 Play Again
                    </Button>
                </div>
            )}
        </div>
    );
};
