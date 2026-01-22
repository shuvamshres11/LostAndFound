import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import { useToast } from "./components/ToastContext";
import Footer from './components/footer.jsx';
import './ItemDetails.css'; // We will create this CSS file

const ItemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/items/${id}`);
                const data = await response.json();
                if (response.ok) {
                    setItem(data);
                } else {
                    showToast("Item not found", "error");
                    navigate('/home');
                }
            } catch (error) {
                console.error("Error fetching item details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, navigate]);

    const handleMessage = () => {
        if (!currentUser) {
            showToast("Please login to message the owner.", "error");
            // navigate('/login'); // Removed redirect
            return;
        }
        // Navigate to chat with the item owner, passing item details if needed
        const defaultMessage = item.type === 'lost'
            ? `I have found your ${item.title}!`
            : `I think this ${item.title} belongs to me.`;

        navigate(`/chat?userId=${item.user._id}&message=${encodeURIComponent(defaultMessage)}`);
    };

    if (loading) return <div className="loading">Loading details...</div>;
    if (!item) return <div className="error">Item not found.</div>;

    return (
        <div className="full-page-wrapper">
            {currentUser ? <Nav /> : <LandingNav />}
            <main className="content-container item-details-container">
                <div className="details-card">
                    <div className="image-section">
                        <img src={item.image} alt={item.title} className="details-image" />
                    </div>
                    <div className="info-section">
                        <span className={`status-badge ${item.type}`}>{item.type.toUpperCase()}</span>
                        <h1>{item.title}</h1>
                        <p className="category">Category: {item.category}</p>

                        <div className="description-box">
                            <h3>Description</h3>
                            <p>{item.description || "No description provided."}</p>
                        </div>

                        <div className="meta-info">
                            <div className="meta-row">
                                <span className="icon">📍</span>
                                <span>{item.location || "Location not provided"}</span>
                            </div>
                            <div className="meta-row">
                                <span className="icon">📅</span>
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-row">
                                <span className="icon">👤</span>
                                <span>Posted by: {item.user ? `${item.user.firstName} ${item.user.lastName}` : "Unknown"}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            {currentUser && item.user && currentUser.id !== item.user._id && currentUser._id !== item.user._id ? (
                                <button className="message-btn" onClick={handleMessage}>
                                    {item.type === 'lost' ? "👋 I Found This!" : "💬 Claim This Item"}
                                </button>
                            ) : (
                                currentUser && item.user && (currentUser.id === item.user._id || currentUser._id === item.user._id) && (
                                    <p className="own-post-msg">This is your post.</p>
                                )
                            )}
                            <button className="back-btn" onClick={() => navigate(-1)}>Go Back</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ItemDetails;
