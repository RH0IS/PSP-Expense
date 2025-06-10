import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import UserForm from './UserForm';  // Import UserForm component
import './styles/Dashboard.css';

const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#fd7e14', '#343a40'];

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState({ expenses: [], income: 0 });
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchChartData();
    }, []);

    const fetchUsers = async () => {
        try {
            const result = await axios.get('http://localhost:5001/users');
            setUsers(result.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchChartData = async () => {
        try {
            const result = await axios.get('http://localhost:5001/chart-data');
            setChartData(result.data);
        } catch (error) {
            console.error('Failed to fetch chart data:', error);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`http://localhost:5001/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const openAddUserForm = () => {
        setEditingUserId(null);
        setShowUserForm(true);
    };

    const openEditUserForm = (id) => {
        setEditingUserId(id);
        setShowUserForm(true);
    };

    const closeUserForm = () => {
        setShowUserForm(false);
        fetchUsers();
    };

    const chartDisplayData = [
        ...chartData.expenses,
        { name: 'Income', value: chartData.income }
    ];

    return (
        <div className="dashboard-container">
            <header>
                <h2 className="dashboard-title">PSP EXPENSE MANAGEMENT</h2>
            </header>

            {/* Pie Chart with Legend */}
            <section className="chart-section">
                <h4>All Users - Income vs. Expenses by Category</h4>
                <div className="chart-wrapper">
                    <PieChart width={300} height={300}>
                        <Pie
                            data={chartDisplayData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                        >
                            {chartDisplayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>

                    {/* Legend */}
                    <ul className="custom-legend">
                        {chartDisplayData.map((entry, index) => (
                            <li key={`legend-${index}`}>
                                <span
                                    className="legend-color"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></span>
                                {entry.name}: ${entry.value}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Users Table */}
            <section className="users-table-section">
                <h3>
                    All Users
                    <button onClick={openAddUserForm} className="btn btn-primary mb-3 ml-3">
                        Add New User
                    </button>
                </h3>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Total Income</th>
                            <th>Total Expense</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td><Link to={`/user/${user._id}/transactions`} className="user-link">{user.name}</Link></td>
                                <td>${user.totalIncome}</td>
                                <td>${user.totalExpense}</td>
                                <td>
                                    <button onClick={() => openEditUserForm(user._id)} className="btn btn-sm btn-info">Edit</button>
                                    <button onClick={() => deleteUser(user._id)} className="btn btn-sm btn-danger ml-2">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* User Form Modal */}
            {showUserForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <button aria-label="Close modal" className="modal-close" onClick={closeUserForm}>×</button>
                        <UserForm id={editingUserId} onClose={closeUserForm} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
