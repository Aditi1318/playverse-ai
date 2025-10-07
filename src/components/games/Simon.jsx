import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Simon = () => {
    // --- STATE & REFS (No changes) ---
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [activeButton, setActiveButton] = useState(null);

    const audioContextRef = useRef(null);

    // --- STYLES & CONSTANTS (No changes) ---
    const colors = ["rose", "sky", "emerald", "amber"];
    const buttonStyles = {
        rose: "bg-gradient-to-br from-rose-300 to-rose-400 hover:from-rose-400 hover:to-rose-500 shadow-rose-200/50",
        sky: "bg-gradient-to-br from-sky-300 to-sky-400 hover:from-sky-400 hover:to-sky-500 shadow-sky-200/50",
        emerald:
            "bg-gradient-to-br from-emerald-300 to-emerald-400 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-200/50",
        amber: "bg-gradient-to-br from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 shadow-amber-200/50",
    };
    const frequencies = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

    // --- IMPROVED AUDIO HANDLING ---
    const playSound = useCallback((frequency) => {
        const ctx = audioContextRef.current;
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
    }, []);

    // --- GAME LOGIC ---
    const startGame = () => {
        // Initialize and resume AudioContext on user interaction
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }

        setSequence([]);
        setPlayerSequence([]);
        setLevel(1);
        setGameOver(false);
        setIsPlaying(true);
        // Add a slight delay before the first sequence starts
        setTimeout(() => showNewSequence([]), 800);
    };

    // Abstracted sequence showing logic to be reusable
    const showNewSequence = (currentSequence) => {
        const newColorIndex = Math.floor(Math.random() * 4);
        const newSequence = [...currentSequence, newColorIndex];
        setSequence(newSequence);

        setIsShowingSequence(true);
        setPlayerSequence([]);

        newSequence.forEach((colorIndex, index) => {
            setTimeout(() => {
                setActiveButton(colorIndex);
                playSound(frequencies[colorIndex]);
                setTimeout(() => {
                    setActiveButton(null);
                    if (index === newSequence.length - 1) {
                        setIsShowingSequence(false);
                    }
                }, 400); // Faster flash
            }, (index + 1) * 700); // Faster sequence display
        });
    };

    const handleButtonClick = (colorIndex) => {
        if (isShowingSequence || gameOver || !isPlaying) return;

        playSound(frequencies[colorIndex]);
        setActiveButton(colorIndex);
        setTimeout(() => setActiveButton(null), 200);

        const newPlayerSequence = [...playerSequence, colorIndex];
        setPlayerSequence(newPlayerSequence);

        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            setGameOver(true);
            setIsPlaying(false);
            toast({
                title: "Oops! 😅",
                description: `You reached level ${level}. Try again!`,
                variant: "destructive",
            });
            return;
        }

        if (newPlayerSequence.length === sequence.length) {
            setLevel((prev) => prev + 1);
            toast({
                title: "Wonderful! ✨",
                description: `On to Level ${level + 1}!`,
            });
            setTimeout(() => showNewSequence(sequence), 1200);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 p-2 sm:p-4 font-sans antialiased">
            <Card className="w-full max-w-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-lg border-purple-200/50 dark:border-purple-700/50 shadow-2xl rounded-xl">
                <CardHeader className="text-center bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-800/20 dark:to-pink-800/20 rounded-t-xl p-4 sm:p-6">
                    <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4 font-['Comfortaa',cursive]">
                        ✨ Simon Says ✨
                    </CardTitle>
                    <div className="flex justify-between items-center text-base sm:text-lg">
                        <div className="bg-white/60 dark:bg-black/20 px-4 py-2 rounded-full">
                            <span className="font-bold text-purple-600 dark:text-purple-400">Level: {level}</span>
                        </div>
                        <p className="text-muted-foreground font-medium text-right">
                            {isPlaying
                                ? isShowingSequence
                                    ? " Watch carefully..."
                                    : " Your turn!"
                                : "🎮 Ready to play?"}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-8">
                    {/* MODIFIED: Responsive grid container */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xs sm:max-w-md mx-auto mb-8">
                        {colors.map((color, index) => (
                            <button
                                key={color}
                                onClick={() => handleButtonClick(index)}
                                disabled={isShowingSequence || gameOver || !isPlaying}
                                className={`
                                  w-full aspect-square rounded-2xl sm:rounded-3xl transition-all duration-200 transform
                                  ${buttonStyles[color]}
                                  ${
                                      activeButton === index
                                          ? "scale-95 brightness-125 shadow-2xl"
                                          : "hover:scale-105 shadow-lg"
                                  }
                                  ${
                                      isShowingSequence || gameOver || !isPlaying
                                          ? "cursor-not-allowed opacity-60"
                                          : "cursor-pointer"
                                  }
                                  border-4 border-white/50 dark:border-black/20
                                `}
                            >
                                {/* Hide text on very small screens for a cleaner look */}
                                <div className="hidden sm:block text-white text-2xl font-bold capitalize tracking-wider drop-shadow-lg">
                                    {color}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={startGame}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base sm:text-lg px-8 sm:px-10 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                            disabled={isPlaying && !gameOver}
                        >
                            {!isPlaying || gameOver ? "🎮 Start Adventure" : "🔄 Restart"}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-8 space-y-2 bg-white/30 dark:bg-black/10 rounded-2xl p-4">
                        <p className="font-medium">🎵 Watch the magical sequence and repeat it!</p>
                        <p>Each level adds one more step to remember</p>
                        {gameOver && (
                            <p className="text-rose-500 font-bold text-lg animate-pulse">✨ Final Level: {level} ✨</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
