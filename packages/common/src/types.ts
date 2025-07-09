import { z }from "zod";

export const createUserSchema =z.object({
    username:z.string().min(3).max(20),
    password:z.string(),
    name:z.string().min(3).max(10)
})

export const SigninSchema =z.object({
    username:z.string(),
    password:z.string()
})

export const RoomSchema =z.object({
    name:z.string()
})