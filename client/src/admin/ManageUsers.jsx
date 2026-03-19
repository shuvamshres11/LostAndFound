import React, { useEffect, useState } from 'react';
import AdminNav from './AdminNav';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'x-user-id': userId // Sending ID for simple auth check
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                showToast("Failed to fetch users", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error fetching users", "error");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to ban/delete this user? This will remove matching items.")) return;

        try {
            const userId = currentUser?._id || currentUser?.id;
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': userId
                }
            });

            if (res.ok) {
                showToast("User deleted successfully", "success");
                setUsers(users.filter(user => user._id !== id));
            } else {
                showToast("Failed to delete user", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Error deleting user", "error");
        }
    };

    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [userToWarn, setUserToWarn] = useState(null);
    const [warningMessage, setWarningMessage] = useState("");

    // ... existing check admin access ...

    // ... existing fetchUsers ...

    // ... existing deleteUser ...

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
            const res = await fetch(`http://localhost:5000/api/admin/users/${userToWarn._id}/warning`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                },
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
            console.error(err);
            showToast("Error sending warning", "error");
        }
    };

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f9fa' }}>
            <AdminNav />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Manage Users</h2>
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '12px' }}>Name</th>
                                <th style={{ padding: '12px' }}>Email</th>
                                <th style={{ padding: '12px' }}>Role</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{user.firstName} {user.lastName}</td>
                                    <td style={{ padding: '12px' }}>{user.email}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            background: user.role === 'admin' ? '#e3f2fd' : '#f5f5f5',
                                            color: user.role === 'admin' ? '#1976d2' : '#616161'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {user.role !== 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => openWarningModal(user)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: '#ff9800',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        marginRight: '8px'
                                                    }}
                                                >
                                                    Warn
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        background: '#ff3b30',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    Ban User
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No users found.</p>}
                </div>
            </div>

            {/* Warning Modal */}
            {warningModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Send Warning to {userToWarn?.firstName}</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                            Sending a warning regarding community guidelines violation.
                        </p>
                        <textarea
                            value={warningMessage}
                            onChange={(e) => setWarningMessage(e.target.value)}
                            placeholder="Enter warning message..."
                            style={{
                                width: '100%', height: '100px', padding: '10px',
                                borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', resize: 'vertical',
                                backgroundColor: '#333', color: 'white'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setWarningModalOpen(false)}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd',
                                    background: 'white', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendWarning}
                                style={{
                                    padding: '8px 16px', borderRadius: '6px', border: 'none',
                                    background: '#ff9800', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Send Warning
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
