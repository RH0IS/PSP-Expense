import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UserForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            axios.get('http://localhost:5000/users').then(response => {
                const user = response.data.find(u => u._id === id);
                if (user) {
                    setName(user.name);
                    setEmail(user.email);
                }
            });
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = { name, email };

        if (id) {
            await axios.put(`http://localhost:5000/users/${id}`, userData);
        } else {
            await axios.post('http://localhost:5000/users', userData);
        }
        navigate('/');
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{id ? 'Edit User' : 'Add User'}</h3>
            <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-success mt-3">Save</button>
        </form>
    );
};

export default UserForm;