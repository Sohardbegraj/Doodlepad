"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";


export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  return (
    <div className={styles.page}>
      <input type="text" placeholder="roomid" value={roomId} onChange={(e) => setRoomId(e.target.value)}></input>
      <button onClick={() => {
        if (roomId.trim() === "") {
          alert("Please enter a valid room ID");
          return;
        }
        router.push(`/room/${roomId}`);
      }}>Join Room</button>
    </div>
  );
}
