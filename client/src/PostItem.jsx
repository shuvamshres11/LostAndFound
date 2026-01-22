import React, { useState, useEffect } from "react";
import { useToast } from "./components/ToastContext";
import { useNavigate } from "react-router-dom";
import Nav from "./components/nav.jsx";
import Footer from "./components/footer.jsx";
import "./PostItem.css";

export default function PostItem() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lost");
  const [imagePreview, setImagePreview] = useState(null);
  const user = JSON.parse(localStorage.getItem("user")); // Move user retrieval up


  // Removed useEffect redirect to allow showing UI instead


  const categories = [
    "Electronics", "Pets", "Wallets & Cards", "Keys",
    "Documents/ID", "Jewelry", "Bags & Luggage", "Clothing", "Other"
  ];

  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    date: "",
    location: "",
    description: "",
  });

  const { title, category, date, location, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle image upload and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast("File size exceeds 10MB limit.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      showToast("You must be logged in to post.", "error");
      navigate("/login");
      return;
    }

    if (!imagePreview) {
      showToast("Please upload an image of the item.", "error");
      return;
    }

    try {
      const payload = {
        user: user.id || user._id, // Fix: Backend sends 'id', not '_id'
        type: activeTab, // 'lost' or 'found'
        title,
        category,
        date,
        location,
        description,
        image: imagePreview
      };

      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast("Post created successfully!", "success");
        // Reset form
        setFormData({
          title: "",
          category: "Electronics",
          date: "",
          location: "",
          description: "",
        });
        setImagePreview(null);
      } else {
        const errorData = await response.json();
        showToast("Failed to create post: " + errorData.message, "error");
      }

    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Server error. Please try again.", "error");
    }
  };

  if (!user) {
    return (
      <div className="page-layout">
        <Nav /> {/* This will likely be LandingNav in practice due to condition in App? Or just Nav with guest view? */}
        {/* Actually, Nav usually checks user? No, Nav is generic. Wait, we want LandingNav if guest? */}
        {/* Context says: "Conditionally render... Nav for authenticated, LandingNav for guests" */}
        {/* But PostItem imports Nav directly. Let's swap it to use the same logic as others if needed, 
                  OR just show the restricted access card inside the layout. 
                  Let's replicate the layout wrapper. */}
        <div className="nav-spacer"></div>
        <main className="main-content-viewport" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="login-required-card" style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2>Login Required</h2>
            <p style={{ margin: '1rem 0', color: '#666' }}>You need to be logged in to post lost or found items.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
              style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', cursor: 'pointer', background: '#6c5ce7', color: 'white', border: 'none', borderRadius: '6px' }}
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Nav />
      <div className="nav-spacer"></div>

      <main className="main-content-viewport">
        <div className="centered-form-wrapper">
          <header className="page-header-text">
            <h1>Post an Item</h1>
            <p>Report a lost or found item to help connect it with its owner.</p>
          </header>

          <div className="main-card-ui">
            <div className="tab-navigation">
              <button
                className={`tab-item lost-tab ${activeTab === "lost" ? "active" : ""}`}
                onClick={() => setActiveTab("lost")}
              >
                I Lost Something
              </button>
              <button
                className={`tab-item found-tab ${activeTab === "found" ? "active" : ""}`}
                onClick={() => setActiveTab("found")}
              >
                I Found Something
              </button>
            </div>

            <form className="actual-entry-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label>Item Photo</label>
                <label className="photo-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="upload-preview-img" />
                  ) : (
                    <>
                      <div className="icon">⬆</div>
                      <p><span>Upload a file</span> or drag and drop</p>
                      <small>PNG, JPG up to 10MB</small>
                    </>
                  )}
                </label>
              </div>

              <div className="field-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Max"
                  name="title"
                  value={title}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Category</label>
                  <select name="category" value={category} onChange={onChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Date {activeTab === "lost" ? "Lost" : "Found"}</label>
                  <input
                    type="date"
                    name="date"
                    value={date}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. Central Park"
                  name="location"
                  value={location}
                  onChange={onChange}
                />
              </div>

              <div className="field-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  placeholder="Provide as many details as possible..."
                  name="description"
                  value={description}
                  onChange={onChange}
                ></textarea>
              </div>

              <div className="security-info-box">
                <p>Your contact information will be hidden by default for security.</p>
              </div>

              <button type="submit" className={`submit-form-btn ${activeTab}`}>
                Post {activeTab === "lost" ? "Lost" : "Found"} Item
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}