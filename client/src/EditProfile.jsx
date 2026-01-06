import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./components/nav";
import Footer from "./components/footer";
import "./EditProfile.css";

const EditProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        profilePicture: "",
    });

    // Fetch user data on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            alert("Please log in to edit your profile.");
            navigate("/login");
            return;
        }

        const start = async () => {
            try {
                const userObj = JSON.parse(storedUser);
                setUserId(userObj.id);

                // Fetch latest data from backend
                const response = await fetch(`http://localhost:5000/api/auth/profile/${userObj.id}`);
                console.log("Profile Fetch Response Status:", response.status); // DEBUG LOG

                if (response.ok) {
                    const data = await response.json();
                    console.log("Fetched Profile Data:", data); // DEBUG LOG: Check if firstName/lastName are here

                    setFormData({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        bio: data.bio || "",
                        profilePicture: data.profilePicture || "",
                    });
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        }
        start();
    }, [navigate]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Image Upload (Convert to Base64)
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("File size too large. Please select an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Save
    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:5000/api/auth/profile/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // If response is not JSON (e.g. 413 Payload Too Large might return text/html)
                const text = await response.text();
                throw new Error(`Server Response (${response.status}): ${text.substring(0, 100)}`);
            }

            if (response.ok) {
                // Update local storage to reflect changes immediately
                const currentUser = JSON.parse(localStorage.getItem("user"));
                const updatedUser = {
                    ...currentUser,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    profilePicture: data.user.profilePicture, // Maintain camelCase
                    email: data.user.email, // Ensure email updates if applicable
                    phone: data.user.phone,
                    bio: data.user.bio
                };
                localStorage.setItem("user", JSON.stringify(updatedUser)); // Important: Save the *complete* user object

                alert("Profile updated successfully!");
                navigate("/home"); // Redirect to home after save (optional, but good for flow)
            } else {
                alert(data.message || `Failed: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            // Show more specific error to user
            alert(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>Loading profile...</div>;

    return (
        <>
            <Nav />
            <div className="edit-profile-container">
                <div className="edit-profile-content">

                    {/* Main Content */}
                    <div className="profile-form-container">
                        <div className="profile-header">
                            <h2>Personal Information</h2>
                            <p>Update your personal details and contact information.</p>
                        </div>

                        {/* Profile Picture */}
                        <div className="profile-pic-section">
                            <div className="img-wrapper">
                                <img
                                    src={formData.profilePicture || "https://via.placeholder.com/100"}
                                    alt="Profile"
                                    className="current-profile-pic"
                                />
                                <div className="upload-btn-wrapper">
                                    <label htmlFor="file-upload" className="upload-icon-btn">
                                        📷
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginLeft: "120px", marginTop: "-60px" }}>
                                <h3 style={{ margin: 0 }}>{formData.firstName} {formData.lastName}</h3>
                                <p style={{ color: "#777", fontSize: "0.9rem" }}>Member</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-input"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="e.g. Alex"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-input"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="e.g. Morgan"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    disabled
                                    style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Bio</label>
                                <textarea
                                    name="bio"
                                    className="form-textarea"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    placeholder="Write a short description about yourself..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Notifications removed */}

                        <div className="form-actions">
                            <button className="btn-cancel" onClick={() => navigate("/home")}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EditProfile;
