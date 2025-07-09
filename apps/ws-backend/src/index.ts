import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload }  from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss= new WebSocketServer({port:8080});

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

const checkuser = (token: string): string | null => {
    try{
        const decoded=jwt.verify(token,JWT_SECRET);

        if(typeof decoded == "string"){
            return null;
        }

        if(!decoded || !decoded.userId){
            return null;
        }
        return decoded.userId ;
    }
    catch(e) {
        console.error("Token verification failed:", e);
        return null;
    }
    
};

wss.on('connection',function connection(ws,request){
    const url=request.url
    if(!url){
        return;
    }
    const queryparam=new URLSearchParams(url.split('?')[1]);
    const token= queryparam.get('token') || "";

    const userId = checkuser(token);
    if(userId==null){
        ws.close();
        return;
    }
    console.log(`User connected: ${userId}`);

    users.push({
    userId,
    rooms: [],
    ws
  })


    ws.on('message',async function message(data){
        console.log(`Received message from ${userId}: ${data}`);
        let message;
    if (typeof data !== "string") {
      message = JSON.parse(data.toString());
    } else {
      message = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

        if (message.type === "join") {
        const user = users.find(x => x.ws === ws);
        user?.rooms.push(message.roomId);
        }
        if(message.type === 'chat') {
            console.log(`Chat message from ${userId}: ${message.message}`);


            const rawRoomId = message.roomId;
            const messageContent = message.message;
            console.log(messageContent, rawRoomId);
            

            const roomId = Number(rawRoomId);

        if (isNaN(roomId)) {
            console.error(`Invalid roomId:`, rawRoomId);
            return; // or send error back to client
        }
            
            await prismaClient.chat.create({
                data: {
                    roomId:roomId,
                    userId: userId.toString(),
                    message: messageContent,
                }
            });
        users.forEach(user => {
        if (user.rooms.includes(rawRoomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: messageContent,
            rawRoomId: rawRoomId,
          }))
        }
      })
    }

        if(message.type === 'disconnect') {
            const userIndex = users.find(u => u.ws !== ws);
            if(!userIndex) {
                return;
            }
            userIndex.rooms= userIndex.rooms.filter(x => x === message.roomId);
        }

        });
});