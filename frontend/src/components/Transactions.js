import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styles/Transactions.css';

const Transactions = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [type, setType] = useState('income');  // default to income
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

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
            amount: Number(amount),
        });
        setCategory('');
        setAmount('');
        fetchTransactions();
        closeModal();
    };

    const deleteTransaction = async (id) => {
        await axios.delete(`http://localhost:5001/transactions/${id}`);
        fetchTransactions();
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
        if (editingTransaction) {
            const { _id } = editingTransaction;
            await axios.put(`http://localhost:5001/transactions/${_id}`, {
                type,
                category,
                amount: Number(amount),
            });
        } else {
            await addTransaction(e);
        }
        fetchTransactions();
        closeModal();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'type') {
            // If type is changed to 'income', reset the category
            if (value === 'income') {
                setCategory('');
            }
            setType(value);
        } else if (name === 'category') {
            setCategory(value);
        } else if (name === 'amount') {
            setAmount(value);
        }

        // If editing a transaction, we update the editing state as well
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

            {/* Transactions List */}
            <div className="card shadow-sm">
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
    );
};

export default Transactions;
