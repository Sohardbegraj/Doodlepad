"use client"
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface RoomCardProps {
  setroomname: React.Dispatch<React.SetStateAction<boolean>>;
}
const RoomCard = ({setroomname}:RoomCardProps) => {
  const [roomCode, setRoomCode] = useState("");
  const router=useRouter();

const handleCreateRoom = async( ) => {
    try {
      const res = await axios.post("api/user/createroom", {
        name: roomCode
      });
      router.push(`canvas/${res.data.roomId}`);
    } catch (error: any) {
      if (error.response) {
        // Server responded with a status code outside 2xx
        console.error("Error:", error.response.data);
      } else {
        // Network error or something else
        console.error("Unexpected error:", error.message);
      }
    }
};

   

  return (
    <div className="h-screen w-screen backdrop-blur-md flex items-center justify-center">
    <div className="min-h-screen flex items-center justify-center text-white font-mono ">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg  space-y-4 border border-zinc-700 w-full relative">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Create A New Room
        </h1>

        <button className="bg-white text-black p-1 rounded-md hover:bg-red-700 absolute top-2 right-2 text-sm hover:text-white"
            onClick={()=>{
                setroomname(!setroomname)
            }}
        >
            close
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomCode}
            required
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-grow px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 placeholder-zinc-400 focus:outline-none"
          />
          <button
            className="bg-white text-black px-4 rounded-md font-semibold hover:bg-gray-600 transition"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default RoomCard;