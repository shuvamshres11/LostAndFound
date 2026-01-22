import React, { useEffect, useState } from 'react';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import Footer from './components/footer.jsx';
import { useToast } from "./components/ToastContext";
import './lostitems.css';

const LostItems = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchItems = async () => {
    try {
      // Fetch ONLY lost items from server
      const response = await fetch('http://localhost:5000/api/items?type=lost');
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

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      // Send both formats to cover all bases
      const userId = currentUser.id || currentUser._id;

      const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
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
                      onClick={() => handleDelete(item._id)}
                      title="Delete your post"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="card-content">
                  <div className="title-row">
                    <h3>{item.title}</h3>
                    <span className="item-id">#{item._id.slice(-6).toUpperCase()}</span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LostItems;