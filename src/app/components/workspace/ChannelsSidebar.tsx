"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Channel {
  _id: string;
  name: string;
}

export default function ChannelsSidebar() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannel, setNewChannel] = useState("");

  async function loadChannels() {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/channels`,
      { credentials: "include" }
    );
    const data = await res.json();
    setChannels(data.channels || []);
  }

  useEffect(() => {
    loadChannels();
  }, [workspaceId]);

  async function createChannel() {
    if (!newChannel) return;

    await fetch(
      `/api/workspaces/${workspaceId}/channels`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChannel }),
      }
    );

    setNewChannel("");
    loadChannels();
  }

  return (
    <div className="border-t mt-4 pt-4">

      <h3 className="font-semibold mb-2">
        Channels
      </h3>

      <ul className="space-y-1 mb-3">
        {channels.map((c) => (
          <li
            key={c._id}
            className="text-sm px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            # {c.name}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          className="border p-1 flex-1 text-sm"
          placeholder="new-channel"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
        />

        <button
          onClick={createChannel}
          className="text-sm bg-black text-white px-2 rounded"
        >
          +
        </button>
      </div>

    </div>
  );
}