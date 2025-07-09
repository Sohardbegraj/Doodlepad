import express from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { auth } from "./auth";
import { createUserSchema ,SigninSchema ,RoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app=express();
app.use(express.json());
app.use(cors())


app.post("/signup",async(req,res)=>{
    const parseddata =createUserSchema.safeParse(req.body);

    if(!parseddata.success){
        res.json({
            message:"invalid input"
        })
        return;
    }
    try{
        const user =await prismaClient.user.create({
        data:{
            email:parseddata.data?.username,
            password:parseddata.data?.password,
            name:parseddata.data?.name
        }
})
        res.json({
            message:"user created successfully",
            userId: user.id
        });

    }catch(e :any){
        res.json({
            error: e.message,
            message:"error while creating user"
        })
        return;
    }

});

app.post("/signin",(req,res)=>{
    const parseddata =SigninSchema.safeParse(req.body);

    if(!parseddata.success){
        res.json({
            message:"invalid input"
        })
        return;
    }
    const user =prismaClient.user.findFirst({
        where:{
            email:parseddata.data?.username,
            password:parseddata.data?.password
        }
    });
    if(!user){
        res.json({
            message:"user not found"
        })
        return;
    }
    const userId=1;
    const token=jwt.sign({
        userId
    },JWT_SECRET)

    res.json({
        token
    })

})
app.post("/room",async(req,res)=>{
    const parsedData =RoomSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId.toString(),
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e : any) {
        res.status(411).json({
            error: e.message,
            message: "Room already exists with this name"
        })
    }

})
app.delete("/room/:roomId", auth, async (req, res) => {
    const chatId = Number(req.body.chatId);
    try {
        await prismaClient.chat.delete({
            where: {
                id: chatId
            }
        });

        res.json({
            message: "chat deleted successfully"
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: "Error deleting room"
        });
    }
})

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 50
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})



app.listen(5050)