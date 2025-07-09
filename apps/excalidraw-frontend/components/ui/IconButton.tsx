import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean
}) {
    return <div className={`m-2 pointer rounded-full p-2 bg-black hover:bg-gray-100 hover:text-black ${activated ? "text-red-400" : "text-white"}`} onClick={onClick}>
        {icon}
    </div>
}
