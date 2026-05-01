'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleExpenseAdded = () => {
    // Increment the trigger to force ExpenseList to re-fetch
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="container animate-fade-in">
      <header className="header" style={{ position: 'relative' }}>
        <button 
          onClick={toggleTheme} 
          style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: '0.5rem' }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <h1>Expense Tracker</h1>
        <p>Record, review, and analyze your personal finances effortlessly.</p>
      </header>

      <div className="dashboard-grid">
        <aside>
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </aside>
        
        <section>
          <ExpenseList refreshTrigger={refreshTrigger} />
        </section>
      </div>
    </main>
  );
}
