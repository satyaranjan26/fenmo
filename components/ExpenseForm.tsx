'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import styles from './ExpenseForm.module.css';

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Housing',
  'Other',
];

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export default function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Generate idempotency key for this submission attempt
    const idempotencyKey = crypto.randomUUID();

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          category,
          description,
          date,
          idempotencyKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add expense');
      }

      setSuccess('Expense added successfully!');
      setAmount('');
      setDescription('');
      // Keep category and date as they were
      
      onExpenseAdded();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.card} animate-fade-in`}>
      <h2 className={styles.title}>
        <PlusCircle size={20} className="text-accent" />
        Record an Expense
      </h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            className={styles.input}
            placeholder="e.g. 150.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="category">Category</label>
          <select
            id="category"
            required
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            required
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="description">Description (Optional)</label>
          <input
            id="description"
            type="text"
            className={styles.input}
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={100}
          />
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="spinner" size={18} />
              Adding...
            </>
          ) : (
            'Add Expense'
          )}
        </button>
      </form>
    </div>
  );
}
