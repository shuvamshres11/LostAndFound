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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

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

    const markMessagesAsRead = async (senderId) => {
        try {
            const myId = currentUser.id || currentUser._id;
            await fetch("http://localhost:5000/api/chat/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: myId, receiver: senderId }),
            });
            // Update local state to remove badge
            setConversations(prev => prev.map(conv =>
                conv._id === senderId ? { ...conv, unreadCount: 0 } : conv
            ));
        } catch (err) {
            console.error("Error marking messages as read:", err);
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

    const startChatWithUser = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
            const user = await res.json();
            setActiveChat(user);
            fetchHistory(user._id);
        } catch (err) {
            console.error("Error fetching user details:", err);
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === "") return;
        const messageData = {
            sender: currentUser.id || currentUser._id,
            receiver: activeChat._id,
            content: newMessage,
            itemId: null
        };
        await socket.emit("send_message", messageData);
        setNewMessage("");
    };

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
            // If message belongs to active chat, append it
            if (activeChat && (message.sender === activeChat._id || message.receiver === activeChat._id)) {
                setMessages((prev) => [...prev, message]);

                // If the message is from the active user, mark it as read immediately
                if (message.sender === activeChat._id) {
                    markMessagesAsRead(activeChat._id);
                }
            }

            // Always refresh conversations to update unread counts and last message order
            fetchConversations();
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [currentUser, activeChat]);



    const handleConversationClick = (user) => {
        setActiveChat(user);
        fetchHistory(user._id);
        if (user.unreadCount > 0) {
            markMessagesAsRead(user._id);
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);



    const handleDeleteChat = (e, userId) => {
        e?.stopPropagation();
        setChatToDelete(userId);
        setShowDeleteModal(true);
    };

    const confirmDeleteChat = async () => {
        if (!chatToDelete) return;

        try {
            const myId = currentUser.id || currentUser._id;
            const res = await fetch("http://localhost:5000/api/chat/delete-conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ myId, otherId: chatToDelete }),
            });

            const data = await res.json();
            if (data.success) {
                // Remove conversation from state
                setConversations(prev => prev.filter(c => c._id !== chatToDelete));
                // If the deleted chat was active, clear it
                if (activeChat && activeChat._id === chatToDelete) {
                    setActiveChat(null);
                    setMessages([]);
                }
                showToast("Conversation deleted", "success");
            } else {
                showToast("Failed to delete conversation", "error");
            }
        } catch (err) {
            console.error("Error deleting conversation:", err);
            showToast("Error deleting conversation", "error");
        } finally {
            setShowDeleteModal(false);
            setChatToDelete(null);
        }
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
                                onClick={() => handleConversationClick(user)}
                            >
                                <div className="avatar">
                                    {user.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={`${user.firstName} ${user.lastName}`}
                                            className="avatar-img"
                                        />
                                    ) : (
                                        <span className="avatar-initial">{user.firstName[0]}</span>
                                    )}
                                    {user.unreadCount > 0 && (
                                        <span className="notification-badge">
                                            {user.unreadCount > 9 ? '9+' : user.unreadCount}
                                        </span>
                                    )}
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
                                <button
                                    className="header-delete-btn"
                                    onClick={(e) => handleDeleteChat(e, activeChat._id)}
                                    title="Delete conversation"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="messages-area" ref={messagesContainerRef}>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <h3>Delete Conversation?</h3>
                        <p>This conversation will be permanently removed from your view. The other person will still see the history.</p>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-btn cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="delete-modal-btn confirm" onClick={confirmDeleteChat}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
