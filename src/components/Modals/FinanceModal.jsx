import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function FinanceModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('summaryTab');
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('income');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Profit Calculator state
  const [revenue, setRevenue] = useState('');
  const [costs, setCosts] = useState('');
  const [profitResult, setProfitResult] = useState('');

  // EMI Calculator state
  const [loanAmt, setLoanAmt] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [emiResult, setEmiResult] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, user]);

  const fetchTransactions = async () => {
    if (!user) {
      const stored = localStorage.getItem('demo_transactions');
      setTransactions(stored ? JSON.parse(stored) : []);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching transactions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;

    const amt = parseFloat(amount);
    const newTx = {
      type,
      description: desc.trim(),
      amount: amt,
      created_at: new Date().toISOString()
    };

    if (!user) {
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('demo_transactions', JSON.stringify(updated));
      setDesc('');
      setAmount('');
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type,
          description: desc.trim(),
          amount: amt
        }]);

      if (error) throw error;
      setDesc('');
      setAmount('');
      fetchTransactions();
    } catch (err) {
      alert("Error adding transaction: " + err.message);
    }
  };

  const handleCalculateProfit = (e) => {
    e.preventDefault();
    const rev = parseFloat(revenue);
    const cost = parseFloat(costs);
    const profit = rev - cost;
    setProfitResult(`Net Profit: ₹${profit.toFixed(2)}`);
  };

  const handleCalculateEMI = (e) => {
    e.preventDefault();
    const p = parseFloat(loanAmt);
    const r = (parseFloat(interestRate) / 12) / 100;
    const n = parseFloat(tenure) * 12;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmiResult(`Monthly EMI: ₹${emi.toFixed(2)}`);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netIncome = totalIncome - totalExpense;

  if (!isOpen) return null;

  return (
    <div className={`modal modal-lg show`}>
      <div className="modal-content neon-border">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Finance Manager</h2>
        
        <div className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'summaryTab' ? 'active' : ''}`} 
            onClick={() => setActiveTab('summaryTab')}
          >
            Summary & Transactions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'profitTab' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profitTab')}
          >
            Profit Calculator
          </button>
          <button 
            className={`tab-btn ${activeTab === 'emiTab' ? 'active' : ''}`} 
            onClick={() => setActiveTab('emiTab')}
          >
            Loan EMI Calculator
          </button>
        </div>

        {activeTab === 'summaryTab' && (
          <div className="tab-content active">
            <h3>Financial Overview</h3>
            <div className="finance-summary">
              <div className="summary-card">
                <h4>Total Income</h4>
                <p id="totalIncomeValue">₹{totalIncome.toFixed(2)}</p>
              </div>
              <div className="summary-card">
                <h4>Total Expense</h4>
                <p id="totalExpenseValue">₹{totalExpense.toFixed(2)}</p>
              </div>
              <div className="summary-card">
                <h4>Net Income</h4>
                <p id="netIncomeValue" className={netIncome >= 0 ? 'positive' : 'negative'}>
                  ₹{netIncome.toFixed(2)}
                </p>
              </div>
            </div>
            
            <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
            
            <form onSubmit={handleAddTransaction}>
              <h3>Add New Transaction</h3>
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  placeholder="e.g., Sold 10 quintals of rice" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 22000" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="form-submit-btn">Add Transaction</button>
            </form>

            <h4 style={{ marginTop: '20px', color: 'var(--primary-neon)' }}>Transaction History</h4>
            {loading ? (
              <p>Loading transactions...</p>
            ) : (
              <ul id="transactionList">
                {transactions.length === 0 ? (
                  <li>No transactions yet.</li>
                ) : (
                  transactions.map((t, index) => (
                    <li key={t.id || index} className={`transaction-${t.type}`}>
                      <span>{t.description}</span>
                      <span>{t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'profitTab' && (
          <div className="tab-content active">
            <h3>Profit Calculator</h3>
            <form onSubmit={handleCalculateProfit}>
              <div className="form-group">
                <label>Total Revenue (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 50000" 
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Total Costs (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 25000" 
                  value={costs}
                  onChange={(e) => setCosts(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="form-submit-btn">Calculate Profit</button>
            </form>
            {profitResult && (
              <div className="calculator-result" style={{ color: 'var(--primary-neon)' }}>
                {profitResult}
              </div>
            )}
          </div>
        )}

        {activeTab === 'emiTab' && (
          <div className="tab-content active">
            <h3>Loan EMI Calculator</h3>
            <form onSubmit={handleCalculateEMI}>
              <div className="form-group">
                <label>Loan Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 100000" 
                  value={loanAmt}
                  onChange={(e) => setLoanAmt(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Annual Interest Rate (%)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g., 8.5" 
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Loan Tenure (in Years)</label>
                <input 
                  type="number" 
                  placeholder="e.g., 5" 
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="form-submit-btn">Calculate EMI</button>
            </form>
            {emiResult && (
              <div className="calculator-result" style={{ color: 'var(--primary-neon)' }}>
                {emiResult}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
