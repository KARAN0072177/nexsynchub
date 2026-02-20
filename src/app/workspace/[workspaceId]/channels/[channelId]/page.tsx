"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";

interface Message {
    _id: string;
    content: string;
    senderId: {
        username: string;
       // email: string;
    };
}

export default function ChannelPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const channelId = params.channelId as string;
    const [canSend, setCanSend] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [title, setTitle] = useState("");

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

    function openConvertModal(message: any) {
        setSelectedMessage(message);
        setTitle("");
    }

    async function createTask() {
        if (!title) return alert("Title required");

        await fetch(
            `/api/workspaces/${workspaceId}/tasks`,
            {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description: selectedMessage.content,
                    sourceMessageId: selectedMessage._id,
                    sourceChannelId: channelId,
                }),
            }
        );

        setSelectedMessage(null);
    }

    return (
        <div className="flex flex-col h-full">

            <div className="flex-1 overflow-y-auto space-y-2 mb-4 text-white">
                {messages.map((m) => (
                    <div
                        key={m._id}
                        className="text-sm group flex justify-between"
                    >
                        <div>
                            <span className="text-neutral-400 font-medium">
                                {m.senderId?.username || "Unknown"}
                            </span>
                            <span className="ml-2 text-white">
                                {m.content}
                            </span>
                        </div>

                        <button
                            onClick={() => openConvertModal(m)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-blue-400"
                        >
                            Convert
                        </button>
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

            {selectedMessage && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

                    <div className="bg-neutral-900 p-6 w-96 rounded">

                        <h2 className="text-lg font-semibold mb-4">
                            Create Task
                        </h2>

                        <input
                            className="border w-full p-2 mb-3"
                            placeholder="Task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            className="border w-full p-2 mb-3"
                            value={selectedMessage.content}
                            disabled
                        />

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="border px-4 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={createTask}
                                className="bg-blue-600 text-white px-4 py-2"
                            >
                                Create
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>


    );
}