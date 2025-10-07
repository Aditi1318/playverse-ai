import React from "react";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {Snake} from "./games/Snake";
import {Simon} from "./games/Simon";
import {FlappyBird} from "./games/FlappyBird";
import {Bubbles} from "./games/Bubbles";
import {Chess} from "./games/Chess";
import {TicTacToe} from "./games/TicTacToe";
import {MemoryMatch} from "./games/MemoryMatch";
import {GuessNumber} from "./games/GuessNumber";

export const GameLauncher = ({gameId, onBack}) => {
    const renderGame = () => {
        switch (gameId) {
            case "snake":
                return <Snake />;
            case "simon":
                return <Simon />;
            case "flappy-bird":
                return <FlappyBird />;
            case "bubbles":
                return <Bubbles />;
            case "chess":
                return <Chess />;
            case "tic-tac-toe":
                return <TicTacToe />;
            case "memory-match":
                return <MemoryMatch />;
            case "guess-number":
                return <GuessNumber />;
            default:
                return <div>Game not found</div>;
        }
    };

    return (
        <div className="min-h-screen p-6 font-['Poppins',sans-serif]">
            <div className="mb-6">
                <Button
                    onClick={onBack}
                    variant="outline"
                    className="mb-4 bg-card/50 backdrop-blur-sm border-border/50 text-foreground hover:bg-card/80 hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            {renderGame()}
        </div>
    );
};
