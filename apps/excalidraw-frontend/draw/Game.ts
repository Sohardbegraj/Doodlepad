import { Tool } from "@/components/ui/Canvas";
import { getExistingShapes } from "@/draw/index";
import { log } from "console";
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
}|{
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
 

export class Game {
    private currentPencilPath: { x: number; y: number }[] = [];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "pencil";
    public getShapes(): Shape[] {
        return this.existingShapes;
    }

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    private createTextInput(x: number, y: number) {
  const input = document.createElement("input");
  input.type = "text";
  input.style.position = "absolute";
  input.style.left = `${x}px`;
  input.style.top = `${y}px`;
  input.style.fontSize = "20px";
  input.style.padding = "2px";
  input.style.color = "white";
  input.style.background = "transparent";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.zIndex = "1000";

  document.body.appendChild(input);
  input.focus();

  const finishInput = () => {
    const text = input.value.trim();
    if (text) {
      const shape: Shape = {
        type: "text",
        x,
        y,
        text,
      };
      this.existingShapes.push(shape);
      this.clearCanvas();

      this.socket.send(JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId
      }));
    }
    input.remove();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      finishInput();
    }
  });

  input.addEventListener("blur", finishInput);
}

    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "eraser" | "text" | "line") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            console.log(shape);
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if(shape.type== "line"){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
             else if (shape.type === "pencil") {
                const points = shape.points;
                if (points.length < 2) return;
                this.ctx.beginPath();
                for (let i = 1; i < points.length; i++) {
                    this.ctx.moveTo(points[i - 1].x, points[i - 1].y);
                    this.ctx.lineTo(points[i].x, points[i].y);
                }
                this.ctx.stroke();
                this.ctx.closePath();
            }
            
            else if (shape.type === "text") {
                this.ctx.fillStyle = "white";
                this.ctx.font = "30px monospace"; // Set font size and family
                this.ctx.fillText(shape.text, shape.x, shape.y);
                
            }
        })
    }

    mouseDownHandler = (e:any) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        if (this.selectedTool === "pencil") {
            this.currentPencilPath = [{ x: e.clientX, y: e.clientY }];
        }
    }
    mouseUpHandler = (e:any) => {
        this.clicked = false
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        }
        else if (selectedTool === "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        } 
        else if (selectedTool === "pencil") {
            if (this.currentPencilPath.length < 2) return;
            shape = {
                type: "pencil",
                points: [...this.currentPencilPath]
            };
            this.currentPencilPath = []; // Reset
        }

        else if (selectedTool === "text") {
            const rect = this.canvas.getBoundingClientRect();
            const canvasX = e.clientX - rect.left;
            const canvasY = e.clientY - rect.top;
            this.createTextInput(canvasX, canvasY);
            return; // Don't proceed further
        }

        else if (selectedTool === "eraser") {
        const radius = 20;
        const eraseX = e.clientX;
        const eraseY = e.clientY;

  // Filter out shapes that are within a certain distance
  this.existingShapes = this.existingShapes.filter(shape => {
    if (shape.type === "rect") {
      return !(
        eraseX >= shape.x &&
        eraseX <= shape.x + shape.width &&
        eraseY >= shape.y &&
        eraseY <= shape.y + shape.height
      );
    } else if (shape.type === "circle") {
      const dx = eraseX - shape.centerX;
      const dy = eraseY - shape.centerY;
      return Math.sqrt(dx * dx + dy * dy) > shape.radius;
    } else if (shape.type === "line") {
    return !isPointNearLine(eraseX, eraseY, shape.startX, shape.startY, shape.endX, shape.endY, radius);
    } else if (shape.type === "text") {
      return Math.abs(eraseX - shape.x) > radius || Math.abs(eraseY - shape.y) > radius;
    } else if (shape.type === "pencil") {
      return !shape.points.some(p => {
        const dx = p.x - eraseX;
        const dy = p.y - eraseY;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });
    }
    return true;
  });

  this.clearCanvas();
  return;
}

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
        this.clearCanvas();

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (e:any) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool = this.selectedTool;
            console.log(selectedTool)
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if (selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (selectedTool === "pencil") {
                const newPoint = { x: e.clientX, y: e.clientY };
                this.currentPencilPath.push(newPoint);

                const lastPoint = this.currentPencilPath[this.currentPencilPath.length - 2];

                if (!lastPoint) return;

                this.ctx.beginPath();
                this.ctx.moveTo(lastPoint.x, lastPoint.y);
                this.ctx.lineTo(newPoint.x, newPoint.y);
                this.ctx.stroke();
                this.ctx.closePath();
            }

             else if (selectedTool === "text") {
                // Do nothing for text tool
            }
            else if (this.selectedTool === "eraser") {
                const eraseX = e.clientX;
                const eraseY = e.clientY;
                const radius = 20;
                this.existingShapes = this.existingShapes.filter(shape => {
                if (shape.type === "rect") {
                return !(
                    eraseX >= shape.x &&
                    eraseX <= shape.x + shape.width &&
                    eraseY >= shape.y &&
                    eraseY <= shape.y + shape.height
                );
            } else if (shape.type === "circle") {
                const dx = eraseX - shape.centerX;
                const dy = eraseY - shape.centerY;
                return Math.sqrt(dx * dx + dy * dy) > shape.radius;
            } else if (shape.type === "line") {
                // Optional: remove if close to line
                return true;
            } else if (shape.type === "text") {
                return Math.abs(eraseX - shape.x) > radius || Math.abs(eraseY - shape.y) > radius;
            } else if (shape.type === "pencil") {
                return !shape.points.some(p => {
                const dx = p.x - eraseX;
                const dy = p.y - eraseY;
                return Math.sqrt(dx * dx + dy * dy) < radius;
                });
            }
            return true;
            });

            this.clearCanvas();
            return;
                }

        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

    }
}

function isPointNearLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}

