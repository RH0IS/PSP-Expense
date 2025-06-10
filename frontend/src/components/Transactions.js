import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles/Transactions.css'; // custom styles

const Transactions = () => {
    const { userId } = useParams();
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('income');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    const fetchTransactions = async () => {
        const result = await axios.get(`http://localhost:5001/users/${userId}/transactions`);
        setTransactions(result.data);
    };

    const addTransaction = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5001/transactions', {
            userId,
            type,
            category,
            amount: Number(amount)
        });
        setCategory('');
        setAmount('');
        fetchTransactions();
    };

    const deleteTransaction = async (id) => {
        await axios.delete(`http://localhost:5001/transactions/${id}`);
        fetchTransactions();
    };

    return (
        <div className="transactions-container">
            <h3 className="mb-4">User Transactions</h3>

            {/* Add Transaction Form */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Add New Transaction</h5>
                    <form onSubmit={addTransaction} className="row g-3">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        {type === 'expense' && (
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Category"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="col-md-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-md-3 d-grid">
                            <button type="submit" className="btn btn-success">
                                Add Transaction
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Transactions List */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">Transaction History</h5>
                    {transactions.length === 0 ? (
                        <p className="text-muted">No transactions found.</p>
                    ) : (
                        <ul className="list-group">
                            {transactions.map(t => (
                                <li
                                    key={t._id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <span className="fw-bold me-2">
                                            {t.type === 'income' ? 'Income' : `Expense (${t.category})`}
                                        </span>
                                        <span
                                            className={
                                                t.type === 'income'
                                                    ? 'text-success fw-semibold'
                                                    : 'text-danger fw-semibold'
                                            }
                                        >
                                            ${t.amount}
                                        </span>
                                        <small className="text-muted d-block">
                                            {new Date(t.date).toLocaleDateString()}
                                        </small>
                                    </div>
                                    <button
                                        onClick={() => deleteTransaction(t._id)}
                                        className="btn btn-sm btn-outline-danger"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
