'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { formatMoney, formatDate } from '../lib/utils';
import { CATEGORIES } from './ExpenseForm';
import ExpenseCharts from './ExpenseCharts';
import styles from './ExpenseList.module.css';

interface Expense {
  id: string;
  amountCents: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseListProps {
  refreshTrigger: number;
}

export default function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Remove from local state immediately for snappy UI
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting expense');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (categoryFilter !== 'All') {
          queryParams.append('category', categoryFilter);
        }
        queryParams.append('sort', sortOrder);

        const response = await fetch(`/api/expenses?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        
        const data = await response.json();
        setExpenses(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [categoryFilter, sortOrder, refreshTrigger]);

  const totalCents = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amountCents, 0);
  }, [expenses]);

  const [activeTab, setActiveTab] = useState<'timeline' | 'monthly' | 'graphs'>('timeline');

  const [monthFilter, setMonthFilter] = useState('All');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      months.add(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
    });
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [expenses]);

  const groupedExpenses = useMemo(() => {
    const groups: { [key: string]: { items: Expense[], total: number } } = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (monthFilter === 'All' || monthYear === monthFilter) {
        if (!groups[monthYear]) {
          groups[monthYear] = { items: [], total: 0 };
        }
        groups[monthYear].items.push(expense);
        groups[monthYear].total += expense.amountCents;
      }
    });
    return groups;
  }, [expenses, monthFilter]);

  return (
    <div className={`${styles.container} animate-fade-in`} style={{ animationDelay: '0.1s' }}>
      <div className={styles.tabNav}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'timeline' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'monthly' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly View
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'graphs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('graphs')}
        >
          Graphs
        </button>
      </div>

      <div className={styles.controls}>
        {activeTab !== 'graphs' && (
          <div className={styles.filtersSection}>
            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="categoryFilter">Category</label>
              <select
                id="categoryFilter"
                className={styles.select}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {activeTab === 'monthly' && (
              <div className={styles.filterGroup}>
                <label className={styles.label} htmlFor="monthFilter">Month</label>
                <select
                  id="monthFilter"
                  className={styles.select}
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                >
                  <option value="All">All Months</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.filterGroup}>
              <label className={styles.label} htmlFor="sortOrder">Sort</label>
              <select
                id="sortOrder"
                className={styles.select}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        <div className={`${styles.summary} ${activeTab === 'graphs' ? styles.summaryFullWidth : ''}`}>
          <span className={styles.summaryLabel}>Total Expenses</span>
          <span className={styles.summaryAmount}>{formatMoney(totalCents)}</span>
        </div>
      </div>

      {activeTab === 'graphs' && <ExpenseCharts expenses={expenses} />}

      {loading ? (
        <div className={styles.loaderContainer}>
          <Loader2 className="spinner" size={32} />
        </div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : expenses.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No expenses found. Add one above!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {activeTab === 'timeline' && (
            <div className={styles.timelineList}>
              {expenses.map((expense) => (
                <div key={expense.id} className={styles.expenseCard}>
                  <div className={styles.expenseInfo}>
                    <span className={styles.category}>{expense.category}</span>
                    <span className={styles.description}>
                      {expense.description || 'No description'}
                    </span>
                    <span className={styles.date}>{formatDate(expense.date)}</span>
                  </div>
                  <div className={styles.amountGroup}>
                    <div className={styles.amount}>
                      {formatMoney(expense.amountCents)}
                    </div>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      title="Delete expense"
                    >
                      {deletingId === expense.id ? (
                        <Loader2 size={18} className="spinner" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className={styles.monthlyList}>
              {Object.entries(groupedExpenses).map(([monthYear, group]) => (
                <div key={monthYear} className={styles.monthGroup}>
                  <div className={styles.monthHeaderRow}>
                    <h3 className={styles.monthHeader}>{monthYear}</h3>
                    <span className={styles.monthTotal}>Total: {formatMoney(group.total)}</span>
                  </div>
                  <div className={styles.expensesInMonth}>
                    {group.items.map((expense) => (
                      <div key={expense.id} className={styles.expenseCard}>
                        <div className={styles.expenseInfo}>
                          <span className={styles.category}>{expense.category}</span>
                          <span className={styles.description}>
                            {expense.description || 'No description'}
                          </span>
                          <span className={styles.date}>{formatDate(expense.date)}</span>
                        </div>
                        <div className={styles.amountGroup}>
                          <div className={styles.amount}>
                            {formatMoney(expense.amountCents)}
                          </div>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                            title="Delete expense"
                          >
                            {deletingId === expense.id ? (
                              <Loader2 size={18} className="spinner" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
