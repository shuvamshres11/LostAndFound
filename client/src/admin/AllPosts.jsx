import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        postedBy: '',
        date: ''
    });
    const { showToast } = useToast();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Check admin access
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            showToast("Access Denied: Admins Only", "error");
        }
    }, [currentUser, navigate, showToast]);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const limit = 10;

    const openPostDetails = async (postId) => {
        setIsFetchingDetails(true);
        setSelectedPost({ title: 'Loading...' }); // Placeholder
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/posts/${postId}`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(data);
            } else {
                showToast("Failed to load post details", "error");
                setSelectedPost(null);
            }
        } catch (err) {
            console.error(err);
            showToast("Error loading post details", "error");
            setSelectedPost(null);
        } finally {
            setIsFetchingDetails(false);
        }
    };

    useEffect(() => {
        fetchPosts(null, false, 1);
        fetchUsers();
    }, []); 

    const fetchUsers = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async (customFilters = null, showOverlay = true, page = 1) => {
        try {
            if (showOverlay) setLoading(true);
            const isEvent = customFilters && customFilters.preventDefault;
            const activeFilters = (customFilters && !isEvent) ? customFilters : filters;

            const userId = currentUser?._id || currentUser?.id;
            let queryParams = new URLSearchParams();
            if (activeFilters.type !== 'all') queryParams.append('type', activeFilters.type);
            if (activeFilters.postedBy) queryParams.append('postedBy', activeFilters.postedBy);
            if (activeFilters.date) queryParams.append('date', activeFilters.date);

            queryParams.append('page', page);
            queryParams.append('limit', limit);

            const queryString = queryParams.toString();

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/posts?${queryString}`, {
                headers: {
                    'x-user-id': userId
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data.items || []); 
                setTotalPages(data.totalPages || 1);
                setCurrentPage(data.currentPage || 1);
            } else {
                showToast("Failed to fetch posts", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error fetching posts", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchPosts(filters, true, newPage);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        fetchPosts(filters, true, 1); 
    };

    return (
        <div className="admin-page">
            <AdminNav />

            {/* Loading Overlay */}
            {loading && (
                <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
                    <div style={{
                        background: 'white',
                        padding: '24px 32px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <div className="spinner" style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid var(--admin-blue)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ fontWeight: '600', color: 'var(--admin-text)' }}>Loading...</span>
                    </div>
                    <style>
                        {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        `}
                    </style>
                </div>
            )}

            <div className="admin-container">
                <div className="admin-page-header">
                    <h1>All Posts</h1>
                    <p>View all lost and found posts with advanced filtering.</p>
                </div>

                {/* Filters */}
                <div className="admin-card">
                    <div className="admin-card-body">
                        <div className="admin-toolbar" style={{ alignItems: 'flex-end', gap: '20px' }}>
                            
                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--admin-sub)' }}>Type</label>
                                <select
                                    name="type"
                                    value={filters.type}
                                    onChange={handleFilterChange}
                                    className="admin-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="all">All Types</option>
                                    <option value="lost">Lost</option>
                                    <option value="found">Found</option>
                                </select>
                            </div>

                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--admin-sub)' }}>Posted By</label>
                                <select
                                    name="postedBy"
                                    value={filters.postedBy}
                                    onChange={handleFilterChange}
                                    className="admin-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">All Users</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ flex: 1, minWidth: '180px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--admin-sub)' }}>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={filters.date}
                                    onChange={handleFilterChange}
                                    className="admin-select"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="admin-btn-group" style={{ marginBottom: '2px' }}>
                                <button className="admin-btn secondary" onClick={() => {
                                    const resetFilters = { type: 'all', postedBy: '', date: '' };
                                    setFilters(resetFilters);
                                    fetchPosts(resetFilters, true, 1);
                                }}>
                                    Clear
                                </button>
                                <button className="admin-btn primary" onClick={handleSearch}>
                                    🔍 Search
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="admin-card">
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Image</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Posted By</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.length === 0 ? (
                                    <tr className="empty-row">
                                        <td colSpan={7}>No posts found matching filters.</td>
                                    </tr>
                                ) : posts.map(post => (
                                    <tr key={post._id}>
                                        <td>
                                            <button
                                                className="admin-btn secondary"
                                                onClick={() => openPostDetails(post._id)}
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{post.title}</td>
                                        <td>
                                            <span className={`admin-badge ${post.type}`}>
                                                {post.type}
                                            </span>
                                        </td>
                                        <td>
                                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td style={{ color: 'var(--admin-sub)' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>{post.category}</td>
                                        <td>
                                            <span className={`admin-badge ${post.status}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <span>Showing page {currentPage} of {totalPages}</span>
                            <div className="admin-pagination-btns">
                                <button 
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="admin-page-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {selectedPost && (
                <div className="admin-modal-overlay" onClick={() => setSelectedPost(null)}>
                    <div className="admin-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{selectedPost.title}</h3>
                            <button onClick={() => setSelectedPost(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--admin-muted)' }}>&times;</button>
                        </div>

                        {isFetchingDetails ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>Loading details...</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedPost.image && (
                                    <img src={selectedPost.image} alt={selectedPost.title} style={{ width: '100%', borderRadius: '8px', maxHeight: '250px', objectFit: 'contain', background: 'var(--admin-bg)' }} />
                                )}
                                
                                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                    <p><strong>Description:</strong> {selectedPost.description || "No description"}</p>
                                    <p><strong>Location:</strong> {selectedPost.location || "N/A"}</p>
                                    <p><strong>Category:</strong> {selectedPost.category}</p>
                                    <p><strong>Posted By:</strong> {selectedPost.user?.firstName} {selectedPost.user?.lastName}</p>
                                    <p><strong>Date:</strong> {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                                    <div style={{ marginTop: '8px' }}>
                                        <span className={`admin-badge ${selectedPost.status}`}>
                                            {selectedPost.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPosts;
