"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";

interface Message {
    _id: string;
    content: string;
    senderId: {
        email: string;
    };
}

export default function ChannelPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const channelId = params.channelId as string;
    const [canSend, setCanSend] = useState(true);

    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    // Load history
    useEffect(() => {
        fetch(
            `/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
            { credentials: "include" }
        )
            .then((res) => res.json())
            .then((data) => setMessages(data.messages));

        fetch(`/api/workspaces/${workspaceId}/permissions`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => setCanSend(data.canSend));


        socket.connect();
        socket.emit("join-channel", { channelId });

        socket.on("new-message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("new-message");
            socket.disconnect();
        };
    }, [channelId]);

    function sendMessage() {
        if (!text) return;



        socket.emit("send-message", {
            workspaceId,
            channelId,
            content: text,
        });

        setText("");
    }

    return (
        <div className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 text-white">
                {messages.map((m) => (
                    <div key={m._id} className="text-sm">
                        <span className="text-neutral-400 font-medium">
                            {m.senderId?.email}
                        </span>
                        <span className="ml-2 text-white">
                            {m.content}
                        </span>
                    </div>
                ))}
            </div>

            {!canSend && (
                <p className="text-xs text-red-400 mb-2">
                    You don't have permission to message in this channel.
                    Ask workspace owner for access.
                </p>
            )}

            <div className="flex gap-2">

                <input
                    disabled={!canSend}
                    className="border p-2 flex-1"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                        canSend
                            ? "Type message..."
                            : "Read-only channel"
                    }
                />

                <button
                    disabled={!canSend}
                    onClick={sendMessage}
                    className={`px-4 ${canSend
                        ? "bg-black text-white"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed"
                        }`}
                >
                    Send
                </button>
            </div>

        </div>
    );
}