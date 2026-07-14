import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const tk = (n) => '৳' + (parseFloat(n) || 0).toLocaleString()

export default function FinanceReport({ toast }) {
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]
  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => { load() }, [from, to])

  async function load() {
    setLoading(true)
    try {
      const range = (q) => q.gte('date', from).lte('date', to)
      const [cp, ds, ex, vp, ctp, sp, cv] = await Promise.all([
        range(supabase.from('nd_client_payments').select('amount, date')),
        range(supabase.from('nd_design_sells').select('paid, date')),
        range(supabase.from('nd_expenses').select('amount, date')),
        range(supabase.from('nd_vendor_payments').select('amount, date')),
        range(supabase.from('nd_contractor_payments').select('amount, date')),
        range(supabase.from('nd_salary_payments').select('amount, date')),
        range(supabase.from('nd_conveyance').select('amount, date')),
      ])
      const sum = (res, k = 'amount') => (res.data || []).reduce((s, r) => s + (parseFloat(r[k]) || 0), 0)
      const income = [
        { label: 'Client Payments (Project)', value: sum(cp) },
        { label: 'Design Sell Received', value: sum(ds, 'paid') },
      ]
      const expense = [
        { label: 'Office Expenses', value: sum(ex) },
        { label: 'Vendor Payments', value: sum(vp) },
        { label: 'Contractor Payments', value: sum(ctp) },
        { label: 'Salary Payments', value: sum(sp) },
        { label: 'Conveyance', value: sum(cv) },
      ]
      const ti = income.reduce((s, r) => s + r.value, 0)
      const te = expense.reduce((s, r) => s + r.value, 0)
      setData({ income, expense, ti, te, profit: ti - te })
    } catch (e) {
      toast.error('Report failed: ' + (e.message || 'error'))
      setData(null)
    }
    setLoading(false)
  }

  return (
    <div className="block">
      <div className="block-header">
        <h3 className="block-title"><i className="fas fa-chart-line"></i> Cashbook / Profit Report</h3>
        <div className="flex gap-2" style={{ alignItems: 'center' }}>
          <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-muted">to</span>
          <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      <div className="block-content">
        {loading || !data ? <p className="text-muted" style={{ padding: 16 }}>Loading...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <h4 style={{ color: '#1a7a45', borderBottom: '2px solid #1a7a45', paddingBottom: 6 }}>Money In</h4>
              <table className="data-table">
                <tbody>
                  {data.income.map(r => <tr key={r.label}><td>{r.label}</td><td className="text-right">{tk(r.value)}</td></tr>)}
                  <tr style={{ fontWeight: 800 }}><td>Total Income</td><td className="text-right">{tk(data.ti)}</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 style={{ color: '#b03030', borderBottom: '2px solid #b03030', paddingBottom: 6 }}>Money Out</h4>
              <table className="data-table">
                <tbody>
                  {data.expense.map(r => <tr key={r.label}><td>{r.label}</td><td className="text-right">{tk(r.value)}</td></tr>)}
                  <tr style={{ fontWeight: 800 }}><td>Total Expense</td><td className="text-right">{tk(data.te)}</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '16px 20px', borderRadius: 10, background: data.profit >= 0 ? '#e8f5ee' : '#fdecec', display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
              <span>Net {data.profit >= 0 ? 'Profit' : 'Loss'} ({from} → {to})</span>
              <span style={{ color: data.profit >= 0 ? '#1a7a45' : '#b03030' }}>{tk(Math.abs(data.profit))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
