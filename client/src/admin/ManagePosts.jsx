import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

const ManagePosts = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");

    // Check admin access
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
            const res = await fetch('http://localhost:5000/api/admin/posts?limit=100', { // Fetch more for manage list for now
                headers: {
                    'x-user-id': userId
                }
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

    const openDeleteModal = async (post) => {
        // We don't need full details to delete, just ID
        setPostToDelete(post);
        setDeleteReason("");
        setDeleteModalOpen(true);
    };

    const openPostDetails = async (post) => {
        // Fetch full details including image
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
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f9fa' }}>
            <AdminNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Manage Posts</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {posts.map(post => (
                        <div
                            key={post._id}
                            onClick={() => openPostDetails(post)}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ height: '200px', background: '#eee', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                {/* Placeholder instead of broken image */}
                                <span style={{ fontSize: '14px' }}>Click to View Image</span>
                            </div>
                            <div style={{ marginBottom: 'auto' }}>
                                <span style={{
                                    textTransform: 'uppercase',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: post.type === 'lost' ? '#d32f2f' : '#388e3c',
                                    background: post.type === 'lost' ? '#ffebee' : '#e8f5e9',
                                    padding: '4px 8px',
                                    borderRadius: '4px'
                                }}>
                                    {post.type}
                                </span>
                                <h3 style={{ fontSize: '18px', margin: '10px 0 5px', fontWeight: 'bold' }}>{post.title}</h3>
                                <p style={{ fontSize: '14px', color: '#666' }}>By: {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}</p>
                            </div>
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(post);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#ff3b30',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Delete Post
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {posts.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>No posts found.</p>}

                {/* Delete Reason Modal */}
                {deleteModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                    }}>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Delete Post</h3>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                Please provide a reason for deleting this post. The user will be notified.
                            </p>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Reason for deletion..."
                                style={{
                                    width: '100%', height: '100px', padding: '10px',
                                    borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', resize: 'vertical',
                                    backgroundColor: '#333', color: 'white'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd',
                                        background: 'white', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={deletePost}
                                    style={{
                                        padding: '8px 16px', borderRadius: '6px', border: 'none',
                                        background: '#ff3b30', color: 'white', cursor: 'pointer'
                                    }}
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
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            maxWidth: '800px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            background: 'white',
                            zIndex: 1,
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Post Details</h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    lineHeight: 1,
                                    padding: '0',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Image */}
                            <div style={{
                                width: '100%',
                                height: '400px',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                                <img
                                    src={selectedPost.image}
                                    alt={selectedPost.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Post Info */}
                            <div>
                                <span style={{
                                    textTransform: 'uppercase',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    color: selectedPost.type === 'lost' ? '#d32f2f' : '#388e3c',
                                    background: selectedPost.type === 'lost' ? '#ffebee' : '#e8f5e9',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    display: 'inline-block'
                                }}>
                                    {selectedPost.type}
                                </span>

                                <h1 style={{ fontSize: '28px', margin: '16px 0 8px', fontWeight: 'bold' }}>
                                    {selectedPost.title}
                                </h1>

                                <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
                                    Category: {selectedPost.category || 'N/A'}
                                </p>

                                {/* Description */}
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        Description
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: 0 }}>
                                        {selectedPost.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Meta Information */}
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>📍</span>
                                        <span style={{ fontSize: '14px', color: '#555' }}>
                                            {selectedPost.location || 'Location not provided'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>📅</span>
                                        <span style={{ fontSize: '14px', color: '#555' }}>
                                            {new Date(selectedPost.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>👤</span>
                                        <span style={{ fontSize: '14px', color: '#555' }}>
                                            Posted by: {selectedPost.user ? `${selectedPost.user.firstName} ${selectedPost.user.lastName}` : 'Unknown'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                    <button
                                        onClick={() => openDeleteModal(selectedPost)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#ff3b30',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '16px'
                                        }}
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
