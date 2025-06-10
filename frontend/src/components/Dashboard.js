import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [chartData, setChartData] = useState({ expenses: [], income: 0 });

    useEffect(() => {
        fetchUsers();
        fetchChartData();
    }, []);

    const fetchUsers = async () => {
        const result = await axios.get('http://localhost:5000/users');
        setUsers(result.data);
    };

    const fetchChartData = async () => {
        const result = await axios.get('http://localhost:5000/chart-data');
        setChartData(result.data);
    };

    const deleteUser = async (id) => {
        await axios.delete(`http://localhost:5000/users/${id}`);
        fetchUsers();
    };

    const chartDisplayData = [
        ...chartData.expenses,
        { name: 'Income', value: chartData.income }
    ];

    return (
        <div>
            <h2>Expense Management Dashboard</h2>
            <Link to="/add-user" className="btn btn-primary mb-3">Add New User</Link>

            {/* Bonus: Pie Chart */}
            <h4>All Users - Income vs. Expenses by Category</h4>
            <PieChart width={400} height={400}>
                <Pie data={chartDisplayData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8">
                    {chartDisplayData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
            </PieChart>

            <hr/>

            <h3>All Users</h3>
            <table className="table">
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
                            <td><Link to={`/user/${user._id}/transactions`}>{user.name}</Link></td>
                            <td>${user.totalIncome}</td>
                            <td>${user.totalExpense}</td>
                            <td>
                                <Link to={`/edit-user/${user._id}`} className="btn btn-sm btn-info">Edit</Link>
                                <button onClick={() => deleteUser(user._id)} className="btn btn-sm btn-danger ml-2">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;