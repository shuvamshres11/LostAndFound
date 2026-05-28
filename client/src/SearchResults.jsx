import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Nav from './components/nav.jsx';
import LandingNav from './components/LandingNav.jsx';
import Footer from './components/footer.jsx';
import { useToast } from "./components/ToastContext";
import ConfirmationModal from './components/ConfirmationModal.jsx';
import './lostitems.css'; // We can reuse the same CSS for the grid layout

const SearchResults = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      // If there's a search query, fetch with search param, else fetch all active items
      const url = query
        ? `${import.meta.env.VITE_API_URL}/items?search=${encodeURIComponent(query)}&status=active`
        : `${import.meta.env.VITE_API_URL}/items?status=active`;

      const response = await fetch(url);
      let data = await response.json();

      // If query is empty, sort alphabetically by title
      if (!query || query.trim() === '') {
        data = data.sort((a, b) => a.title.localeCompare(b.title));
      }

      setItems(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      showToast("Error fetching search results.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]); // Re-fetch when the query URL parameter changes

  const triggerDeleteConfirm = (itemId) => {
    setItemToDelete(itemId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteModalOpen(false);

    try {
      const userId = currentUser.id || currentUser._id;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items/${itemToDelete}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        showToast("Post deleted successfully.", "success");
        fetchSearchResults(); // Refresh list
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
          <h1>Search Results</h1>
          <p>
            {query.trim() === ''
              ? "Showing all active items."
              : `Showing results for "${query}"`}
          </p>
        </header>

        {loading ? (
          <p>Loading items...</p>
        ) : items.length === 0 ? (
          <p>No items found matching your criteria.</p>
        ) : (
          <div className="item-grid">
            {items.map((item) => (
              <div key={item._id} className="item-card">
                <div className="image-container" onClick={() => navigate(`/items/${item._id}`)} style={{ cursor: 'pointer' }}>
                  <img src={item.image} alt={item.title} className="item-image" />
                  <span className={`status-badge ${item.type === 'lost' ? 'lost' : 'found'}`}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>

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
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                      className={`action-btn ${item.type === 'lost' ? 'found-btn' : 'contact-btn'}`}
                      onClick={() => {
                        if (!currentUser) {
                          showToast("Please login to contact the author.", "error");
                          return;
                        }
                        const defaultMessage = item.type === 'lost'
                          ? `I have found your ${item.title}!`
                          : `Is this ${item.title} yours?`;
                        window.location.href = `/chat?userId=${item.user._id}&message=${encodeURIComponent(defaultMessage)}`;
                      }}
                      style={{
                        background: '#007bff',
                        color: 'white'
                      }}
                    >
                      {item.type === 'lost' ? 'I Found This' : 'Contact Finder'}
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

export default SearchResults;
