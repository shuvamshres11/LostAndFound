import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "./socket";
import Nav from "./components/nav.jsx";
import Footer from "./components/footer.jsx";
import { useToast } from "./components/ToastContext";
import "./Chat.css";

const Chat = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialChatUserId = queryParams.get("userId");
    const initialMessage = queryParams.get("message"); // Get message from URL

    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(initialMessage || ""); // Set initial message
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!currentUser) {
            showToast("Please login to use chat.", "error");
            navigate("/login");
            return;
        }

        // Join my own room
        socket.emit("join_room", currentUser.id || currentUser._id);

        fetchConversations();

        if (initialChatUserId) {
            startChatWithUser(initialChatUserId);
        }

        // Handle Incoming Messages
        const handleReceiveMessage = (message) => {
            // Only update if message belongs to active chat
            if (activeChat && (message.sender === activeChat._id || message.receiver === activeChat._id)) {
                setMessages((prev) => [...prev, message]);
            }
            fetchConversations();
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [currentUser, activeChat]); // Logic still depends on activeChat for the filter inside logic.
    // Better pattern: Filter inside setMessages or use a Ref for activeChatId

    // We can simplify: just append message. User will see red dot if not active? 
    // The Nav handles badge. Here we just show.
    // Ideally we shouldn't rely on `activeChat` in dependency array for listener.
    // Let's us Ref for `activeChat`.


    // Removed auto-scroll to prevent unwanted scrolling when sending messages
    // Users can manually scroll to see new messages

    const fetchConversations = async () => {
        try {
            const userId = currentUser.id || currentUser._id;
            const res = await fetch(`http://localhost:5000/api/chat/conversations/${userId}`);
            const data = await res.json();
            setConversations(data);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        }
    };

    const startChatWithUser = async (userId) => {
        // 1. Get user details (if not already in list)
        // For now, we assume we might need to fetch it if it's not in conversations
        // BUT, let's just fetch the profile to be sure
        try {
            const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
            const user = await res.json();
            setActiveChat(user);

            // 2. Fetch history
            fetchHistory(user._id);
        } catch (err) {
            console.error("Error fetching user details:", err);
        }
    };

    const fetchHistory = async (otherUserId) => {
        try {
            const myId = currentUser.id || currentUser._id;
            const res = await fetch(`http://localhost:5000/api/chat/history/${myId}/${otherUserId}`);
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === "") return;

        const messageData = {
            sender: currentUser.id || currentUser._id,
            receiver: activeChat._id,
            content: newMessage,
            itemId: null // For now, we don't strictly link to item in DB for every message
        };

        await socket.emit("send_message", messageData);
        setMessages((prev) => [...prev, { ...messageData, timestamp: Date.now() }]); // Optimistic update
        setNewMessage("");
    };

    return (
        <div className="full-page-wrapper">
            <Nav />
            <div className="chat-container">
                <div className="sidebar">
                    <h3>Messages</h3>
                    <div className="conversation-list">
                        {conversations.length === 0 && <p className="no-chats">No active chats.</p>}
                        {conversations.map((user) => (
                            <div
                                key={user._id}
                                className={`conversation-item ${activeChat?._id === user._id ? 'active' : ''}`}
                                onClick={() => { setActiveChat(user); fetchHistory(user._id); }}
                            >
                                <div className="avatar">
                                    {user.firstName[0]}
                                </div>
                                <div className="info">
                                    <h4>{user.firstName} {user.lastName}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chat-window">
                    {activeChat ? (
                        <>
                            <div className="chat-header">
                                <h4>{activeChat.firstName} {activeChat.lastName}</h4>
                            </div>
                            <div className="messages-area">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender === (currentUser.id || currentUser._id);
                                    return (
                                        <div key={index} className={`message-bubble ${isMe ? "me" : "other"}`}>
                                            <p>{msg.content}</p>
                                            <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="input-area">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                />
                                <button onClick={sendMessage}>Send</button>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a conversation or start a new one from an item post.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Chat;
