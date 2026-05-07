import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const ManagePosts = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            showToast("Access Denied: Admins Only", "error");
        }
    }, [currentUser, navigate, showToast]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch('http://localhost:5000/api/admin/posts?limit=100', { 
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(data.items || []);
            } else {
                showToast("Failed to fetch posts", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error fetching posts", "error");
        }
    };

    const openDeleteModal = (post) => {
        setPostToDelete(post);
        setDeleteReason("");
        setDeleteModalOpen(true);
    };

    const openPostDetails = async (post) => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`http://localhost:5000/api/admin/posts/${post._id}`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(data);
            } else {
                showToast("Failed to load post details", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error loading post details", "error");
        }
    };

    const deletePost = async () => {
        if (!deleteReason.trim()) {
            showToast("Please enter a reason for deletion", "error");
            return;
        }

        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`http://localhost:5000/api/admin/posts/${postToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
                body: JSON.stringify({ reason: deleteReason })
            });

            if (res.ok) {
                showToast("Post deleted successfully", "success");
                setPosts(posts.filter(post => post._id !== postToDelete._id));
                setDeleteModalOpen(false);
                setPostToDelete(null);
                if (selectedPost && selectedPost._id === postToDelete._id) {
                    setSelectedPost(null);
                }
            } else {
                showToast("Failed to delete post", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error deleting post", "error");
        }
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    return (
        <div className="admin-page">
            <AdminNav />
            <div className="admin-container">
                <div className="admin-page-header">
                    <h1>Manage Posts</h1>
                    <p>Review lost and found posts, and delete violations.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {posts.map(post => (
                        <div key={post._id} className="admin-action-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={() => openPostDetails(post)}>
                            {/* Placeholder Image Box */}
                            <div style={{ height: '200px', background: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-muted)' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>Click to View Image</span>
                            </div>
                            
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <span className={`admin-badge ${post.type}`}>
                                        {post.type}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '16px', margin: '0 0 4px', fontWeight: '700', color: 'var(--admin-text)' }}>{post.title}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--admin-sub)', margin: '0 0 16px' }}>
                                    By: {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}
                                </p>
                                
                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteModal(post);
                                        }}
                                        className="admin-btn danger"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Delete Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {posts.length === 0 && <p style={{ textAlign: 'center', color: 'var(--admin-muted)', marginTop: '40px' }}>No posts found.</p>}

                {/* Delete Reason Modal */}
                {deleteModalOpen && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal">
                            <h3>Delete Post</h3>
                            <p>Please provide a reason for deleting this post. The user will be notified.</p>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Reason for deletion..."
                            />
                            <div className="admin-modal-actions">
                                <button
                                    className="admin-btn secondary"
                                    onClick={() => setDeleteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="admin-btn danger"
                                    onClick={deletePost}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for Post Details */}
            {selectedPost && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" style={{ maxWidth: '600px', padding: '0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="admin-card-header" style={{ background: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Post Details</h2>
                            <button
                                onClick={closeModal}
                                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-muted)' }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                            {selectedPost.image && (
                                <div style={{ width: '100%', height: '300px', overflow: 'hidden', borderRadius: '12px', marginBottom: '20px', background: 'var(--admin-bg)' }}>
                                    <img
                                        src={selectedPost.image}
                                        alt={selectedPost.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            )}

                            <div>
                                <span className={`admin-badge ${selectedPost.type}`} style={{ marginBottom: '12px' }}>
                                    {selectedPost.type}
                                </span>

                                <h1 style={{ fontSize: '24px', margin: '0 0 8px', fontWeight: '800' }}>
                                    {selectedPost.title}
                                </h1>

                                <p style={{ fontSize: '14px', color: 'var(--admin-sub)', marginBottom: '20px' }}>
                                    Category: {selectedPost.category || 'N/A'}
                                </p>

                                <div style={{ background: 'var(--admin-bg)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px' }}>Description</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--admin-text)', lineHeight: '1.6', margin: 0 }}>
                                        {selectedPost.description || 'No description provided.'}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: 'var(--admin-sub)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>📍</span> {selectedPost.location || 'Location not provided'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>📅</span> {new Date(selectedPost.date).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>👤</span> Posted by: {selectedPost.user ? `${selectedPost.user.firstName} ${selectedPost.user.lastName}` : 'Unknown'}
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--admin-border)' }}>
                                    <button
                                        onClick={() => {
                                            closeModal();
                                            openDeleteModal(selectedPost);
                                        }}
                                        className="admin-btn danger"
                                        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
                                    >
                                        Delete Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePosts;
