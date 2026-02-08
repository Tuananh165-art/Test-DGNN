import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CATEGORIES = {
  income: ['Lương', 'Thưởng', 'Đầu tư', 'Khác'],
  expense: ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Giải trí', 'Y tế', 'Học tập', 'Nhà cửa', 'Tiết kiệm', 'Khác']
};

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedBudgets = localStorage.getItem('budgets');
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (transaction) => {
    setTransactions([{ ...transaction, id: Date.now(), createdAt: new Date().toISOString() }, ...transactions]);
  };

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t));
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content">
        {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
        {activeTab === 'transactions' && (
          <Transactions
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            setShowModal={setShowModal}
            setEditingTransaction={setEditingTransaction}
          />
        )}
        {activeTab === 'budgets' && (
          <Budgets
            budgets={budgets}
            transactions={transactions}
            addBudget={(budget) => setBudgets([...budgets, { ...budget, id: Date.now() }])}
            updateBudget={(id, updated) => setBudgets(budgets.map(b => b.id === id ? { ...b, ...updated } : b))}
            deleteBudget={(id) => window.confirm('Bạn có chắc muốn xóa ngân sách này?') && setBudgets(budgets.filter(b => b.id !== id))}
          />
        )}
      </div>
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => { setShowModal(false); setEditingTransaction(null); }}
          onSave={(transaction) => {
            editingTransaction ? updateTransaction(editingTransaction.id, transaction) : addTransaction(transaction);
            setShowModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="header">
      <h1>💰 Quản Lý Chi Tiêu Cá Nhân</h1>
      <p>Theo dõi và kiểm soát tài chính của bạn một cách thông minh</p>
    </div>
  );
}

function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: '📊 Tổng quan' },
    { id: 'transactions', label: '💳 Giao dịch' },
    { id: 'budgets', label: '🎯 Ngân sách' }
  ];

  return (
    <div className="nav-tabs">
      {tabs.map(tab => (
        <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Dashboard({ transactions }) {
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense, transactionCount: monthlyTransactions.length };
  }, [transactions]);

  const chartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    const categoryData = {};
    monthlyExpenses.forEach(t => {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    return {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0']
      }]
    };
  }, [transactions]);

  return (
    <div>
      <h2>Tổng quan tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</h2>
      <div className="stats-grid">
        <div className="stat-card income"><div className="stat-label">Thu nhập</div><div className="stat-value">{formatCurrency(stats.income)}</div></div>
        <div className="stat-card expense"><div className="stat-label">Chi tiêu</div><div className="stat-value">{formatCurrency(stats.expense)}</div></div>
        <div className="stat-card balance"><div className="stat-label">Số dư</div><div className="stat-value">{formatCurrency(stats.balance)}</div></div>
        <div className="stat-card"><div className="stat-label">Giao dịch</div><div className="stat-value">{stats.transactionCount}</div></div>
      </div>
      <div className="chart-container">
        <h3>Biểu đồ chi tiêu theo danh mục</h3>
        {chartData.labels.length > 0 ? <Doughnut data={chartData} /> : <p>Chưa có dữ liệu</p>}
      </div>
    </div>
  );
}

function Transactions({ transactions, setShowModal, setEditingTransaction, deleteTransaction }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (filter !== 'all') filtered = filtered.filter(t => t.type === filter);
    if (searchTerm) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filter, searchTerm]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Quản lý giao dịch</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Thêm giao dịch</button>
      </div>
      <div className="transaction-filters">
        <input type="text" className="search-box" placeholder="🔍 Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="income">Thu nhập</option>
          <option value="expense">Chi tiêu</option>
        </select>
      </div>
      <div className="transaction-list">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-info">
              <span className="transaction-category">{transaction.category}</span>
              <div className="transaction-description">{transaction.description}</div>
              <div className="transaction-date">{formatDate(transaction.date)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
              <div className="transaction-actions">
                <button className="btn-icon" onClick={() => { setEditingTransaction(transaction); setShowModal(true); }}>✏️</button>
                <button className="btn-icon" onClick={() => deleteTransaction(transaction.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionModal({ transaction, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense',
    amount: transaction?.amount || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    notes: transaction?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    onSave({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{transaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loại giao dịch *</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })} required>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>
          </div>
          <div className="form-group">
            <label>Số tiền (VNĐ) *</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="1000" />
          </div>
          <div className="form-group">
            <label>Danh mục *</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
              <option value="">Chọn danh mục</option>
              {CATEGORIES[formData.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Mô tả *</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Ngày *</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">{transaction ? 'Cập nhật' : 'Thêm'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Budgets({ budgets, transactions, addBudget, updateBudget, deleteBudget }) {
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const budgetProgress = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return budgets.map(budget => {
      const spent = transactions.filter(t => {
        const date = new Date(t.date);
        return t.type === 'expense' && t.category === budget.category && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, t) => sum + t.amount, 0);
      const percentage = (spent / budget.amount) * 100;
      return { ...budget, spent, remaining: budget.amount - spent, percentage: Math.min(percentage, 100) };
    });
  }, [budgets, transactions]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Quản lý ngân sách</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>➕ Thêm ngân sách</button>
      </div>
      <div className="budget-list">
        {budgetProgress.map(budget => (
          <div key={budget.id} className="budget-item">
            <div className="budget-header">
              <div className="budget-category">{budget.category}</div>
              <div className="budget-amounts">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</div>
            </div>
            <div className="progress-bar">
              <div className={`progress-fill ${budget.percentage >= 100 ? 'danger' : budget.percentage >= 80 ? 'warning' : ''}`} style={{ width: `${budget.percentage}%` }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <span style={{ color: budget.remaining >= 0 ? '#10b981' : '#ef4444' }}>Còn lại: {formatCurrency(budget.remaining)}</span>
              <div>
                <button className="btn-icon" onClick={() => { setEditingBudget(budget); setShowModal(true); }}>✏️</button>
                <button className="btn-icon" onClick={() => deleteBudget(budget.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => { setShowModal(false); setEditingBudget(null); }}
          onSave={(budget) => {
            editingBudget ? updateBudget(editingBudget.id, budget) : addBudget(budget);
            setShowModal(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
}

function BudgetModal({ budget, onClose, onSave }) {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    onSave({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{budget ? 'Sửa ngân sách' : 'Thêm ngân sách mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Danh mục *</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
              <option value="">Chọn danh mục</option>
              {CATEGORIES.expense.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Số tiền ngân sách (VNĐ) *</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="10000" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">{budget ? 'Cập nhật' : 'Thêm'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
