import io from "socket.io-client";

interface RoomMessage {
  message: string;
  senderId?: string;
  timestamp?: string;
}

const socket = io("http://localhost:8000", {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("Socket.IO Connected to Django Backend");
  socket.emit("join_room", { room: "room123" });
});

socket.on("connect_error", (err: Error) => {
  console.error("Socket.IO Connection Error:", err.message);
});

socket.on("room_message", (data: RoomMessage) => {
  console.log(`Message in Room:`, data.message);
});

export default socket;
