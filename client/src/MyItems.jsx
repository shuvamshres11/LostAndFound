import React, { useEffect, useState } from 'react';
import { useToast } from "./components/ToastContext";
import { Icon } from "@iconify/react";
import Nav from './components/nav.jsx';
import Footer from './components/footer.jsx';
import ConfirmationModal from './components/ConfirmationModal.jsx';
import './MyItems.css';

const MyItems = () => {
    const { showToast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchItems = async () => {
        try {
            if (!currentUser) return; // Should be handled by protecting route, but safe check

            const response = await fetch(`${import.meta.env.VITE_API_URL}/items`);
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

    const handleStatusToggle = async (itemId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'completed' : 'active';
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${itemId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setItems(prevItems => prevItems.map(item =>
                    item._id === itemId ? { ...item, status: newStatus } : item
                ));
                showToast(`Post marked as ${newStatus}!`, "success");
            } else {
                const data = await response.json();
                showToast(data.message || "Failed to update status.", "error");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showToast("Error updating status.", "error");
        }
    };

    const triggerDeleteConfirm = (itemId) => {
        setItemToDelete(itemId);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setDeleteModalOpen(false);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${itemToDelete}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                showToast("Post deleted successfully.", "success");
                fetchItems(); // Refresh list
            } else {
                const data = await response.json();
                showToast(data.message || "Failed to delete post.", "error");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            showToast("Error deleting item.", "error");
        } finally {
            setItemToDelete(null);
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
                                    <ItemCard key={item._id} item={item} handleDelete={triggerDeleteConfirm} handleStatusToggle={handleStatusToggle} badgeClass="lost" badgeText="Lost" />
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
                                    <ItemCard key={item._id} item={item} handleDelete={triggerDeleteConfirm} handleStatusToggle={handleStatusToggle} badgeClass="found" badgeText="Found" />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
            <ConfirmationModal 
                isOpen={deleteModalOpen} 
                title="Delete Post" 
                message="Are you sure you want to delete this post? This action cannot be undone." 
                onConfirm={handleDelete} 
                onCancel={() => { setDeleteModalOpen(false); setItemToDelete(null); }} 
            />
            <Footer />
        </div>
    );
};

const ItemCard = ({ item, handleDelete, handleStatusToggle, badgeClass, badgeText }) => {
    const isCompleted = item.status === 'completed';
    return (
        <div className={`my-item-card ${isCompleted ? 'completed-card' : ''}`}>
            <div className="my-item-image-wrapper" onClick={() => window.location.href = `/items/${item._id}`}>
                <img src={item.image} alt={item.title} className="my-item-image" />
                <span className={`my-status-badge ${badgeClass}`}>{badgeText}</span>
                {isCompleted && <span className="my-completion-badge">Completed</span>}
                <button
                    className="my-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                    title="Delete Post"
                >
                    <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                </button>
            </div>
            <div className="my-card-content">
                <h3 className="my-card-title">{item.title}</h3>
                <div className="my-card-date">
                    <Icon icon="mdi:calendar-outline" width="14" height="14" style={{verticalAlign:'middle', marginRight:'4px'}} />
                    {new Date(item.date).toLocaleDateString()}
                </div>
                <div className="my-card-loc">
                    <Icon icon="mdi:map-marker-outline" width="14" height="14" style={{verticalAlign:'middle', marginRight:'4px'}} />
                    {item.location || "No location"}
                </div>
                <button
                    className={`status-toggle-btn ${isCompleted ? 'mark-active' : 'mark-completed'}`}
                    onClick={(e) => { e.stopPropagation(); handleStatusToggle(item._id, item.status || 'active'); }}
                >
                    {isCompleted ? 'Reopen Post' : 'Close Post'}
                </button>
            </div>
        </div>
    );
};

export default MyItems;
