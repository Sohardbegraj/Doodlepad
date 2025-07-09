"use client";
import { WEBSOCKET_URL } from "@/draw/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MTE4MDI4NH0.878CLYvLzB3uRHFuYiHP2-DR22WQI73P99XFtSXHAgQ`);

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div className="flex h-screen items-center justify-center text-2xl text-gray-200 bg-black">
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}