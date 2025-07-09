"use client";
import { BackgroundLines } from "@/components/ui/background-lines";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import React from "react";
import { Spotlight } from "@/components/ui/spotlight-new";
import { Rocket } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <>
    <div className="relative flex h-screen w-screen items-center justify-center  bg-black overflow-hidden">
      <Spotlight/>
      
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center  [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] bg-black">
      </div>
        
      <div className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
        <h1 className="font-mono">Doodlepad</h1>
        <p className="text-xl mt-4">A simple, open-source whiteboard for sketching diagrams with <br/> your team in real-time.</p>
        <div className=" text-2xl flex text-white z-20 ">
            <button 
            className="bg-black text-white rounded-4xl p-4 m-4 w-[180px] outline-amber-50 outline-2 flex justify-center items-center"
            onClick={()=>{
              router.push("/canvas/1")
            }}>Canvas <Rocket/>
              </button>
              <br />
            <button 
            className="text-black bg-white rounded-4xl p-4 m-4 w-[180px] flex justify-center items-center"
            onClick={()=>{
              router.push("dashboard")
            }}>Dashboard
            </button>
          </div>
            </div>
          <div className="absolute top-4 right-4 flex gap-4  p-2 rounded-lg font-bold capitalize">
          <button className="bg-black text-white rounded-4xl p-4 m-4 w-[180px] flex justify-center items-center outline-amber-50 outline-2 " onClick={()=>{
            router.push(`/signin`);
          }}>Signin</button>
          <button className="text-black bg-white rounded-4xl p-4 m-4 w-[180px] flex justify-center items-center" onClick={()=>{
            router.push("/signup");
            console.log("signup button clicked");
          }}>Signup</button>
        </div>  
      
    </div>

    </>
  );
}
