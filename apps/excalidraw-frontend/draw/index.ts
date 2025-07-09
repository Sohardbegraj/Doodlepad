import { HTTP_BACKEND } from "./config";
import axios from "axios";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: { x: number; y: number }[];
} |{
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");
    let currentPencilPath: { x: number; y: number }[] = [];

    let existingShapes: Shape[] = await getExistingShapes(roomId)

    if (!ctx) {
        return
    }

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type == "chat") {
            const parsedShape = JSON.parse(message.message)
            existingShapes.push(parsedShape.shape)
            clearCanvas(existingShapes, canvas, ctx);
        }
    }
    

    clearCanvas(existingShapes, canvas, ctx);
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true
        startX = e.offsetX
        startY = e.offsetY
        // @ts-ignore
        const selectedTool = window.selectedTool;
        if (selectedTool === "pencil") {
            currentPencilPath = [{ x: startX, y: startY }];
        }
        
    })

    canvas.addEventListener("mouseup", (e) => {
        clicked = false
        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        // @ts-ignore
        const selectedTool = window.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: startX,
                y: startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: startX + radius,
                centerY: startY + radius,
            }
            
        }
        else if( selectedTool === "line") {
            shape = {
                type: "line",
                startX: startX,
                startY: startY,
                endX: e.offsetX,
                endY: e.offsetY
            }
        }
           else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                points: currentPencilPath
            };
            currentPencilPath = []; // reset
        }
        else if (selectedTool === "text") {
            const text = prompt("Enter text:");
            if (!text) return;
            shape = {
                type: "text",
                x: startX,
                y: startY,
                text
            }
        }

        if (!shape) {
            return;
        }

        existingShapes.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))

    })

    canvas.addEventListener("mousemove", (e :any ) => {
        if (clicked) {
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = "rgba(255, 255, 255)"
            // @ts-ignore
            const selectedTool = window.selectedTool;
            if (selectedTool === "rect") {
                ctx.strokeRect(startX, startY, width, height);   
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = startX + radius;
                const centerY = startY + radius;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();                
            }
            else if (selectedTool === "line") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(width, height);
                ctx.stroke();
                ctx.closePath();
            }
                    else if (selectedTool === "pencil") {
            const point = { x: e.offsetX, y: e.offsetY };
            currentPencilPath.push(point);

            ctx.beginPath();
            ctx.moveTo(currentPencilPath[currentPencilPath.length - 2].x, currentPencilPath[currentPencilPath.length - 2].y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.closePath();
        }
            
        }
    })            
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.lineWidth =4;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "rgba(255, 255, 255)"
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();                
        }else if(shape.type== "line"){
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
        }
       else if (shape.type === "pencil") {
            ctx.beginPath();
            const points = shape.points;
            for (let i = 1; i < points.length; i++) {
                ctx.moveTo(points[i - 1].x, points[i - 1].y);
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            ctx.closePath();
        }
        else if (shape.type === "text") {
            ctx.fillStyle = "white";
            ctx.fillText(shape.text, shape.x, shape.y);
        }
    })
}

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}