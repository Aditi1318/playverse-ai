import React, {useState, useEffect, useCallback} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

// --- CSS animations are defined here as a string ---
const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  @keyframes celebrate {
    0%, 100% { transform: scale(1); box-shadow: 0 0 10px #fde047; }
    50% { transform: scale(1.05); box-shadow: 0 0 20px #fde047; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;

export const MemoryMatch = () => {
    const symbols = ["🎮", "🎯", "🎲", "🧩", "🎨", "🎭", "🎳", "🚀"];

    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    // --- FIX: Wrapped in useCallback to prevent infinite loop ---
    const initializeGame = useCallback(() => {
        const gameSymbols = [...symbols, ...symbols];
        const shuffledCards = gameSymbols
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false,
            isMismatched: false,
        }));

        setCards(shuffledCards);
        setFlippedCards([]);
        setMatchedPairs(0);
        setMoves(0);
        setGameWon(false);
        setIsChecking(false);
    }, []); // Empty dependency array means this function is created only once

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    useEffect(() => {
        if (flippedCards.length !== 2) return;

        setIsChecking(true);
        const [firstCard, secondCard] = flippedCards;

        if (firstCard.symbol === secondCard.symbol) {
            // Match found
            setTimeout(() => {
                setCards((prev) =>
                    prev.map((card) =>
                        card.symbol === firstCard.symbol ? {...card, isMatched: true, isFlipped: true} : card
                    )
                );
                setFlippedCards([]);
                setMatchedPairs((prev) => prev + 1);
                setIsChecking(false);
            }, 800);
        } else {
            // No match
            setCards((prev) =>
                prev.map((c) => (c.id === firstCard.id || c.id === secondCard.id ? {...c, isMismatched: true} : c))
            );
            setTimeout(() => {
                setCards((prev) =>
                    prev.map((card) => (card.isMismatched ? {...card, isFlipped: false, isMismatched: false} : card))
                );
                setFlippedCards([]);
                setIsChecking(false);
            }, 1000);
        }
        setMoves((prev) => prev + 1);
    }, [flippedCards]);

    useEffect(() => {
        if (matchedPairs > 0 && matchedPairs === symbols.length) {
            setTimeout(() => setGameWon(true), 500);
        }
    }, [matchedPairs, symbols.length]);

    const handleCardClick = (card) => {
        if (isChecking || card.isFlipped || card.isMatched || flippedCards.length === 2) {
            return;
        }

        const newFlippedCard = {...card, isFlipped: true};
        setCards((prev) => prev.map((c) => (c.id === card.id ? newFlippedCard : c)));
        setFlippedCards((prev) => [...prev, newFlippedCard]);
    };

    return (
        <div className="flex justify-center items-center min-h-[600px] w-full bg-gradient-to-br from-[#1a202c] to-[#2d3748] p-4">
            <style>{animationStyles}</style>
            <Card className="w-full max-w-2xl bg-black/30 backdrop-blur-lg border border-white/10 shadow-2xl shadow-blue-500/10 relative overflow-hidden">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 pb-2">
                        Memory Match
                    </CardTitle>
                    <div className="flex justify-between text-lg text-white/80 font-semibold px-4">
                        <span>
                            Moves: <span className="text-yellow-400">{moves}</span>
                        </span>
                        <span>
                            Pairs:{" "}
                            <span className="text-yellow-400">
                                {matchedPairs} / {symbols.length}
                            </span>
                        </span>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className="aspect-square [perspective:1000px] cursor-pointer group"
                                onClick={() => handleCardClick(card)}
                            >
                                <div
                                    className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 rounded-lg ${
                                        card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : ""
                                    } ${card.isMismatched ? "animate-[shake_0.5s_ease-in-out]" : ""} ${
                                        card.isMatched ? "animate-[celebrate_0.5s_ease-in-out]" : ""
                                    }`}
                                >
                                    {/* Card Back */}
                                    <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white/50 transition-transform group-hover:scale-105">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-50"
                                        >
                                            <path d="M10 10v4h4v-4h-4zm10 0v4h4v-4h-4zM4 10v4h4v-4H4zm10-6v4h4V4h-4zM4 4v4h4V4H4zm7 13.66a8 8 0 1 0-2.32-2.32" />
                                        </svg>
                                    </div>
                                    {/* Card Front */}
                                    <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-4xl">
                                        {card.symbol}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>

                {gameWon && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out] z-10 rounded-xl">
                        <h2 className="text-5xl font-bold text-yellow-400">You Won! 🎉</h2>
                        <p className="text-white/80 text-lg mt-2">Completed in {moves} moves.</p>
                        <Button
                            onClick={initializeGame}
                            className="mt-6 text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition-transform"
                        >
                            Play Again
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};
