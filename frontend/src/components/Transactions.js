import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts'; // Import Recharts components
import './styles/Transactions.css'; // Make sure this CSS file exists and is styled

// Define a set of colors for the pie chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666', '#66B2FF', '#FFB266'];

const Transactions = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('income');  // default to income
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [expenseChartData, setExpenseChartData] = useState([]); // State for expense chart data

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    useEffect(() => {
        // Recalculate expense chart data whenever transactions change
        processExpenseDataForChart(transactions);
    }, [transactions]);

    const fetchTransactions = async () => {
        try {
            const result = await axios.get(`http://localhost:5001/users/${userId}/transactions`);
            setTransactions(result.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const processExpenseDataForChart = (txns) => {
        const expenseCategories = {};
        txns.forEach(t => {
            if (t.type === 'expense' && t.category) {
                expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
            }
        });

        const chartData = Object.keys(expenseCategories).map(cat => ({
            name: cat,
            value: expenseCategories[cat]
        }));
        setExpenseChartData(chartData);
    };

    const addTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/transactions', {
                userId,
                type,
                category: type === 'expense' ? category : '', // Only save category for expenses
                amount: Number(amount),
            });
            setCategory('');
            setAmount('');
            fetchTransactions();
            closeModal();
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const deleteTransaction = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await axios.delete(`http://localhost:5001/transactions/${id}`);
            fetchTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const openModal = (transaction = null) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setType(transaction.type);
            setCategory(transaction.category || '');
            setAmount(transaction.amount);
        } else {
            setEditingTransaction(null);
            setType('income');
            setCategory('');
            setAmount('');
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTransaction(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                const { _id } = editingTransaction;
                await axios.put(`http://localhost:5001/transactions/${_id}`, {
                    type,
                    category: type === 'expense' ? category : '', // Only update category for expenses
                    amount: Number(amount),
                });
            } else {
                await addTransaction(e); // This will handle the POST request
            }
            fetchTransactions();
            closeModal();
        } catch (error) {
            console.error('Error submitting transaction:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'type') {
            if (value === 'income') {
                setCategory(''); // Clear category if type changes to income
            }
            setType(value);
        } else if (name === 'category') {
            setCategory(value);
        } else if (name === 'amount') {
            setAmount(value);
        }

        if (editingTransaction) {
            setEditingTransaction((prev) => ({ ...prev, [name]: value }));
        }
    };

    const goBack = () => {
        navigate('/');
    };

    return (
        <div className="transactions-container">
            <button onClick={goBack} className="btn btn-outline-secondary mb-4">Back to Dashboard</button>

            <h3 className="mb-4">User Transactions</h3>

            <button onClick={() => openModal()} className="btn btn-primary mb-4">
                Add Transaction
            </button>

            {/* Add/Edit Transaction Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={closeModal}>
                            &times;
                        </button>
                        <h3>{editingTransaction ? 'Edit' : 'Add'} Transaction</h3>
                        <form className="user-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={type}
                                    onChange={handleChange}
                                >
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            {type === 'expense' && (
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="category"
                                        value={category}
                                        onChange={handleChange}
                                        placeholder="e.g., Food, Transport, Rent"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="amount"
                                    value={amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-success">
                                    {editingTransaction ? 'Save Changes' : 'Add Transaction'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary ms-2"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pie Chart and Transactions List Layout */}
            <div className="transactions-content-layout">
                {/* Pie Chart Section */}
                <div className="chart-section card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Expense Distribution by Category</h5>
                        {expenseChartData.length > 0 ? (
                            <div className="chart-wrapper">
                                <PieChart width={300} height={300}>
                                    <Pie
                                        data={expenseChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {expenseChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                                </PieChart>

                                {/* Legend */}
                                <ul className="custom-legend">
                                    {expenseChartData.map((entry, index) => (
                                        <li key={`legend-${index}`}>
                                            <span
                                                className="legend-color"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            ></span>
                                            {entry.name}: ${entry.value.toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-muted">No expense data to display chart.</p>
                        )}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="transactions-list-section card shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Transaction History</h5>
                        {transactions.length === 0 ? (
                            <p className="text-muted">No transactions found.</p>
                        ) : (
                            <ul className="list-group">
                                {transactions.map((t) => (
                                    <li
                                        key={t._id}
                                        className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <span className="fw-bold me-2">
                                                {t.type === 'income' ? 'Income' : `Expense (${t.category || 'N/A'})`}
                                            </span>
                                            <span
                                                className={
                                                    t.type === 'income'
                                                        ? 'text-success fw-semibold'
                                                        : 'text-danger fw-semibold'
                                                }
                                            >
                                                ${t.amount.toFixed(2)}
                                            </span>
                                            <small className="text-muted d-block">
                                                {new Date(t.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => openModal(t)}
                                                className="btn btn-sm btn-info me-2"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteTransaction(t._id)}
                                                className="btn btn-sm btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;