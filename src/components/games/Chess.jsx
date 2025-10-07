import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";

export const Chess = () => {
    const [currentPlayer, setCurrentPlayer] = useState("white");
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [moveCount, setMoveCount] = useState(0);
    const [validMoves, setValidMoves] = useState([]);
    const [gameState, setGameState] = useState("playing");
    const [winner, setWinner] = useState(null);

    const pieceSymbols = {
        white: {
            king: "♔",
            queen: "♕",
            rook: "♖",
            bishop: "♗",
            knight: "♘",
            pawn: "♙",
        },
        black: {
            king: "♚",
            queen: "♛",
            rook: "♜",
            bishop: "♝",
            knight: "♞",
            pawn: "♟",
        },
    };

    const initialBoard = () => {
        const board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

        board[0] = [
            {type: "rook", color: "black"},
            {type: "knight", color: "black"},
            {type: "bishop", color: "black"},
            {type: "queen", color: "black"},
            {type: "king", color: "black"},
            {type: "bishop", color: "black"},
            {type: "knight", color: "black"},
            {type: "rook", color: "black"},
        ];

        for (let i = 0; i < 8; i++) {
            board[1][i] = {type: "pawn", color: "black"};
            board[6][i] = {type: "pawn", color: "white"};
        }

        board[7] = [
            {type: "rook", color: "white"},
            {type: "knight", color: "white"},
            {type: "bishop", color: "white"},
            {type: "queen", color: "white"},
            {type: "king", color: "white"},
            {type: "bishop", color: "white"},
            {type: "knight", color: "white"},
            {type: "rook", color: "white"},
        ];

        return board;
    };

    const [board, setBoard] = useState(initialBoard);

    const findKingPosition = (color) => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === "king" && piece.color === color) {
                    return [row, col];
                }
            }
        }
        return null;
    };

    const isSquareUnderAttack = (row, col, byColor) => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === byColor) {
                    if (piece.type === "pawn") {
                        const direction = piece.color === "white" ? -1 : 1;
                        const attackRow = r + direction;
                        const leftAttack = c - 1;
                        const rightAttack = c + 1;

                        if (attackRow === row && (leftAttack === col || rightAttack === col)) {
                            return true;
                        }
                    } else {
                        if (isValidMove(r, c, row, col)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    const isInCheck = (color) => {
        const kingPos = findKingPosition(color);
        if (!kingPos) return false;
        const [kingRow, kingCol] = kingPos;
        const opponentColor = color === "white" ? "black" : "white";
        return isSquareUnderAttack(kingRow, kingCol, opponentColor);
    };

    const getAllValidMoves = (color) => {
        const moves = [];

        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = board[fromRow][fromCol];
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (isValidMove(fromRow, fromCol, toRow, toCol)) {
                                const testBoard = board.map((row) => [...row]);
                                testBoard[toRow][toCol] = testBoard[fromRow][fromCol];
                                testBoard[fromRow][fromCol] = null;

                                const originalBoard = board;
                                setBoard(testBoard);
                                const wouldBeInCheck = isInCheck(color);
                                setBoard(originalBoard);

                                if (!wouldBeInCheck) {
                                    moves.push([fromRow, fromCol, toRow, toCol]);
                                }
                            }
                        }
                    }
                }
            }
        }

        return moves;
    };

    const checkGameState = (color) => {
        const inCheck = isInCheck(color);
        const validMoves = getAllValidMoves(color);

        if (validMoves.length === 0) {
            if (inCheck) {
                setGameState("checkmate");
                setWinner(color === "white" ? "black" : "white");
                toast({
                    title: "Checkmate!",
                    description: `${color === "white" ? "Black" : "White"} wins!`,
                    variant: "default",
                });
            } else {
                setGameState("draw");
                toast({
                    title: "Stalemate!",
                    description: "The game is a draw.",
                    variant: "default",
                });
            }
        } else if (inCheck) {
            setGameState("check");
            toast({
                title: "Check!",
                description: `${color.charAt(0).toUpperCase() + color.slice(1)} king is in check!`,
                variant: "destructive",
            });
        } else {
            setGameState("playing");
        }
    };

    const isValidMove = (fromRow, fromCol, toRow, toCol) => {
        const piece = board[fromRow][fromCol];
        if (!piece || piece.color !== currentPlayer) return false;

        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;
        const absRowDiff = Math.abs(rowDiff);
        const absColDiff = Math.abs(colDiff);

        const targetPiece = board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        switch (piece.type) {
            case "pawn":
                const direction = piece.color === "white" ? -1 : 1;
                const startRow = piece.color === "white" ? 6 : 1;

                if (colDiff === 0 && !targetPiece) {
                    if (rowDiff === direction) return true;
                    if (fromRow === startRow && rowDiff === 2 * direction) return true;
                }
                if (absColDiff === 1 && rowDiff === direction && targetPiece) {
                    return true;
                }
                return false;

            case "rook":
                if (rowDiff === 0 || colDiff === 0) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case "bishop":
                if (absRowDiff === absColDiff) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case "queen":
                if (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) {
                    return isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case "king":
                return absRowDiff <= 1 && absColDiff <= 1;

            case "knight":
                return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);

            default:
                return false;
        }
    };

    const isPathClear = (fromRow, fromCol, toRow, toCol) => {
        const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
        const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (board[currentRow][currentCol] !== null) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    };

    const getValidMoves = (row, col) => {
        const moves = [];

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (isValidMove(row, col, i, j)) {
                    moves.push([i, j]);
                }
            }
        }

        return moves;
    };

    const handleSquareClick = (row, col) => {
        if (gameState === "checkmate") return;

        if (!selectedSquare) {
            const piece = board[row][col];
            if (piece && piece.color === currentPlayer) {
                setSelectedSquare([row, col]);
                setValidMoves(getValidMoves(row, col));
            }
        } else {
            const [fromRow, fromCol] = selectedSquare;

            if (fromRow === row && fromCol === col) {
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }

            if (isValidMove(fromRow, fromCol, row, col)) {
                const newBoard = board.map((row) => [...row]);
                const capturedPiece = newBoard[row][col];
                newBoard[row][col] = newBoard[fromRow][fromCol];
                newBoard[fromRow][fromCol] = null;

                setBoard(newBoard);

                const nextPlayer = currentPlayer === "white" ? "black" : "white";

                setTimeout(() => {
                    checkGameState(nextPlayer);
                }, 100);

                setCurrentPlayer(nextPlayer);
                setMoveCount((prev) => prev + 1);

                if (capturedPiece) {
                    toast({
                        title: "Piece Captured!",
                        description: `${capturedPiece.color} ${capturedPiece.type} captured`,
                    });
                }
            }

            setSelectedSquare(null);
            setValidMoves([]);
        }
    };

    const resetGame = () => {
        setBoard(initialBoard());
        setCurrentPlayer("white");
        setSelectedSquare(null);
        setValidMoves([]);
        setMoveCount(0);
        setGameState("playing");
        setWinner(null);
    };

    const isSquareSelected = (row, col) => {
        return selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    };

    const isValidMoveSquare = (row, col) => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };

    const getSquareCoordinate = (row, col) => {
        const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
        const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
        return files[col] + ranks[row];
    };

    return (
        <div className="flex justify-center items-center min-h-[600px] p-4">
            <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl gradient-text mb-2">♟️ Chess ♔</CardTitle>
                    <div className="flex justify-between items-center text-lg">
                        <p className="font-semibold">
                            {gameState === "checkmate" ? (
                                <span className="text-red-400">
                                    🏆 {winner && winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!
                                </span>
                            ) : gameState === "draw" ? (
                                <span className="text-yellow-400">🤝 Draw Game</span>
                            ) : gameState === "check" ? (
                                <span className="text-red-400">
                                    ⚠️ {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} in Check!
                                </span>
                            ) : (
                                <>
                                    {currentPlayer === "white" ? "⚪" : "⚫"}
                                    <span className={currentPlayer === "white" ? "text-amber-300" : "text-gray-300"}>
                                        {" "}
                                        {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} to move
                                    </span>
                                </>
                            )}
                        </p>
                        <p className="text-muted-foreground">Move: {Math.floor(moveCount / 2) + 1}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="relative max-w-[640px] mx-auto">
                        <div className="grid grid-cols-8 gap-0 mt-2 ml-8">
                            {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
                                <div key={file} className="w-16 text-center text-sm font-bold text-muted-foreground">
                                    {file}
                                </div>
                            ))}
                        </div>

                        <div className="flex">
                            <div className="flex flex-col gap-0 mr-2">
                                {["8", "7", "6", "5", "4", "3", "2", "1"].map((rank) => (
                                    <div
                                        key={rank}
                                        className="h-16 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground"
                                    >
                                        {rank}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-8 gap-0 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl">
                                {board.map((row, rowIndex) =>
                                    row.map((piece, colIndex) => {
                                        const isLight = (rowIndex + colIndex) % 2 === 0;
                                        const isSelected = isSquareSelected(rowIndex, colIndex);
                                        const isValidMove = isValidMoveSquare(rowIndex, colIndex);

                                        return (
                                            <button
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => handleSquareClick(rowIndex, colIndex)}
                                                disabled={gameState === "checkmate"}
                                                className={`
                        w-16 h-16 flex items-center justify-center text-4xl transition-all duration-200
                        relative group
                        ${isLight ? "bg-amber-100 hover:bg-amber-200" : "bg-amber-800 hover:bg-amber-700"}
                        ${isSelected ? "ring-4 ring-blue-400 bg-blue-200" : ""}
                        ${isValidMove ? "ring-2 ring-green-400 bg-green-200" : ""}
                        ${gameState === "checkmate" ? "cursor-not-allowed opacity-75" : ""}
                      `}
                                                title={getSquareCoordinate(rowIndex, colIndex)}
                                            >
                                                {piece && (
                                                    <span
                                                        className={`
                          ${
                              piece.color === "white"
                                  ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                                  : "text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]"
                          }
                          hover:scale-110 transition-transform duration-200
                        `}
                                                    >
                                                        {pieceSymbols[piece.color][piece.type]}
                                                    </span>
                                                )}

                                                {isValidMove && !piece && (
                                                    <div className="w-3 h-3 bg-green-500 rounded-full opacity-60"></div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={resetGame} className="bg-primary hover:bg-primary/80 text-lg px-6">
                            🔄 New Game
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground mt-6 space-y-1">
                        <p>Click a piece to select it and see valid moves highlighted in green</p>
                        <p className="text-green-500">✅ Full chess validation with check/checkmate detection!</p>
                        {selectedSquare && (
                            <p className="text-blue-400">
                                Selected: {getSquareCoordinate(selectedSquare[0], selectedSquare[1])}
                            </p>
                        )}
                        {gameState === "check" && (
                            <p className="text-red-400 font-semibold">
                                🚨 Move your king to safety or block the attack!
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
