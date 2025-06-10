import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
        const result = await axios.get(`http://localhost:5000/users/${userId}/transactions`);
        setTransactions(result.data);
    };

    const addTransaction = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/transactions', { userId, type, category, amount: Number(amount) });
        setCategory('');
        setAmount('');
        fetchTransactions();
    };

    const deleteTransaction = async (id) => {
        await axios.delete(`http://localhost:5000/transactions/${id}`);
        fetchTransactions();
    };

    return (
        <div>
            <h3>Transactions</h3>
            {/* Add Transaction Form */}
            <form onSubmit={addTransaction}>
                <h4>Add New Transaction</h4>
                <div className="row">
                    <div className="col">
                        <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    {type === 'expense' && (
                        <div className="col">
                            <input type="text" className="form-control" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
                        </div>
                    )}
                    <div className="col">
                        <input type="number" className="form-control" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div className="col">
                        <button type="submit" className="btn btn-primary">Add</button>
                    </div>
                </div>
            </form>

            <hr />

            {/* Transactions List */}
            <ul className="list-group mt-3">
                {transactions.map(t => (
                    <li key={t._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            {t.type === 'income' ? 'Income' : `Expense: ${t.category}`}
                            <strong className={t.type === 'income' ? 'text-success' : 'text-danger'}> ${t.amount}</strong>
                            <small className="ml-2 text-muted">{new Date(t.date).toLocaleDateString()}</small>
                        </div>
                        <button onClick={() => deleteTransaction(t._id)} className="btn btn-sm btn-danger">Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Transactions;