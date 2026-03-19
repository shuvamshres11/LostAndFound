import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

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

    // ... useEffect ...

    const openPostDetails = async (postId) => {
        setIsFetchingDetails(true);
        setSelectedPost({ title: 'Loading...' }); // Placeholder
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`http://localhost:5000/api/admin/posts/${postId}`, {
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
        fetchPosts(null, false, 1); // Initial fetch, page 1
        fetchUsers();
    }, []); // Only run once on mount

    const fetchUsers = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch('http://localhost:5000/api/admin/users', {
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
            // Ensure customFilters is not a synthetic event from onClick
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

            const res = await fetch(`http://localhost:5000/api/admin/posts?${queryString}`, {
                headers: {
                    'x-user-id': userId
                }
            });

            if (res.ok) {
                const data = await res.json();
                setPosts(data.items || []); // Handle new structure
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
        fetchPosts(filters, true, 1); // Reset to page 1 on search
    };

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f9fa', position: 'relative' }}>
            <AdminNav />

            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div className="spinner" style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ fontWeight: 'bold', color: '#333' }}>Loading...</span>
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

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>All Posts</h2>

                {/* Filters */}
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'end'
                }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Type</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#333', color: 'white' }}
                        >
                            <option value="all" style={{ backgroundColor: '#333', color: 'white' }}>All Types</option>
                            <option value="lost" style={{ backgroundColor: '#333', color: 'white' }}>Lost</option>
                            <option value="found" style={{ backgroundColor: '#333', color: 'white' }}>Found</option>
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Posted By (User)</label>
                        <select
                            name="postedBy"
                            value={filters.postedBy}
                            onChange={handleFilterChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#333', color: 'white' }}
                        >
                            <option value="" style={{ backgroundColor: '#333', color: 'white' }}>All Users</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id} style={{ backgroundColor: '#333', color: 'white' }}>
                                    {user.firstName} {user.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleFilterChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#333', color: 'white' }}
                        />
                    </div>
                    <div style={{ paddingBottom: '2px', display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#007bff',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                            Search
                        </button>
                        <button
                            onClick={() => {
                                const resetFilters = { type: 'all', postedBy: '', date: '' };
                                setFilters(resetFilters);
                                // We need to pass these filters to fetchPosts because state update is async
                                // So let's modify fetchPosts to accept optional filters
                                fetchPosts(resetFilters, true, 1);
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                background: '#fff',
                                cursor: 'pointer'
                            }}>
                            Clear
                        </button>
                    </div>
                </div>

                {/* Posts Table/List */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', width: '80px' }}>Image</th>
                                    <th style={{ padding: '12px' }}>Title</th>
                                    <th style={{ padding: '12px' }}>Type</th>
                                    <th style={{ padding: '12px' }}>Posted By</th>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => openPostDetails(post._id)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#eee',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: '600' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {post.title}
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    background: post.status === 'completed' ? '#d1fae5' : '#e0f2fe',
                                                    color: post.status === 'completed' ? '#065f46' : '#0369a1',
                                                    border: post.status === 'completed' ? '1px solid #a7f3d0' : '1px solid #bae6fd'
                                                }}>
                                                    {post.status === 'completed' ? 'Completed' : 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: post.type === 'lost' ? '#ffebee' : '#e8f5e9',
                                                color: post.type === 'lost' ? '#d32f2f' : '#388e3c'
                                            }}>
                                                {post.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td style={{ padding: '12px', color: '#666' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>{post.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {posts.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No posts found matching filters.</p>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    color: currentPage === 1 ? '#999' : '#333'
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '14px', color: '#666' }}>
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    color: currentPage === totalPages ? '#999' : '#333'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {selectedPost && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10000
                }} onClick={() => setSelectedPost(null)}>
                    <div style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontWeight: 'bold' }}>{selectedPost.title}</h3>
                            <button onClick={() => setSelectedPost(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        {isFetchingDetails ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading details...</div>
                        ) : (
                            <>
                                <img src={selectedPost.image} alt={selectedPost.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
                                <p><strong>Description:</strong> {selectedPost.description || "No description"}</p>
                                <p><strong>Location:</strong> {selectedPost.location || "N/A"}</p>
                                <p><strong>Status:</strong> {selectedPost.status ? (selectedPost.status === 'completed' ? 'Completed' : 'Active') : 'Active'}</p>
                                <p><strong>Category:</strong> {selectedPost.category}</p>
                                <p><strong>Posted By:</strong> {selectedPost.user?.firstName} {selectedPost.user?.lastName}</p>
                                <p><strong>Date:</strong> {new Date(selectedPost.createdAt).toLocaleDateString()}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPosts;
