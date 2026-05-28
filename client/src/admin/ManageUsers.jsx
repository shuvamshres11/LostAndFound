import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import './admin.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [userToWarn, setUserToWarn] = useState(null);
    const [warningMessage, setWarningMessage] = useState("");

    const [banModalOpen, setBanModalOpen] = useState(false);
    const [userToBan, setUserToBan] = useState(null);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            showToast("Access Denied: Admins Only", "error");
        } else {
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { 'x-user-id': userId }
            });
            if (res.ok) setUsers(await res.json());
            else showToast("Failed to fetch users", "error");
        } catch (err) {
            console.error(err);
            showToast("Error fetching users", "error");
        }
    };

    const triggerBanConfirm = (id) => {
        setUserToBan(id);
        setBanModalOpen(true);
    };

    const deleteUser = async () => {
        if (!userToBan) return;
        setBanModalOpen(false);
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userToBan}`, {
                method: 'DELETE',
                headers: { 'x-user-id': userId }
            });
            if (res.ok) {
                showToast("User deleted successfully", "success");
                setUsers(users.filter(u => u._id !== userToBan));
            } else {
                showToast("Failed to delete user", "error");
            }
        } catch (err) {
            showToast("Error deleting user", "error");
        } finally {
            setUserToBan(null);
        }
    };

    const openWarningModal = (user) => {
        setUserToWarn(user);
        setWarningMessage("");
        setWarningModalOpen(true);
    };

    const sendWarning = async () => {
        if (!warningMessage.trim()) {
            showToast("Please enter a warning message", "error");
            return;
        }
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userToWarn._id}/warning`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                body: JSON.stringify({ message: warningMessage })
            });
            if (res.ok) {
                showToast("Warning sent successfully", "success");
                setWarningModalOpen(false);
                setUserToWarn(null);
            } else {
                showToast("Failed to send warning", "error");
            }
        } catch (err) {
            showToast("Error sending warning", "error");
        }
    };

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (u) => `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase();

    return (
        <div className="admin-page">
            <AdminNav />

            <div className="admin-container">

                <div className="admin-page-header">
                    <h1>Manage Users</h1>
                    <p>View, warn, or remove registered accounts.</p>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h3 className="admin-card-title">All Users ({users.length})</h3>
                        <div className="admin-toolbar">
                            <div className="admin-search-wrap">
                                <span className="admin-search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name or email…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr className="empty-row">
                                        <td colSpan={4}>No users found.</td>
                                    </tr>
                                ) : filtered.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">{getInitials(user)}</div>
                                                <span>{user.firstName} {user.lastName}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: '#6b7280' }}>{user.email}</td>
                                        <td>
                                            <span className={`admin-badge ${user.role}`}>{user.role}</span>
                                        </td>
                                        <td>
                                            {user.role !== 'admin' && (
                                                <div className="admin-btn-group">
                                                    <button
                                                        className="admin-btn warning"
                                                        onClick={() => openWarningModal(user)}
                                                    >
                                                        ⚠️ Warn
                                                    </button>
                                                    <button
                                                        className="admin-btn danger"
                                                        onClick={() => triggerBanConfirm(user._id)}
                                                    >
                                                        🚫 Ban
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ── Warning Modal ── */}
            {warningModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h3>⚠️ Send Warning</h3>
                        <p>Sending a warning to <strong>{userToWarn?.firstName} {userToWarn?.lastName}</strong> regarding a community guidelines violation.</p>
                        <textarea
                            value={warningMessage}
                            onChange={e => setWarningMessage(e.target.value)}
                            placeholder="Enter warning message…"
                        />
                        <div className="admin-modal-actions">
                            <button className="admin-btn secondary" onClick={() => setWarningModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="admin-btn warning" onClick={sendWarning}>
                                Send Warning
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal 
                isOpen={banModalOpen} 
                title="Ban User" 
                message="Are you sure you want to ban/delete this user? This action cannot be undone." 
                onConfirm={deleteUser} 
                onCancel={() => { setBanModalOpen(false); setUserToBan(null); }} 
                confirmText="Ban"
            />
        </div>
    );
};

export default ManageUsers;
