import axios from "axios";
import { BACKEND_URL } from "../../config";
import { ChatRoom } from "../../../component/Chatroom";


async function getRoomId(slug: string) {
    const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
    console.log(response.data);
    return response.data.room.id;
}

export default async function ChatRoom1({
    params
}: {
    params: {
        slug: string
    }
}) {
    const slug = params.slug;
    const roomId = await getRoomId(slug);
    return (
        <div>
            <h1>Room: {slug}</h1>
            <p>Room ID: {roomId}</p>
            <br /><br /><br />
            
            <ChatRoom id={roomId} />
        </div>
        
    )
    

}