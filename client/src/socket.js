import io from "socket.io-client";

// Create a singleton socket instance
const socket = io.connect("http://localhost:5000");

export default socket;
