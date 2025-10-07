import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";
import {ArrowUp, ArrowDown, ArrowLeft, ArrowRight, XCircle} from "lucide-react"; // Added XCircle for Game Over

export const Snake = () => {
    // --- STATE AND CONSTANTS ---
    const BOARD_SIZE = 20;
    const [snake, setSnake] = useState([{x: 10, y: 10}]);
    const [food, setFood] = useState({x: 15, y: 15});
    const [direction, setDirection] = useState("RIGHT");
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    // --- RESPONSIVE SIZING STATE ---
    const [cellSize, setCellSize] = useState(20);

    // --- REFS ---
    const gameLoopRef = useRef(null);
    const gameBoardRef = useRef(null);

    // --- GAME LOGIC (Callbacks for performance) ---
    const generateFood = useCallback(() => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE),
            };
        } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }, [snake]);

    const checkCollision = (head) => {
        // Wall collision
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) return true;
        // Self collision (start checking from the second segment)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    };

    const moveSnake = useCallback(() => {
        if (!isPlaying || gameOver) return;

        setSnake((prevSnake) => {
            const newSnake = [...prevSnake];
            const head = {...newSnake[0]};

            switch (direction) {
                case "UP":
                    head.y -= 1;
                    break;
                case "DOWN":
                    head.y += 1;
                    break;
                case "LEFT":
                    head.x -= 1;
                    break;
                case "RIGHT":
                    head.x += 1;
                    break;
                default:
                    break;
            }

            if (checkCollision(head)) {
                setGameOver(true);
                setIsPlaying(false);
                toast({
                    title: "Game Over!",
                    description: `Final Score: ${score}`,
                    variant: "destructive",
                });
                return prevSnake;
            }

            newSnake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                setScore((prev) => prev + 10);
                setFood(generateFood());
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [direction, isPlaying, gameOver, food.x, food.y, score, generateFood, snake]);

    const startGame = () => {
        setSnake([{x: 10, y: 10}]);
        setFood(generateFood());
        setDirection("RIGHT");
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    };

    // --- EFFECT FOR GAME LOOP ---
    useEffect(() => {
        if (isPlaying && !gameOver) {
            gameLoopRef.current = setInterval(moveSnake, 150);
        } else if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [isPlaying, gameOver, moveSnake]);

    // --- CENTRALIZED DIRECTION CHANGE HANDLER ---
    const handleDirectionChange = (newDirection) => {
        if (!isPlaying) return; // Only allow direction changes if game is playing
        switch (newDirection) {
            case "UP":
                if (direction !== "DOWN") setDirection("UP");
                break;
            case "DOWN":
                if (direction !== "UP") setDirection("DOWN");
                break;
            case "LEFT":
                if (direction !== "RIGHT") setDirection("LEFT");
                break;
            case "RIGHT":
                if (direction !== "LEFT") setDirection("RIGHT");
                break;
            default:
                break;
        }
    };

    // --- EFFECT FOR KEYBOARD CONTROLS ---
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Prevent default scroll behavior for arrow keys if game is playing
            if (isPlaying && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }
            switch (e.key) {
                case "ArrowUp":
                    handleDirectionChange("UP");
                    break;
                case "ArrowDown":
                    handleDirectionChange("DOWN");
                    break;
                case "ArrowLeft":
                    handleDirectionChange("LEFT");
                    break;
                case "ArrowRight":
                    handleDirectionChange("RIGHT");
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [isPlaying, handleDirectionChange]); // Now depends on handleDirectionChange

    // --- NEW EFFECT FOR RESPONSIVE BOARD SIZING ---
    useEffect(() => {
        const board = gameBoardRef.current;
        if (!board) return;

        const updateSize = () => {
            // Use clientWidth to account for padding/border if any, but for 'w-full' offsetWidth is fine
            const width = board.offsetWidth;
            setCellSize(width / BOARD_SIZE);
        };

        updateSize(); // Initial call
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(board);

        return () => resizeObserver.disconnect();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- RENDERING ---
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 p-2 sm:p-4 font-sans antialiased">
            <Card className="w-full max-w-2xl bg-card/70 backdrop-blur-lg shadow-2xl border border-primary/20 rounded-xl p-4 sm:p-6 transition-all duration-300 hover:shadow-primary/30">
                <CardHeader className="text-center pb-4">
                    {/* Enhanced Title */}
                    <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text mb-3 tracking-tight">
                        🐍 Snake Quest
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row justify-between items-center text-base sm:text-lg">
                        <p className="font-bold text-primary-foreground text-xl drop-shadow-md">Score: {score}</p>
                        <p className="text-muted-foreground text-sm sm:text-base mt-2 sm:mt-0 italic">
                            {isPlaying ? "Navigate with haste!" : "Press 'Start' to slither!"}
                        </p>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Game board container with aspect ratio for responsiveness */}
                    <div
                        ref={gameBoardRef}
                        className="w-full max-w-[500px] mx-auto aspect-square p-1 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 shadow-xl transition-all duration-300" // Gradient border effect
                    >
                        <div
                            className="relative bg-gradient-to-br from-green-800 to-green-950 rounded-md overflow-hidden" // Darker game background
                            style={{width: "100%", height: "100%"}} // Fills the container
                        >
                            {snake.map((segment, index) => (
                                <div
                                    key={index}
                                    className={`absolute rounded-sm transition-all duration-75 ease-linear
                                                ${
                                                    index === 0
                                                        ? "bg-emerald-400 border border-emerald-200 shadow-md transform scale-105" // Head
                                                        : "bg-emerald-600 border border-emerald-400 shadow-sm" // Body
                                                }`}
                                    style={{
                                        left: segment.x * cellSize,
                                        top: segment.y * cellSize,
                                        width: cellSize - (index === 0 ? 0 : 0.5), // Slightly smaller body for distinction
                                        height: cellSize - (index === 0 ? 0 : 0.5),
                                    }}
                                />
                            ))}
                            <div
                                className="absolute bg-rose-500 rounded-full animate-pulse-slow shadow-lg border border-rose-300" // Pulsing food
                                style={{
                                    left: food.x * cellSize + cellSize * 0.1,
                                    top: food.y * cellSize + cellSize * 0.1,
                                    width: cellSize * 0.8,
                                    height: cellSize * 0.8,
                                }}
                            />
                            {gameOver && (
                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-md animate-fade-in">
                                    <XCircle className="h-16 w-16 text-red-500 mb-4 animate-bounce-in" />
                                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
                                        Game Over!
                                    </h3>
                                    <p className="text-xl text-gray-200">
                                        Final Score: <span className="font-bold text-primary">{score}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Game Button with responsive sizing */}
                    <div className="flex justify-center gap-4 mt-8">
                        <Button
                            onClick={startGame}
                            className="bg-primary hover:bg-primary/80 text-base px-6 py-3 sm:text-lg sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pop-in"
                        >
                            {!isPlaying || gameOver ? "🚀 Start New Game" : "🔄 Restart Game"}
                        </Button>
                    </div>

                    {/* On-Screen Controls (D-Pad) */}
                    <div className="mt-8 flex justify-center md:hidden">
                        <div className="grid grid-cols-3 gap-2 w-52 sm:w-64">
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-auto py-2 aspect-square text-primary-foreground/80 hover:bg-primary/20 active:bg-primary/40 focus:ring-2 focus:ring-primary/50"
                                onClick={() => handleDirectionChange("UP")}
                            >
                                <ArrowUp className="h-8 w-8" />
                            </Button>
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-auto py-2 aspect-square text-primary-foreground/80 hover:bg-primary/20 active:bg-primary/40 focus:ring-2 focus:ring-primary/50"
                                onClick={() => handleDirectionChange("LEFT")}
                            >
                                <ArrowLeft className="h-8 w-8" />
                            </Button>
                            <div /> {/* Spacer */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-auto py-2 aspect-square text-primary-foreground/80 hover:bg-primary/20 active:bg-primary/40 focus:ring-2 focus:ring-primary/50"
                                onClick={() => handleDirectionChange("RIGHT")}
                            >
                                <ArrowRight className="h-8 w-8" />
                            </Button>
                            <div />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-full h-auto py-2 aspect-square text-primary-foreground/80 hover:bg-primary/20 active:bg-primary/40 focus:ring-2 focus:ring-primary/50"
                                onClick={() => handleDirectionChange("DOWN")}
                            >
                                <ArrowDown className="h-8 w-8" />
                            </Button>
                            <div />
                        </div>
                    </div>

                    <div className="text-center text-xs sm:text-sm text-muted-foreground mt-8 space-y-1 opacity-80 italic">
                        <p>
                            Control the vibrant serpent with{" "}
                            <span className="font-semibold text-primary-foreground">arrow keys</span> or{" "}
                            <span className="font-semibold text-primary-foreground">on-screen D-pad</span>.
                        </p>
                        <p>Devour the pulsing red orb to grow longer and reach a legendary score!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
