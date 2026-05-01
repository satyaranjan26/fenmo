'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import styles from './ExpenseList.module.css';

interface Expense {
  id: string;
  amountCents: number;
  category: string;
  date: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#0ea5e9', // Sky
  '#14b8a6', // Teal
];

export default function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      months.add(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
    });
    return Array.from(months).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [expenses]);

  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  useEffect(() => {
    if (selectedMonth !== 'All' && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0] || 'All');
    }
  }, [availableMonths, selectedMonth]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(exp => {
      const expMonth = new Date(exp.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (selectedMonth === 'All' || expMonth === selectedMonth) {
        map.set(exp.category, (map.get(exp.category) || 0) + (exp.amountCents / 100));
      }
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ 
        name, 
        value,
        formattedValue: `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` 
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, selectedMonth]);

  const monthData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      map.set(monthYear, (map.get(monthYear) || 0) + (exp.amountCents / 100));
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [expenses]);

  if (expenses.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '12px', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(8px)',
          zIndex: 100
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {label || payload[0].name}
          </p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent-color)' }}>
            ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
      
      {/* Monthly Expenses Bar Chart */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ marginBottom: '2rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>
          Monthly Spending Overview
        </h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthData} margin={{ top: 30, right: 20, left: 0, bottom: 20 }} style={{ outline: 'none' }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="name" 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-card-hover)', opacity: 0.4 }} />
              <Bar 
                dataKey="value" 
                fill="var(--accent-color)" 
                radius={[8, 8, 0, 0]} 
                barSize={45}
                activeBar={false}
                minPointSize={3}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(val: any) => `₹${Math.round(Number(val))}`} 
                  style={{ fill: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700 }} 
                  dy={-10} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Vertical List Chart */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        padding: '2rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Spending by Category</h3>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.select}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <option value="All">All Time</option>
            {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        
        <div style={{ height: Math.max(categoryData.length * 50 + 50, 300) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              layout="vertical" 
              data={categoryData} 
              margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
              style={{ outline: 'none' }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                stroke="var(--text-primary)" 
                fontSize={14} 
                tickLine={false} 
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-card-hover)', opacity: 0.4 }} />
              <Bar 
                dataKey="value" 
                radius={[0, 10, 10, 0]} 
                barSize={25}
                activeBar={false}
                minPointSize={3}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList 
                  dataKey="formattedValue" 
                  position="right" 
                  style={{ fill: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }} 
                  dx={15} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {categoryData.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
            No data for this month
          </p>
        )}
      </div>
    </div>
  );
}
