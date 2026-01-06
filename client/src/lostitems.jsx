import React, { useEffect, useState } from 'react';
import Nav from './components/nav.jsx';
import Footer from './components/footer.jsx';
import './lostitems.css';

const LostItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      // Filter for ONLY lost items
      const lostItems = data.filter(item => item.type === 'lost');
      setItems(lostItems);
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

  return (
    <div className="full-page-wrapper">
      <Nav />
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
                <div className="image-container">
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

                  <button className="action-btn found-btn">I Found This</button>
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