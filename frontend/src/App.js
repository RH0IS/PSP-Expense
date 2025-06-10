import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UserForm from './components/UserForm';
import Transactions from './components/Transactions';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-user" element={<UserForm />} />
          <Route path="/edit-user/:id" element={<UserForm />} />
          <Route path="/user/:userId/transactions" element={<Transactions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;