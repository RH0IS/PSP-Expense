const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect('mongodb://mongo:27017/expense_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// --- Schemas ---
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String, // 'income' or 'expense'
  category: String,
  amount: Number,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// --- API Endpoints ---

// -- Root Route --
app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API!');
});

// -- Users --
app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send(user);
});

app.get('/users', async (req, res) => {
    const users = await User.find();
    const usersWithTotals = await Promise.all(users.map(async (user) => {
        const income = await Transaction.aggregate([
            { $match: { userId: user._id, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const expense = await Transaction.aggregate([
            { $match: { userId: user._id, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return {
            ...user._doc,
            totalIncome: income[0] ? income[0].total : 0,
            totalExpense: expense[0] ? expense[0].total : 0
        };
    }));
    res.send(usersWithTotals);
});


app.put('/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(user);
});

app.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Transaction.deleteMany({ userId: req.params.id });
  res.send({ message: 'User deleted' });
});

// -- Transactions --
app.get('/users/:userId/transactions', async (req, res) => {
    const transactions = await Transaction.find({ userId: req.params.userId });
    res.send(transactions);
});

app.post('/transactions', async (req, res) => {
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.send(transaction);
});

app.delete('/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.send({ message: 'Transaction deleted' });
});

// -- Bonus: Chart Data --
app.get('/chart-data', async (req, res) => {
    const expenseByCategory = await Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);
    const totalIncome = await Transaction.aggregate([
        { $match: { type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const chartData = {
        expenses: expenseByCategory.map(item => ({ name: item._id, value: item.total })),
        income: totalIncome[0] ? totalIncome[0].total : 0
    };
    res.send(chartData);
});


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
