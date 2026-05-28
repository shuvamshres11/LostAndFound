import React, { useEffect, useState } from 'react';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import Footer from './components/footer.jsx';
import { useToast } from "./components/ToastContext";
import ConfirmationModal from './components/ConfirmationModal.jsx';
import './lostitems.css';

const LostItems = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchItems = async () => {
    try {
      // Fetch ONLY active lost items from server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items?type=lost&status=active`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const triggerDeleteConfirm = (itemId) => {
    setItemToDelete(itemId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteModalOpen(false);

    try {
      // Send both formats to cover all bases
      const userId = currentUser.id || currentUser._id;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${itemToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
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

  return (
    <div className="full-page-wrapper">
      {currentUser ? <Nav /> : <LandingNav />}
      <main className="content-container">
        <header className="page-header">
          <h1>Lost Items</h1>
          <p>Browse recently reported lost items to help reunite them with their owners.</p>
        </header>

        {loading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <p>No lost items reported yet.</p>
        ) : (
          <div className="item-grid">
            {items.map((item) => (
              <div key={item._id} className="item-card">
                <div className="image-container" onClick={() => window.location.href = `/items/${item._id}`} style={{ cursor: 'pointer' }}>
                  <img src={item.image} alt={item.title} className="item-image" />
                  <span className="status-badge lost">Lost</span>

                  {/* Delete Button for Owner */}
                  {currentUser && item.user && (currentUser.id === item.user._id || currentUser._id === item.user._id) && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerDeleteConfirm(item._id);
                      }}
                      title="Delete your post"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="card-content">
                  <div className="title-row">
                    <h3>{item.title}</h3>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <span className={`item-state-badge ${item.status || 'active'}`}>
                        {item.status === 'completed' ? 'Completed' : 'Active'}
                      </span>
                      <span className="item-id">#{item._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Author Name */}
                  <p className="posted-by">
                    Posted by {item.user ? `${item.user.firstName} ${item.user.lastName}` : "Unknown"}
                  </p>

                  <div className="info-row">
                    <span className="icon">📍</span>
                    <span className="text">{item.location || "Location not provided"}</span>
                  </div>

                  <div className="info-row">
                    <span className="icon">📅</span>
                    <span className="text">{new Date(item.date).toLocaleDateString()}</span>
                  </div>

                  {currentUser && item.user && (currentUser.id === item.user._id || currentUser._id === item.user._id) ? (
                    <p className="own-post-msg" style={{ margin: '15px 0 0', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>This is your post.</p>
                  ) : (
                    <button
                      className="action-btn found-btn"
                      onClick={() => {
                        if (!currentUser) {
                          showToast("Please login to report this.", "error");
                          return;
                        }
                        const defaultMessage = `I have found your ${item.title}!`;
                        window.location.href = `/chat?userId=${item.user._id}&message=${encodeURIComponent(defaultMessage)}`;
                      }}
                    >
                      I Found This
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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

export default LostItems;