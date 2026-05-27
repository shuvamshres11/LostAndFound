import io from "socket.io-client";

// Create a singleton socket instance
const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io.connect(socketUrl);

export default socket;
