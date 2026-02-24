"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { useRef } from "react";

interface Message {
    _id: string;
    type?: "text" | "file" | "image" | "video" | "audio" | "link";

    content?: string;

    attachment?: {
        url: string;
        name: string;
        size: number;
        mimeType: string;
        provider: "s3" | "cloudinary";
    };

    senderId: {
        username: string;
    };
}

export default function ChannelPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const channelId = params.channelId as string;
    const [canSend, setCanSend] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [title, setTitle] = useState("");

    const [priority, setPriority] = useState("medium");
    const [members, setMembers] = useState<any[]>([]);
    const [assignees, setAssignees] = useState<string[]>([]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);

    // Load history
    useEffect(() => {
        // Load messages
        fetch(
            `/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
            { credentials: "include" }
        )
            .then((res) => res.json())
            .then((data) => setMessages(data.messages));

        // Load permissions
        fetch(`/api/workspaces/${workspaceId}/permissions`, {
            credentials: "include",
        })
            .then(res => res.json())
            .then(data => setCanSend(data.canSend));

        // Load members
        loadMembers();

        // Socket
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

    function selectMention(username: string) {
        const newText = text.replace(/@\w*$/, `@${username} `);
        setText(newText);
        setShowMentions(false);
    }

    async function uploadFile(file: File) {
        const res = await fetch("/api/attachments/presign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                filename: file.name,
                mimeType: file.type,
                size: file.size,
            }),
        });

        const data = await res.json();

        // S3
        if (data.provider === "s3") {
            await fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });

            return {
                url: data.fileUrl,
                provider: "s3",
            };
        }

        // Cloudinary
        const form = new FormData();
        form.append("file", file);
        form.append("api_key", data.apiKey);
        form.append("timestamp", data.timestamp);
        form.append("signature", data.signature);
        form.append("public_id", data.publicId);

        const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`,
            {
                method: "POST",
                body: form,
            }
        );

        const cloudData = await cloudRes.json();

        return {
            url: cloudData.secure_url,
            provider: "cloudinary",
        };
    }

    async function handleFileSelect(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);

            const uploaded = await uploadFile(file);

            const payload = {
                workspaceId,
                channelId,
                type: file.type.startsWith("image/")
                    ? "image"
                    : file.type.startsWith("video/")
                        ? "video"
                        : "file",

                attachment: {
                    url: uploaded.url,
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    provider: uploaded.provider,
                },
            };

            // 🔍 DEBUG LOG
            console.log("FRONTEND EMIT PAYLOAD:", payload);

            socket.emit("send-message", payload);

        } catch (err) {
            console.error("UPLOAD ERROR:", err);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    }

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
        if (message.type !== "text") {
            alert("Only text messages can be converted into tasks.");
            return;
        }

        setSelectedMessage(message);
        setTitle("");
        setAssignees([]);
    }

    function renderMessageWithMentions(text: string) {
        const parts = text.split(/(@\w+)/g);

        return parts.map((part, i) => {
            if (part.startsWith("@")) {
                return (
                    <span
                        key={i}
                        className="text-blue-400 font-medium"
                    >
                        {part}
                    </span>
                );
            }

            return <span key={i}>{part}</span>;
        });
    }

    async function loadMembers() {
        const res = await fetch(
            `/api/workspaces/${workspaceId}/members`,
            { credentials: "include" }
        );
        const data = await res.json();
        setMembers(data.members || []);
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
                    priority,
                    assignees,
                    sourceMessageId: selectedMessage._id,
                    sourceChannelId: channelId,
                }),
            }
        );

        setSelectedMessage(null);
        setAssignees([]);
        setPriority("medium");
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

                                {m.type === "text" && renderMessageWithMentions(m.content || "")}

                                {m.type === "image" && (
                                    <img
                                        src={m.attachment?.url}
                                        className="max-w-xs rounded mt-1"
                                    />
                                )}

                                {m.type === "file" && (
                                    <a
                                        href={m.attachment?.url}
                                        target="_blank"
                                        className="text-blue-400 underline"
                                    >
                                        📎 {m.attachment?.name}
                                    </a>
                                )}

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

                {showMentions && (
                    <div className="absolute bottom-16 bg-neutral-800 border rounded w-64 max-h-40 overflow-y-auto z-50">

                        {filteredMembers.length === 0 && (
                            <p className="p-2 text-sm text-gray-400">
                                No member found by "{mentionQuery}"
                            </p>
                        )}

                        {filteredMembers.map(m => (
                            <button
                                key={m.userId._id}
                                onClick={() => selectMention(m.userId.username)}
                                className="block w-full text-left px-3 py-2 hover:bg-neutral-700"
                            >
                                @{m.userId.username}
                            </button>
                        ))}
                    </div>
                )}

                <input
                    disabled={!canSend}
                    className="border p-2 flex-1"
                    value={text}
                    onChange={(e) => {
                        const value = e.target.value;
                        setText(value);

                        const match = value.match(/@(\w*)$/);

                        if (match) {
                            const query = match[1].toLowerCase();
                            setMentionQuery(query);

                            const results = members.filter(m =>
                                m.userId.username
                                    .toLowerCase()
                                    .includes(query)
                            );

                            setFilteredMembers(results);
                            setShowMentions(true);
                        } else {
                            setShowMentions(false);
                        }
                    }}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={handleFileSelect}
                />

                <button
                    disabled={!canSend || uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 border"
                >
                    📎
                </button>

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

                        {/* Title */}
                        <input
                            className="border w-full p-2 mb-3"
                            placeholder="Task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        {/* Description */}
                        <textarea
                            className="border w-full p-2 mb-3"
                            value={selectedMessage.content}
                            disabled
                        />

                        {/* Priority */}
                        <select
                            className="border w-full p-2 mb-3"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>

                        {/* Assignees */}
                        <div className="mb-3">
                            <p className="text-sm mb-1">Assign To</p>

                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {members.map((m) => (
                                    <label
                                        key={m.userId._id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={assignees.includes(m.userId._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setAssignees([...assignees, m.userId._id]);
                                                } else {
                                                    setAssignees(
                                                        assignees.filter(id => id !== m.userId._id)
                                                    );
                                                }
                                            }}
                                        />
                                        {m.userId.username}
                                    </label>
                                ))}
                            </div>
                        </div>

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
                                Create Task
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>


    );
}