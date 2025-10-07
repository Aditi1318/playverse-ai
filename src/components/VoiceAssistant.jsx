import React, {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Mic, MicOff, Volume2} from "lucide-react";
import {toast} from "@/hooks/use-toast";

export const VoiceAssistant = ({onGameSelect, isActive, setIsActive}) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
            const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognitionConstructor();

            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = "en-US";

            recognitionInstance.onstart = () => {
                setIsListening(true);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log("Voice command:", transcript);
                handleVoiceCommand(transcript);
            };

            recognitionInstance.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                toast({
                    title: "Voice Error",
                    description: "Could not understand. Please try again.",
                    variant: "destructive",
                });
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        } else {
            console.warn("Speech recognition not supported");
            toast({
                title: "Not Supported",
                description: "Voice recognition is not supported in this browser.",
                variant: "destructive",
            });
        }
    }, []);

    const handleVoiceCommand = (command) => {
        const gameMap = {
            snake: "snake",
            simon: "simon-says",
            "flappy bird": "flappy-bird",
            bubbles: "bubbles",
            chess: "chess",
            "tic tac toe": "tic-tac-toe",
            memory: "memory-match",
            "guess number": "guess-number",
        };

        if (command.includes("start") || command.includes("play") || command.includes("open")) {
            for (const keyword in gameMap) {
                if (command.includes(keyword)) {
                    speak(`Starting ${keyword} game`);
                    onGameSelect(gameMap[keyword]);
                    return;
                }
            }
        }

        if (command.includes("hello") || command.includes("hi")) {
            speak('Hello! Welcome to PlayVerse AI. Say "start" followed by a game name to play.');
        } else if (command.includes("help")) {
            speak(
                'You can say commands like "start chess", "play flappy bird", or "open memory match" to launch games.'
            );
        } else {
            speak('Sorry, I did not understand that command. Try saying "start" followed by a game name.');
        }
    };

    const speak = (text) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);

            toast({
                title: "AI Assistant",
                description: text,
            });
        }
    };

    const toggleVoiceAssistant = () => {
        if (!recognition) {
            toast({
                title: "Not Available",
                description: "Voice recognition is not supported in this browser.",
                variant: "destructive",
            });
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            toast({
                title: "Listening...",
                description: "Say a command like 'start chess' or 'play snake'.",
            });
        }
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <Button
                onClick={toggleVoiceAssistant}
                size="lg"
                className={`relative rounded-full w-16 h-16 p-0 ${
                    isListening
                        ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 neon-glow"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 neon-glow"
                } transition-all duration-300 shadow-2xl`}
            >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}

                {isListening && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse" />
                )}
            </Button>

            <Button
                onClick={() => speak("Welcome to PlayVerse AI! Your intelligent gaming companion.")}
                variant="outline"
                size="sm"
                className="rounded-full bg-card/80 backdrop-blur-sm border-primary/30 hover:border-primary/50 shadow-lg"
            >
                <Volume2 className="w-4 h-4" />
            </Button>
        </div>
    );
};
