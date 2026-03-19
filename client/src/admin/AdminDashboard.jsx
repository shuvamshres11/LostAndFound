import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const { showToast } = useToast();
    const [stats, setStats] = useState({ lostItems: 0, foundItems: 0, totalUsers: 0 });
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            showToast("Access Denied: Admins Only", "error");
        } else {
            fetchStats();
            fetchRecentPosts();
        }
    }, [currentUser, navigate, showToast]);

    const fetchStats = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;

            const res = await fetch('http://localhost:5000/api/admin/stats', {
                headers: { 'x-user-id': userId }
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchRecentPosts = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            // Fetch posts with limit 5 explicitly
            const res = await fetch('http://localhost:5000/api/admin/posts?limit=5', {
                headers: { 'x-user-id': userId }
            });

            if (res.ok) {
                const data = await res.json();
                // data.items contains the posts
                setRecentPosts(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching recent posts:', err);
        }
    };

    const totalItems = stats.lostItems + stats.foundItems;
    const lostPercentage = totalItems > 0 ? (stats.lostItems / totalItems) * 100 : 0;
    const foundPercentage = totalItems > 0 ? (stats.foundItems / totalItems) * 100 : 0;

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f9fa' }}>
            <AdminNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '10px', fontWeight: 'bold' }}>Admin Dashboard</h1>
                <p style={{ color: '#666', marginBottom: '40px' }}>Welcome back, {currentUser?.firstName || 'Admin'}. Here's your overview.</p>

                {/* Statistics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>

                    {/* Lost Items Card */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Lost Items</p>
                                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#d32f2f' }}>{stats.lostItems}</h2>
                            </div>
                            <div style={{ fontSize: '40px' }}>📉</div>
                        </div>
                        {/* Mini Graph */}
                        <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${lostPercentage}%`,
                                height: '100%',
                                background: 'linear-gradient(to right, #ef5350, #d32f2f)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>{lostPercentage.toFixed(1)}% of total posts</p>
                    </div>

                    {/* Found Items Card */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Found Items</p>
                                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#388e3c' }}>{stats.foundItems}</h2>
                            </div>
                            <div style={{ fontSize: '40px' }}>📈</div>
                        </div>
                        {/* Mini Graph */}
                        <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${foundPercentage}%`,
                                height: '100%',
                                background: 'linear-gradient(to right, #66bb6a, #388e3c)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>{foundPercentage.toFixed(1)}% of total posts</p>
                    </div>

                    {/* Total Users Card */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Total Users</p>
                                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>{stats.totalUsers}</h2>
                            </div>
                            <div style={{ fontSize: '40px' }}>👥</div>
                        </div>
                        {/* Mini Graph */}
                        <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, #42a5f5, #1976d2)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>Registered accounts</p>
                    </div>
                </div>

                {/* Recent Posts Table */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Recent Posts</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>Title</th>
                                    <th style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>Type</th>
                                    <th style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>Posted By</th>
                                    <th style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>Date</th>
                                    <th style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#666' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.map(post => (
                                    <tr key={post._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '12px', fontSize: '14px' }}>{post.title}</td>
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
                                        <td style={{ padding: '12px', fontSize: '14px' }}>
                                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                background: post.status === 'active' ? '#e3f2fd' : '#f5f5f5',
                                                color: post.status === 'active' ? '#1976d2' : '#616161'
                                            }}>
                                                {post.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {recentPosts.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No recent posts</p>
                        )}
                    </div>
                </div>

                {/* Management Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                    {/* All Posts Card */}
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        border: '1px solid #eee'
                    }} onClick={() => navigate('/admin/all-posts')}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>📋</div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>All Posts</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>View all lost and found posts with advanced filtering options.</p>
                        <Link to="/admin/all-posts" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>View All Posts &rarr;</Link>
                    </div>

                    {/* Manage Users Card */}
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        border: '1px solid #eee'
                    }} onClick={() => navigate('/admin/users')}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>👥</div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Manage Users</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>View all registered users, moderate accounts, and remove violators.</p>
                        <Link to="/admin/users" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>Go to Users &rarr;</Link>
                    </div>

                    {/* Manage Posts Card */}
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s',
                        cursor: 'pointer',
                        border: '1px solid #eee'
                    }} onClick={() => navigate('/admin/posts')}>
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>📝</div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>Manage Posts</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Review lost and found posts, delete spam, and moderate content.</p>
                        <Link to="/admin/posts" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '600' }}>Go to Posts &rarr;</Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
