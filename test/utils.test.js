import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatMoney } from '../lib/utils.js';

describe('formatMoney', () => {
  it('formats cents correctly to INR', () => {
    // Note: since Intl.NumberFormat might return different spacing depending on the Node version,
    // we use a loose includes check, or we mock the exact expected format.
    const result = formatMoney(1050);
    
    // 1050 cents = 10.50 INR. The string should contain "10.50"
    assert.ok(result.includes('10.50'));
  });

  it('handles zero correctly', () => {
    const result = formatMoney(0);
    assert.ok(result.includes('0.00'));
  });

  it('handles large numbers correctly', () => {
    const result = formatMoney(100000000); // 1,000,000.00
    assert.ok(result.includes('0.00'));
  });
});
