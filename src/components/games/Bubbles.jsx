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
    // NEW: Ref for our hidden input field
    const inputRef = useRef(null);

    // --- CONSTANTS & DERIVED VALUES ---
    const bubbleSize = gameSize.width / 12;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400", "bg-pink-400"];

    // --- SOUND FUNCTION (No changes) ---
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

        // MODIFIED: Focus the hidden input to bring up the mobile keyboard
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // NEW: Function to process a typed letter, reusable by both handlers
    const processTypedLetter = useCallback(
        (letter) => {
            if (!isPlaying || gameOver || !letters.includes(letter)) return;

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

    // MODIFIED: This now handles physical keyboards
    const handleKeyPress = useCallback(
        (e) => {
            const letter = e.key.toUpperCase();
            processTypedLetter(letter);
        },
        [processTypedLetter]
    );

    // NEW: This function handles input from the hidden text field for mobile
    const handleInputChange = useCallback(
        (e) => {
            const typedValue = e.target.value;
            if (!typedValue) return; // Ignore empty values

            const letter = typedValue.slice(-1).toUpperCase();
            processTypedLetter(letter);

            // Clear the input field immediately to be ready for the next character
            e.target.value = "";
        },
        [processTypedLetter]
    );

    const endGame = useCallback(/* ...no changes... */);
    const createBubble = useCallback(/* ...no changes... */);
    const gameLoop = useCallback(/* ...no changes... */);

    // --- EFFECTS ---
    // ... other useEffects remain the same ...

    // This effect now correctly starts and stops the loop
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            // On game over, blur the input to hide the keyboard
            if (gameOver && inputRef.current) {
                inputRef.current.blur();
            }
            cancelAnimationFrame(gameLoopRef.current);
        }
        return () => cancelAnimationFrame(gameLoopRef.current);
    }, [isPlaying, gameOver, gameLoop]);

    // Physical keyboard listener (for desktops)
    useEffect(() => {
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [handleKeyPress]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 p-2 sm:p-4 font-sans antialiased">
            <Card className="w-full max-w-4xl bg-card/70 backdrop-blur-lg shadow-2xl border border-primary/20 rounded-xl p-4 sm:p-6 transition-all duration-300">
                <CardHeader> {/* ... no changes ... */} </CardHeader>
                <CardContent>
                    {/* NEW: Hidden input to capture mobile keyboard events */}
                    <input
                        ref={inputRef}
                        type="text"
                        onChange={handleInputChange}
                        // Styling to make it completely invisible and out of the way
                        style={{
                            position: "absolute",
                            top: "-9999px",
                            left: "-9999px",
                            opacity: 0,
                            pointerEvents: "none",
                        }}
                        // Mobile-specific attributes to prevent unwanted behavior
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />

                    <div
                        ref={gameContainerRef}
                        // MODIFIED: Clicking the game area will re-focus the input
                        onClick={() => inputRef.current?.focus()}
                        className="relative w-full max-w-[600px] mx-auto aspect-[3/2] bg-gradient-to-b from-cyan-100 to-blue-300 dark:from-cyan-900 dark:to-blue-800 border-4 border-blue-400 rounded-lg overflow-hidden shadow-inner"
                    >
                        {/* ... rest of the JSX is unchanged ... */}
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
                    {/* ... rest of the JSX is unchanged ... */}
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
