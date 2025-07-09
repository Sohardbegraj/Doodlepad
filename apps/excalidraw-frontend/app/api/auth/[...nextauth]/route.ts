import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prismaClient } from "@repo/db/client";
import { error } from "console";
const handler = NextAuth({
        providers: [
            CredentialsProvider({
            name: "Credentials",
            credentials: {
            email: { label: "Email", type: "text", placeholder: "xyz@gmail.com" },
            password: { label: "Password", type: "password",placeholder: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("enter email/password");
                }
                try {
                    const user = await prismaClient.user.findFirst({
                        where: {
                            email: credentials.email,
                            password: credentials.password
                        }
                    });
                    if (!user) {
                        throw new Error("Invalid email or password");
                    }
                    // Return the user object directly
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.photo || undefined
                    };
                } catch (err) {
                    console.log(err);
                    return null;
                }
            }
            }),
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!
            }),
            GitHubProvider({
                clientId: process.env.GITHUB_ID!,
                clientSecret: process.env.GITHUB_SECRET!
            })
        ],
        callbacks: {
            async jwt({ token, user }) {
                // Persist the OAuth access_token and or the user id to the token right after signin
                if (user) {
                    token.id = user.id;
                }
                return token;
            },
            async session({ session, token }) {
                // Attach the user id from token to the session
                (session.user as any).id = token.id;
                return session;
            },
            async signIn({account,profile}){
                if(!profile?.email){
                    throw new Error("no profile");
                }
                await prismaClient.user.upsert({
                    where:{
                        email:profile?.email,
                    },
                    create:{
                        email: profile?.email,
                        name: profile?.name ?? "",
                        password: "", // Set a default or random password for OAuth users
                        photo: profile?.image || ""
                    },
                    update:{
                        name: profile.name ?? "",
                        photo: profile?.image || ""
                    },

                });
                return true;
            }
        },
        pages:{
            signIn:"/signin",
            signOut:"/signup",
            error:"/signin"
        },
        session:{
            strategy:"jwt",
            maxAge:30*24*60*60,
        },
        secret:process.env.NEXTAUTH_SECRET
    });
export { handler as GET, handler as POST };