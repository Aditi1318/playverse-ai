import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Play, Sun, Moon, Github, Linkedin, Instagram} from "lucide-react";
import {VoiceAssistant} from "./VoiceAssistant";
import {GameLauncher} from "./GameLauncher";
import {useTheme} from "./ThemeProvider";
import {Card, CardContent} from "@/components/ui/card";

const games = [
    {
        id: "snake",
        name: "Snake Game",
        description: "Classic snake game with growing mechanics",
        icon: "🐍",
        color: "from-green-400 to-emerald-500",
        difficulty: "Easy",
    },
    {
        id: "simon",
        name: "Simon Says",
        description: "Memory game with colors and sounds",
        icon: "🎵",
        color: "from-purple-400 to-pink-400",
        difficulty: "Medium",
    },
    {
        id: "flappy-bird",
        name: "Flappy Bird",
        description: "Navigate through pipes by flapping",
        icon: "🐦",
        color: "from-sky-400 to-blue-500",
        difficulty: "Hard",
    },
    {
        id: "bubbles",
        name: "Bubble Type",
        description: "Type letters to pop bubbles before time runs out",
        icon: "🫧",
        color: "from-cyan-400 to-teal-500",
        difficulty: "Medium",
    },
    {
        id: "tic-tac-toe",
        name: "Tic Tac Toe",
        description: "Simple X and O strategy game",
        icon: "⭕",
        color: "from-blue-400 to-indigo-500",
        difficulty: "Easy",
    },
    {
        id: "memory-match",
        name: "Memory Match",
        description: "Match pairs of cards to test your memory",
        icon: "🧠",
        color: "from-violet-400 to-purple-500",
        difficulty: "Medium",
    },
    {
        id: "guess-number",
        name: "Guess the Number",
        description: "Guess the mystery number with hints",
        icon: "🎯",
        color: "from-rose-400 to-pink-500",
        difficulty: "Easy",
    },
];

export const Dashboard = () => {
    const [selectedGame, setSelectedGame] = useState(null);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const {theme, setTheme} = useTheme();

    const handleGameSelect = (gameId) => setSelectedGame(gameId);
    const handleBackToDashboard = () => setSelectedGame(null);

    if (selectedGame) {
        return <GameLauncher gameId={selectedGame} onBack={handleBackToDashboard} />;
    }

    return (
        <div className="min-h-screen flex flex-col font-['Poppins',sans-serif] bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-black transition-colors duration-500">
            {/* 🌟 HEADER */}
            <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/30 dark:bg-black/30 border-b border-border/30 shadow-md">
                <div className="container mx-auto flex items-center justify-between py-5 px-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-['Comfortaa',sans-serif] tracking-wide">
                        PlayVerse AI ✨
                    </h1>
                    <div className="flex items-center gap-6">
                        <p className="hidden md:block text-muted-foreground text-sm italic">Play smarter, not harder</p>
                        <div className="flex items-center gap-2 bg-card/70 backdrop-blur-sm rounded-full px-4 py-2 border border-border/50 shadow-md">
                            <Sun className="h-4 w-4 text-amber-500" />
                            <Switch
                                checked={theme === "dark"}
                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                            />
                            <Moon className="h-4 w-4 text-blue-400" />
                        </div>
                    </div>
                </div>
            </header>

            {/* 🎮 MAIN CONTENT */}
            <main className="flex-1 container mx-auto p-6">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-foreground mb-2 font-['Comfortaa',sans-serif]">
                        Explore, Play & Challenge Your Mind
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Choose your favorite mini game and start the fun instantly!
                    </p>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {games.map((game) => (
                        <Card
                            key={game.id}
                            className="group cursor-pointer border-border/50 overflow-hidden hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm h-full"
                            onClick={() => handleGameSelect(game.id)}
                        >
                            <CardContent className="p-6 flex flex-col h-full">
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {game.icon}
                                </div>

                                <h3 className="text-xl font-bold mb-2 text-gray-600 dark:text-gray-300 font-['Comfortaa',sans-serif]">
                                    {game.name}
                                </h3>

                                <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-grow">
                                    {game.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            game.difficulty === "Easy"
                                                ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30"
                                                : game.difficulty === "Medium"
                                                ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                                                : "bg-rose-500/20 text-rose-600 border border-rose-500/30"
                                        }`}
                                    >
                                        {game.difficulty}
                                    </span>
                                    <Button
                                        size="sm"
                                        className="w-24 justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Play className="w-4 h-4 mr-1" />
                                        Play
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/20 shadow-lg">
                        <CardContent className="p-8 text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 font-['Comfortaa',sans-serif]">
                                7
                            </div>
                            <div className="text-muted-foreground font-medium">Games Available</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/20 shadow-lg">
                        <CardContent className="p-8 text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-3 font-['Comfortaa',sans-serif]">
                                ∞
                            </div>
                            <div className="text-muted-foreground font-medium">Hours of Fun</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/20 shadow-lg">
                        <CardContent className="p-8 text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent mb-3 font-['Comfortaa',sans-serif]">
                                AI
                            </div>
                            <div className="text-muted-foreground font-medium">Powered Gaming</div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* 🎤 Floating Voice Assistant */}
            <div className="floating-voice">
                <VoiceAssistant
                    onGameSelect={handleGameSelect}
                    isActive={isVoiceActive}
                    setIsActive={setIsVoiceActive}
                />
            </div>

            {/* 🌈 FOOTER */}
            <footer className="mt-16 py-6 border-t border-border/30 backdrop-blur-md bg-white/20 dark:bg-black/30">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} <span className="font-semibold">PlayVerse AI</span> — Built with ❤️
                        by Aditi
                    </p>
                    <div className="flex gap-4">
                        <a href="https://github.com/Aditi1318/" className="hover:text-purple-500 transition">
                            <Github className="w-4 h-4" />
                        </a>
                        <a href="https://www.linkedin.com/in/aditi-diwakar/" className="hover:text-blue-500 transition">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a href="https://www.instagram.com/aditisi1318/" className="hover:text-pink-500 transition">
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
