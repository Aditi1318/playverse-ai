import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const FlappyBird = () => {
    // --- STATE ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    // FIXED: Combined bird state for stable physics
    const [birdState, setBirdState] = useState({y: 200, velocity: 0});
    const [pipes, setPipes] = useState([]);

    // --- RESPONSIVE STATE & REFS ---
    const [gameSize, setGameSize] = useState({width: 500, height: 400});
    const gameAreaRef = useRef(null);
    const gameLoopRef = useRef(null);

    // --- SCALED GAME PARAMETERS ---
    // This recalculates all game physics and sizes only when the gameSize changes.
    const scaledParams = useMemo(() => {
        const heightRatio = gameSize.height / 400;
        return {
            birdSize: gameSize.height / 20, // Original BIRD_SIZE was 20
            pipeWidth: gameSize.width / 10, // Original PIPE_WIDTH was ~50-60
            pipeGap: gameSize.height / 2.6, // Original PIPE_GAP was 150
            gravity: 0.2 * heightRatio,
            jumpForce: -5 * heightRatio, // Original JUMP_FORCE was ~-6
            pipeSpeed: 2 * (gameSize.width / 500), // Scale speed with width
            birdX: gameSize.width / 6, // Place bird at 1/6th of the screen width
        };
    }, [gameSize]);

    // --- GAME LOGIC ---
    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        // Reset bird to the middle of the dynamic screen height
        setBirdState({y: gameSize.height / 2, velocity: 0});
        setPipes([]);
    };

    const endGame = useCallback(() => {
        if (gameOver) return;
        setGameOver(true);
        setIsPlaying(false);
        toast({
            title: "Game Over!",
            description: `Final Score: ${score}`,
            variant: "destructive",
        });
    }, [gameOver, score]);

    const jump = useCallback(() => {
        if (!isPlaying || gameOver) return;
        // Use the scaled jump force
        setBirdState((prev) => ({...prev, velocity: scaledParams.jumpForce}));
    }, [isPlaying, gameOver, scaledParams.jumpForce]);

    // --- GAME LOOP ---
    const gameLoop = useCallback(() => {
        if (!isPlaying || gameOver) return;

        // FIXED: Stable physics update using a single state object
        setBirdState((prev) => {
            const newVelocity = prev.velocity + scaledParams.gravity;
            const newY = prev.y + newVelocity;
            return {y: newY, velocity: newVelocity};
        });

        // Pipe logic
        setPipes((prevPipes) => {
            let newPipes = prevPipes
            .map((pipe) => ({...pipe, x: pipe.x - scaledParams.pipeSpeed}))
            .filter((pipe) => pipe.x > -scaledParams.pipeWidth);

            // Use dynamic gameSize for spawning pipes
            if (
                newPipes.length === 0 ||
                newPipes[newPipes.length - 1].x < gameSize.width - 250 * (gameSize.width / 500)
            ) {
                const newGapY = Math.random() * (gameSize.height - scaledParams.pipeGap - 100) + 50;
                newPipes.push({x: gameSize.width, gapY: newGapY, passed: false});
            }

            newPipes.forEach((pipe) => {
                if (!pipe.passed && pipe.x + scaledParams.pipeWidth < scaledParams.birdX) {
                    pipe.passed = true;
                    setScore((s) => s + 1);
                }
            });
            return newPipes;
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, gameOver, gameSize, scaledParams]);

    // --- EFFECTS ---
    useEffect(() => {
        const container = gameAreaRef.current;
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
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [isPlaying, gameOver, gameLoop]);

    useEffect(() => {
        const {birdSize, birdX, pipeWidth, pipeGap} = scaledParams;

        // Ground and ceiling collision
        if (birdState.y <= 0 || birdState.y >= gameSize.height - birdSize) {
            if (isPlaying) endGame();
            return;
        }

        // Pipe collision
        for (const pipe of pipes) {
            if (pipe.x < birdX + birdSize && pipe.x + pipeWidth > birdX) {
                if (birdState.y < pipe.gapY || birdState.y + birdSize > pipe.gapY + pipeGap) {
                    if (isPlaying) endGame();
                    return;
                }
            }
        }
    }, [birdState.y, pipes, isPlaying, gameSize.height, scaledParams, endGame]);

    useEffect(() => {
        const handleInteraction = (e) => {
            if (e.type === "keydown" && e.code !== "Space") return;
            e.preventDefault();
            if (!isPlaying) {
                startGame();
            } else {
                jump();
            }
        };
        const gameArea = gameAreaRef.current;
        gameArea?.addEventListener("click", handleInteraction);
        window.addEventListener("keydown", handleInteraction);
        return () => {
            gameArea?.removeEventListener("click", handleInteraction);
            window.removeEventListener("keydown", handleInteraction);
        };
    }, [jump, isPlaying]);

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl gradient-text mb-2">🐦 Flappy Bird</CardTitle>
                    <div className="flex justify-center items-center text-2xl font-bold">
                        <p className="text-primary">Score: {score}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        ref={gameAreaRef}
                        className="relative w-full mx-auto bg-gradient-to-b from-sky-300 to-sky-500 border-4 border-amber-800 rounded-lg overflow-hidden cursor-pointer aspect-[4/3]"
                    >
                        {/* Bird - Original simple UI */}
                        <div
                            className="absolute bg-yellow-400 rounded-full border-2 border-orange-400"
                            style={{
                                left: `${scaledParams.birdX}px`,
                                top: `${birdState.y}px`,
                                width: `${scaledParams.birdSize}px`,
                                height: `${scaledParams.birdSize}px`,
                                transform: `rotate(${Math.min(Math.max(birdState.velocity * 3, -30), 30)}deg)`,
                                transition: "transform 150ms linear",
                            }}
                        ></div>

                        {/* Pipes - Original simple UI */}
                        {pipes.map((pipe, index) => (
                            <div key={index}>
                                <div
                                    className="absolute bg-green-600 border-2 border-green-800"
                                    style={{
                                        left: `${pipe.x}px`,
                                        top: "0px",
                                        width: `${scaledParams.pipeWidth}px`,
                                        height: `${pipe.gapY}px`,
                                    }}
                                />
                                <div
                                    className="absolute bg-green-600 border-2 border-green-800"
                                    style={{
                                        left: `${pipe.x}px`,
                                        top: `${pipe.gapY + scaledParams.pipeGap}px`,
                                        width: `${scaledParams.pipeWidth}px`,
                                        height: `${gameSize.height - pipe.gapY - scaledParams.pipeGap}px`,
                                    }}
                                />
                            </div>
                        ))}

                        <div className="absolute bottom-0 w-full h-4 bg-amber-600 border-t-2 border-amber-800"></div>

                        {gameOver && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                                    <p className="text-lg">Score: {score}</p>
                                </div>
                            </div>
                        )}
                        {!isPlaying && !gameOver && (
                            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-4">
                                <h3 className="text-2xl font-bold mb-2">Ready to Fly?</h3>
                                <p>Click or Press Space to Start</p>
                            </div>
                        )}
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-6 space-y-1">
                        <p>Click the game area or press SPACE to make the bird flap.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
