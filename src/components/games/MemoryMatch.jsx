import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

export const MemoryMatch = () => {
    const symbols = ["🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎪", "🎳"];
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    const initializeGame = () => {
        const gameSymbols = [...symbols, ...symbols];
        const shuffledCards = gameSymbols
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({
            id: index,
            symbol,
            isFlipped: false,
            isMatched: false,
        }));

        setCards(shuffledCards);
        setFlippedCards([]);
        setMatchedPairs(0);
        setMoves(0);
        setGameWon(false);
    };

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        if (flippedCards.length === 2) {
            const [first, second] = flippedCards;
            if (cards[first].symbol === cards[second].symbol) {
                // Match found
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((card) =>
                            card.id === first || card.id === second ? {...card, isMatched: true} : card
                        )
                    );
                    setMatchedPairs((prev) => prev + 1);
                    setFlippedCards([]);
                }, 1000);
            } else {
                // No match
                setTimeout(() => {
                    setCards((prev) =>
                        prev.map((card) =>
                            card.id === first || card.id === second ? {...card, isFlipped: false} : card
                        )
                    );
                    setFlippedCards([]);
                }, 1000);
            }
            setMoves((prev) => prev + 1);
        }
    }, [flippedCards, cards]);

    useEffect(() => {
        if (matchedPairs === symbols.length) {
            setGameWon(true);
        }
    }, [matchedPairs]);

    const handleCardClick = (cardId) => {
        if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
            return;
        }

        setCards((prev) => prev.map((card) => (card.id === cardId ? {...card, isFlipped: true} : card)));
        setFlippedCards((prev) => [...prev, cardId]);
    };

    return (
        <div className="flex justify-center items-center min-h-[600px]">
            <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl gradient-text">Memory Match</CardTitle>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Moves: {moves}</span>
                        <span>
                            Pairs: {matchedPairs}/{symbols.length}
                        </span>
                    </div>
                    {gameWon && (
                        <p className="text-green-400 font-semibold">Congratulations! You won in {moves} moves! 🎉</p>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                        {cards.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card.id)}
                                className={`aspect-square bg-secondary hover:bg-secondary/80 border-2 border-border rounded-lg text-2xl font-bold transition-all duration-300 ${
                                    card.isFlipped || card.isMatched
                                        ? "bg-primary/20 border-primary scale-105"
                                        : "hover:scale-105"
                                }`}
                                disabled={card.isFlipped || card.isMatched || flippedCards.length === 2}
                            >
                                {card.isFlipped || card.isMatched ? card.symbol : "?"}
                            </button>
                        ))}
                    </div>

                    <Button onClick={initializeGame} className="w-full bg-primary hover:bg-primary/80">
                        New Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
