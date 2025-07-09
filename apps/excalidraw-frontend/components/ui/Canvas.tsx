
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { BrainCircuit, CaseSensitive, Circle, Eraser, LineChart, MoveRight, Pencil, RectangleHorizontalIcon, Text, TextCursor } from "lucide-react";
import { Game } from "@/draw/Game";
import axios from "axios";

export type Tool = "circle" | "rect" | "pencil" | "eraser" | "text" | "line" ;

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
    const [aiResult,setaiResult]=useState("");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }


    }, [canvasRef]);

const captureScreenshot = () => {
    const canvas = document.querySelector("canvas"); // Adjust selector if needed
    if (!canvas) {
        console.error("Canvas element not found."); // Added for better debugging
        return;
    }

    const dataURL = canvas.toDataURL("image/png"); // This correctly generates a base64 data URL
    return dataURL;
};

const handleBrain = async () => {
    const screenshot = captureScreenshot();
    if (!screenshot) {
        // captureScreenshot already logs an error if canvas isn't found,
        // but this ensures handleBrain doesn't proceed without a screenshot.
        return;
    }

    try {
        const response = await fetch("/api/analyze-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: screenshot }), // Sends the base64 data URL
        });

        if (!response.ok) {
            const errorResult = await response.json();
            console.error("API Error:", errorResult);
            // You might want to display an error message to the user here
            return;
        }

        const result = await response.json();
        console.log("AI Response:", result);

        // Accessing the generated text from the Gemini response:
        // Based on the backend code, the response structure will be { generatedText: "...", rawResponse: {...} }
        if (result.generatedText) {
            setaiResult(result.generatedText);
            console.log("Gemini's Analysis:", result.generatedText);
            // You can now display result.generatedText in your UI
        } else {
            console.warn("Gemini did not return generated text:", result);
            // Handle cases where the model might not return text (e.g., if maxOutputTokens was too low or content was inappropriate)
        }

    } catch (error) {
        console.error("Error sending screenshot to API:", error);
        // Handle network errors or other unexpected issues
    }
};

    return <div style={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000",
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool}  />
        <div className=" absolute z-50 top-0 right-0 w-1/4 p-2 text-white ">{aiResult}</div>
    </div>
    

function Topbar({selectedTool, setSelectedTool}: {
    selectedTool: Tool,
    setSelectedTool: (s: Tool) => void,
}) {
    return <div style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
        }}>
            <div className="flex gap-t bg-[#373A40] rounded-b-lg">
                <IconButton 
                    onClick={() => {
                        setSelectedTool("pencil")
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect")
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle")
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>

                <IconButton 
                    onClick={() => {
                        setSelectedTool("eraser")
                    }}
                    activated={selectedTool === "eraser"}
                    icon={<Eraser/>}
                />
                <IconButton 
                    onClick={() => {
                        setSelectedTool("text")
                    }}
                    activated={selectedTool === "text"}
                    icon={<CaseSensitive/>}
                />
                <IconButton 
                    onClick={() => {
                        setSelectedTool("line")
                    }}
                    activated={selectedTool === "line"}
                    icon={<MoveRight/>}
                />
                <IconButton 
                    onClick={handleBrain}
                    activated={true}
                    icon={<BrainCircuit />}
                />

            </div>
        </div>
}
}
