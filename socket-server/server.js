import { Server } from "socket.io";
import axios from "axios";

const io = new Server(4000, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join channel room
    socket.on("join-channel", ({ channelId }) => {
        socket.join(channelId);
    });

    // Send message
    socket.on(
        "send-message",
        async ({ workspaceId, channelId, content }) => {
            try {
                const cookie = socket.handshake.headers.cookie;

                const res = await axios.post(
                    `http://localhost:3000/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
                    { content },
                    {
                        headers: {
                            Cookie: cookie
                        }
                    }
                );

                io.to(channelId).emit("new-message", res.data.message);

            } catch (err) {
                console.error("Message error", err.message);
            }
        }
    );

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

console.log("Socket server running on 4000");