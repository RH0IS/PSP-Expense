import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserForm = ({ id, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:5001/users/${id}`);
                    const user = response.data;
                    if (user) {
                        setName(user.name);
                        setEmail(user.email);
                    }
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                }
            } else {
                setName('');
                setEmail('');
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter a user name!');
            return;
        }
        setLoading(true);
        const userData = { name, email };
        try {
            if (id) {
                await axios.put(`http://localhost:5001/users/${id}`, userData);
            } else {
                await axios.post('http://localhost:5001/users', userData);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="user-form" noValidate>
            <h3>{id ? 'Edit User' : 'Add User'}</h3>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <button type="submit" className="btn btn-success mt-3" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary mt-3" disabled={loading}>
                Cancel
            </button>
        </form>
    );
};

export default UserForm;
