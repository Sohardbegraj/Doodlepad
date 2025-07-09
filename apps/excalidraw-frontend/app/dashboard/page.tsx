"use client"
import { SessionProvider, signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Grid } from "./components/card";
import { useRouter } from "next/navigation";
import { Folder, Plus, Trash } from "lucide-react";
import { Cover } from "@/components/ui/cover";
import Link from "next/link";
import RoomCard from "./components/Createroom";
import Joinroom from "./components/joinroom";
import axios from "axios";


const options: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

export default function page(){
  return(
    <SessionProvider >
      <Dashboard/>
    </SessionProvider>
  )
}

function Dashboard(){
  const { data: session, status } = useSession();
  const [roomname ,setroomname]=useState(false);
  const [joinroom ,setjoinroom]=useState(false);
  const router =useRouter();
    const [rooms, setRooms] = useState([]);
      useEffect(() => {
        const fetchRooms = async () => {
          const res = await fetch("/api/user/rooms");
          const data = await res.json();
          setRooms(data.rooms);
        };
    
        fetchRooms();
      }, [roomname]); 
      
    const handleDelete = async (roomid: number) => {
      const res = await axios.delete(`api/user/deleteroom`, {
        params: { id: roomid }
      });
      console.log(res)
    }
    
    if (status === "authenticated") {
    return <div className="flex bg-[#202123] text-white h-screen w-screen">
    <div className="w-full relative">
    <div className="text-3xl p-4 font-mono">
     <Cover> Welcome,{session.user.name}</Cover>
    </div>
    <div className="py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 max-w-7xl mx-auto">
            <div
                className="relative bg-gradient-to-b from-neutral-900  to-neutral-950  p-6 rounded-3xl overflow-hidden"
              >
                <Grid size={20} />
                <p className="text-base font-bold text-white relative z-20">
                  created room
                </p>
                <button className="bg-black outline-2 outline-gray-100  p-2 w-full m-2 rounded-2xl "                
                  onClick={()=>{
                    setroomname(!roomname)
                  }}
                > create room
                </button>
                <button className="bg-white text-black p-2 w-full m-2 rounded-2xl "
                  onClick={()=>{
                    setjoinroom(!joinroom)
                  }}
                >
                  join room</button>
              </div>
            {rooms.map((room:any) => (
              <div
                key={room.id}
                className="relative bg-gradient-to-b from-neutral-900  to-neutral-950  p-6 rounded-3xl overflow-hidden"
              >
                <Grid size={20} />
                <p className="text-base font-bold text-white relative z-20">
                  {room.slug}
                </p>
                <p className="text-neutral-400 mt-4 text-base font-normal relative z-20">
                  Created at:
                  {
                    new Date(room.createdAt).toLocaleString('en-IN', options)
                  }
                  
                </p>
                <div className="flex p-4">
                <button className="bg-black outline-2 outline-gray-100  p-2 w-full m-2 rounded-2xl "
                onClick={()=>{
                  router.push(`canvas/${room.id}`)
                }}
                >Open
                </button>
                <button className="bg-white text-black p-2 w-full m-2 rounded-2xl "
                onClick={()=>handleDelete(room.id)}
                >
                  delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="bg-white text-black rounded-2xl fixed top-4 right-4 p-4 font-extrabold"
        onClick={()=>{
          signOut()
        }}
        >
          Signout
        </button>
        {
          roomname && <div className='absolute top-0 left-0 z-50'>
            <RoomCard setroomname={setroomname}/>
          </div>
        }{
            joinroom && <div className='absolute top-0 left-0 z-50'>
            <Joinroom setjoinroom={setjoinroom}/>
          </div>
        }
    </div>
    </div>
  }
  if(status=== "loading"){
    return (
      <div className="h-screen w-screen text-5xl flex justify-center items-center bg-black text-white">
        Loading
      </div>
    )
  }

  return <Link href="/signin">Sign in</Link>
}
