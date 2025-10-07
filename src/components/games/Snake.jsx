import React, {useState, useEffect, useRef, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Snake = () => {
    const [snake, setSnake] = useState([{x: 10, y: 10}]);
    const [food, setFood] = useState({x: 15, y: 15});
    const [direction, setDirection] = useState("RIGHT");
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const gameLoopRef = useRef();
    const BOARD_SIZE = 20;
    const CELL_SIZE = 20;

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
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) return true;
        return snake.some((segment) => segment.x === head.x && segment.y === head.y);
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
    }, [direction, isPlaying, gameOver, food, score, generateFood]);

    const startGame = () => {
        setSnake([{x: 10, y: 10}]);
        setFood({x: 15, y: 15});
        setDirection("RIGHT");
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
    };

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

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!isPlaying) return;
            switch (e.key) {
                case "ArrowUp":
                    if (direction !== "DOWN") setDirection("UP");
                    break;
                case "ArrowDown":
                    if (direction !== "UP") setDirection("DOWN");
                    break;
                case "ArrowLeft":
                    if (direction !== "RIGHT") setDirection("LEFT");
                    break;
                case "ArrowRight":
                    if (direction !== "LEFT") setDirection("RIGHT");
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [direction, isPlaying]);

    return (
        <div className="flex justify-center items-center min-h-[600px] p-4">
            <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl gradient-text mb-2">🐍 Snake Game</CardTitle>
                    <div className="flex justify-between items-center text-lg">
                        <p className="font-semibold text-primary">Score: {score}</p>
                        <p className="text-muted-foreground">
                            {isPlaying ? "Use arrow keys to move!" : "Ready to play?"}
                        </p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div
                        className="relative mx-auto bg-green-100 dark:bg-green-900/30 border-4 border-green-600 rounded-lg"
                        style={{width: BOARD_SIZE * CELL_SIZE, height: BOARD_SIZE * CELL_SIZE}}
                    >
                        {snake.map((segment, index) => (
                            <div
                                key={index}
                                className={`absolute ${index === 0 ? "bg-green-600" : "bg-green-500"} rounded-sm`}
                                style={{
                                    left: segment.x * CELL_SIZE,
                                    top: segment.y * CELL_SIZE,
                                    width: CELL_SIZE - 1,
                                    height: CELL_SIZE - 1,
                                }}
                            />
                        ))}

                        <div
                            className="absolute bg-red-500 rounded-full"
                            style={{
                                left: food.x * CELL_SIZE + 2,
                                top: food.y * CELL_SIZE + 2,
                                width: CELL_SIZE - 4,
                                height: CELL_SIZE - 4,
                            }}
                        />

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
                        <p>Use arrow keys to control the snake</p>
                        <p>Eat the red food to grow and increase your score!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
