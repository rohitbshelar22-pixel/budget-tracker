
import { useState, useEffect } from 'react'
import './App.css'

function getTodayDate() {
  const today = new Date()
  const offset = today.getTimezoneOffset()
  return new Date(today.getTime() - offset * 60000)
    .toISOString()
    .split('T')[0]
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('transactions')) || []
    } catch {
      return []
    }
  })

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('Income')
  const [date, setDate] = useState(getTodayDate())
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  const income = transactions
    .filter(item => item.type === 'Income')
    .reduce((total, item) => total + Number(item.amount), 0)

  const expenses = transactions
    .filter(item => item.type === 'Expense')
    .reduce((total, item) => total + Number(item.amount), 0)

  const balance = income - expenses

  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' || item.type === filter

    return matchesSearch && matchesFilter
  })

  const resetForm = () => {
    setName('')
    setAmount('')
    setType('Income')
    setDate(getTodayDate())
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !amount || Number(amount) <= 0 || !date) {
      alert('Please enter valid details')
      return
    }

    if (editingId !== null) {
      setTransactions(prev =>
        prev.map(item =>
          item.id === editingId
            ? {
                ...item,
                name: name.trim(),
                amount: Number(amount),
                type,
                date
              }
            : item
        )
      )
    } else {
      const newTransaction = {
        id: Date.now(),
        name: name.trim(),
        amount: Number(amount),
        type,
        date
      }

      setTransactions(prev => [...prev, newTransaction])
    }

    resetForm()
  }

  const handleEdit = (item) => {
    setName(item.name)
    setAmount(String(item.amount))
    setType(item.type)
    setDate(item.date || getTodayDate())
    setEditingId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(item => item.id !== id))

    if (editingId === id) {
      resetForm()
    }
  }

  const formatMoney = (value) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Personal Budget Tracker</h1>
        <p>Manage your money. Track your future.</p>
      </header>

      <section className="cards">
        <div className="card balance-card">
          <h3>Total Balance</h3>
          <h2>₹{formatMoney(balance)}</h2>
        </div>

        <div className="card income-card">
          <h3>Total Income</h3>
          <h2>₹{formatMoney(income)}</h2>
        </div>

        <div className="card expense-card">
          <h3>Total Expenses</h3>
          <h2>₹{formatMoney(expenses)}</h2>
        </div>
      </section>

      <section className="form-section">
        <h2>{editingId !== null ? 'Edit Transaction' : 'Add Transaction'}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Transaction Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <select
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <button type="submit" className="submit-btn">
            {editingId !== null ? 'Update Transaction' : 'Add Transaction'}
          </button>

          {editingId !== null && (
            <button
              type="button"
              className="cancel-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="history-section">
        <h2>Transaction History</h2>

        <div className="filters">
          <input
            type="search"
            placeholder="Search transaction..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All Transactions</option>
            <option value="Income">Income Only</option>
            <option value="Expense">Expense Only</option>
          </select>
        </div>

        <div className="transaction-list">
          {filteredTransactions.length === 0 ? (
            <p className="empty-message">
              No transactions found.
            </p>
          ) : (
            filteredTransactions.map(item => (
              <div className="transaction" key={item.id}>
                <div className="transaction-info">
                  <strong>{item.name}</strong>
                  <small>{item.date || 'Date not available'}</small>
                </div>

                <span className={`transaction-type ${item.type.toLowerCase()}`}>
                  {item.type}
                </span>

                <strong className={`transaction-amount ${item.type.toLowerCase()}`}>
                  {item.type === 'Income' ? '+' : '-'}₹{formatMoney(item.amount)}
                </strong>

                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer>
        <p>Personal Budget Tracker | Built with React</p>
      </footer>
    </div>
  )
}

export default App
