import React, { useEffect, useState } from 'react';
import { useToast } from "./components/ToastContext";
import Nav from './components/nav.jsx';
import Footer from './components/footer.jsx';
import './MyItems.css';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const fetchItems = async () => {
        try {
            if (!currentUser) return; // Should be handled by protecting route, but safe check

            const response = await fetch('http://localhost:5000/api/items');
            const data = await response.json();

            // Filter for current user
            const userItems = data.filter(item => {
                // Handle various ways user might be populated or just ID string
                const itemUserId = item.user && (item.user._id || item.user);
                const currentUserId = currentUser.id || currentUser._id;
                return itemUserId === currentUserId;
            });

            setItems(userItems);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [currentUser]); // Add currentUser dependency

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const userId = currentUser.id || currentUser._id;

            const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                alert("Post deleted successfully.");
                fetchItems(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete post.");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Error deleting item.");
        }
    };

    const lostItems = items.filter(item => item.type === 'lost');
    const foundItems = items.filter(item => item.type === 'found');

    return (
        <div className="my-items-page">
            <Nav />
            <main className="my-items-container">
                <header className="my-items-header">
                    <h1>My Posted Items</h1>
                    <p>Manage the items you have reported as lost or found.</p>
                </header>

                {loading ? (
                    <p>Loading your items...</p>
                ) : (
                    <>
                        {/* Section 1: My Lost Items */}
                        <h2 className="section-title">My Lost Items</h2>
                        {lostItems.length === 0 ? (
                            <div className="no-items-msg">You haven't posted any lost items.</div>
                        ) : (
                            <div className="items-grid">
                                {lostItems.map(item => (
                                    <ItemCard key={item._id} item={item} handleDelete={handleDelete} badgeClass="lost" badgeText="Lost" />
                                ))}
                            </div>
                        )}

                        {/* Section 2: My Found Items */}
                        <h2 className="section-title">My Found Items</h2>
                        {foundItems.length === 0 ? (
                            <div className="no-items-msg">You haven't posted any found items.</div>
                        ) : (
                            <div className="items-grid">
                                {foundItems.map(item => (
                                    <ItemCard key={item._id} item={item} handleDelete={handleDelete} badgeClass="found" badgeText="Found" />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

const ItemCard = ({ item, handleDelete, badgeClass, badgeText }) => {
    return (
        <div className="my-item-card">
            <div className="my-item-image-wrapper" onClick={() => window.location.href = `/items/${item._id}`}>
                <img src={item.image} alt={item.title} className="my-item-image" />
                <span className={`my-status-badge ${badgeClass}`}>{badgeText}</span>
                <button
                    className="my-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    title="Delete Post"
                >
                    🗑️
                </button>
            </div>
            <div className="my-card-content">
                <h3 className="my-card-title">{item.title}</h3>
                <div className="my-card-date">
                    <span>📅</span> {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="my-card-loc">
                    <span>📍</span> {item.location || "No location"}
                </div>
            </div>
        </div>
    );
};

export default MyItems;
