import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const FlappyBird = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [birdY, setBirdY] = useState(200);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState([]);

    const gameAreaRef = useRef(null);
    const gameLoopRef = useRef();

    const BIRD_SIZE = 20;
    const PIPE_WIDTH = 60;
    const PIPE_GAP = 150;
    const GRAVITY = 0.4;
    const JUMP_FORCE = -10;
    const PIPE_SPEED = 2;
    const GAME_HEIGHT = 400;
    const GAME_WIDTH = 600;

    const jump = useCallback(() => {
        if (!isPlaying || gameOver) return;
        setBirdVelocity(JUMP_FORCE);
    }, [isPlaying, gameOver]);

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        setBirdY(200);
        setBirdVelocity(0);
        setPipes([]);
    };

    const endGame = () => {
        setGameOver(true);
        setIsPlaying(false);
        if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
        }
        toast({
            title: "Game Over!",
            description: `Final Score: ${score}`,
            variant: "destructive",
        });
    };

    const checkCollision = (birdY, pipes) => {
        if (birdY <= 0 || birdY >= GAME_HEIGHT - BIRD_SIZE) {
            return true;
        }

        for (const pipe of pipes) {
            if (pipe.x < 100 + BIRD_SIZE && pipe.x + PIPE_WIDTH > 100) {
                if (birdY < pipe.gapY || birdY + BIRD_SIZE > pipe.gapY + PIPE_GAP) {
                    return true;
                }
            }
        }

        return false;
    };

    const gameLoop = useCallback(() => {
        if (!isPlaying || gameOver) return;

        setBirdY((prevY) => {
            const newY = prevY + birdVelocity;
            return Math.max(0, Math.min(GAME_HEIGHT - BIRD_SIZE, newY));
        });

        setBirdVelocity((prevVel) => prevVel + GRAVITY);

        setPipes((prevPipes) => {
            let newPipes = prevPipes
            .map((pipe) => ({
                ...pipe,
                x: pipe.x - PIPE_SPEED,
            }))
            .filter((pipe) => pipe.x > -PIPE_WIDTH);

            if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
                newPipes.push({
                    x: GAME_WIDTH,
                    gapY: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50,
                    passed: false,
                });
            }

            newPipes.forEach((pipe) => {
                if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
                    pipe.passed = true;
                    setScore((prev) => prev + 1);
                }
            });

            return newPipes;
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, gameOver, birdVelocity]);

    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [isPlaying, gameOver, gameLoop]);

    useEffect(() => {
        if (checkCollision(birdY, pipes) && isPlaying) {
            endGame();
        }
    }, [birdY, pipes, isPlaying]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === "Space") {
                e.preventDefault();
                jump();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [jump]);

    return (
        <div className="flex justify-center items-center min-h-[600px] p-4">
            <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl gradient-text mb-2">🐦 Flappy Bird</CardTitle>
                    <div className="flex justify-between items-center text-lg">
                        <p className="font-semibold text-primary">Score: {score}</p>
                        <p className="text-muted-foreground">
                            {isPlaying ? "Click or press Space to flap!" : "Ready to fly?"}
                        </p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        ref={gameAreaRef}
                        onClick={jump}
                        className="relative mx-auto bg-gradient-to-b from-sky-300 to-sky-500 border-4 border-amber-800 rounded-lg overflow-hidden cursor-pointer"
                        style={{width: GAME_WIDTH, height: GAME_HEIGHT}}
                    >
                        <div
                            className="absolute w-5 h-5 bg-yellow-400 rounded-full transition-transform duration-100 border-2 border-orange-400"
                            style={{
                                left: "100px",
                                top: `${birdY}px`,
                                transform: `rotate(${Math.min(Math.max(birdVelocity * 3, -30), 30)}deg)`,
                            }}
                        >
                            <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
                        </div>

                        {pipes.map((pipe, index) => (
                            <div key={index}>
                                <div
                                    className="absolute bg-green-600 border-2 border-green-800"
                                    style={{
                                        left: `${pipe.x}px`,
                                        top: "0px",
                                        width: `${PIPE_WIDTH}px`,
                                        height: `${pipe.gapY}px`,
                                    }}
                                />
                                <div
                                    className="absolute bg-green-600 border-2 border-green-800"
                                    style={{
                                        left: `${pipe.x}px`,
                                        top: `${pipe.gapY + PIPE_GAP}px`,
                                        width: `${PIPE_WIDTH}px`,
                                        height: `${GAME_HEIGHT - pipe.gapY - PIPE_GAP}px`,
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
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={startGame} className="bg-primary hover:bg-primary/80 text-lg px-8">
                            {!isPlaying || gameOver ? "🎮 Start Game" : "🔄 Restart"}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-6 space-y-1">
                        <p>Click the game area or press SPACE to make the bird flap</p>
                        <p>Avoid the pipes and try to get the highest score!</p>
                        <p className="text-green-400">✨ Relaxed mode - take your time!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
