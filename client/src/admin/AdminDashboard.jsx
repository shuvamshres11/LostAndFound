import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import './admin.css';

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
    }, []);

    const fetchStats = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) setStats(await res.json());
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchRecentPosts = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/posts?limit=5`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                const data = await res.json();
                setRecentPosts(data.items || []);
            }
        } catch (err) {
            console.error('Error fetching recent posts:', err);
        }
    };

    const totalItems = stats.lostItems + stats.foundItems;
    const lostPct  = totalItems > 0 ? (stats.lostItems  / totalItems) * 100 : 0;
    const foundPct = totalItems > 0 ? (stats.foundItems / totalItems) * 100 : 0;

    return (
        <div className="admin-page">
            <AdminNav />

            <div className="admin-container">

                {/* ── Header ── */}
                <div className="admin-page-header">
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {currentUser?.firstName || 'Admin'}. Here's your overview.</p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="admin-stats-grid">

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div>
                                <div className="admin-stat-label">Lost Items</div>
                                <h2 className="admin-stat-value red">{stats.lostItems}</h2>
                            </div>
                            <div className="admin-stat-icon red">📉</div>
                        </div>
                        <div className="admin-stat-bar-track">
                            <div className="admin-stat-bar-fill red" style={{ width: `${lostPct}%` }} />
                        </div>
                        <p className="admin-stat-note">{lostPct.toFixed(1)}% of total posts</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div>
                                <div className="admin-stat-label">Found Items</div>
                                <h2 className="admin-stat-value green">{stats.foundItems}</h2>
                            </div>
                            <div className="admin-stat-icon green">📈</div>
                        </div>
                        <div className="admin-stat-bar-track">
                            <div className="admin-stat-bar-fill green" style={{ width: `${foundPct}%` }} />
                        </div>
                        <p className="admin-stat-note">{foundPct.toFixed(1)}% of total posts</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <div>
                                <div className="admin-stat-label">Total Users</div>
                                <h2 className="admin-stat-value blue">{stats.totalUsers}</h2>
                            </div>
                            <div className="admin-stat-icon blue">👥</div>
                        </div>
                        <div className="admin-stat-bar-track">
                            <div className="admin-stat-bar-fill blue" style={{ width: '100%' }} />
                        </div>
                        <p className="admin-stat-note">Registered accounts</p>
                    </div>

                </div>

                {/* ── Recent Posts Table ── */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">Recent Posts</h3>
                        <Link to="/admin/all-posts" className="admin-action-link">View all →</Link>
                    </div>
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Posted By</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.length === 0 ? (
                                    <tr className="empty-row">
                                        <td colSpan={5}>No recent posts found.</td>
                                    </tr>
                                ) : recentPosts.map(post => (
                                    <tr key={post._id}>
                                        <td>{post.title}</td>
                                        <td>
                                            <span className={`admin-badge ${post.type}`}>
                                                {post.type}
                                            </span>
                                        </td>
                                        <td>
                                            {post.user ? `${post.user.firstName} ${post.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td style={{ color: '#6b7280' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </td>
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
                </div>

                {/* ── Quick Action Cards ── */}
                <div className="admin-actions-grid">

                    <div className="admin-action-card" onClick={() => navigate('/admin/all-posts')}>
                        <div className="admin-action-icon">📋</div>
                        <h3>All Posts</h3>
                        <p>View all lost and found posts with advanced filtering options.</p>
                        <span className="admin-action-link">View All Posts →</span>
                    </div>

                    <div className="admin-action-card" onClick={() => navigate('/admin/users')}>
                        <div className="admin-action-icon">👥</div>
                        <h3>Manage Users</h3>
                        <p>View all registered users, moderate accounts, and remove violators.</p>
                        <span className="admin-action-link">Go to Users →</span>
                    </div>

                    <div className="admin-action-card" onClick={() => navigate('/admin/posts')}>
                        <div className="admin-action-icon">📝</div>
                        <h3>Manage Posts</h3>
                        <p>Review lost and found posts, delete spam, and moderate content.</p>
                        <span className="admin-action-link">Go to Posts →</span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
