import { useState, useEffect } from 'react'
import { clientsApi, projectsApi, designSellsApi } from '../../lib/api'
import { formatCurrency, formatDate, generateInvoiceNo, downloadPDF } from '../../lib/pdf'
import logo from '/logo.jpg'

const DEMO = [
  { id: 1, invoice_no: 'DS-2601-0011', date: '2026-01-10', nd_clients: { name: 'Mr.Safi', phone: '01700-000001' }, nd_projects: { project_name: "Safi's Residence" }, amount: 80000, paid: 80000, due: 0, status: 'Paid' },
  { id: 2, invoice_no: 'DS-2602-0022', date: '2026-02-14', nd_clients: { name: 'Mrs Sultana Parvin', phone: '01700-000002' }, nd_projects: { project_name: "Sultana's Residence" }, amount: 30000, paid: 30000, due: 0, status: 'Paid' },
  { id: 3, invoice_no: 'DS-2603-0033', date: '2026-03-01', nd_clients: { name: 'MS Akhlima Akter', phone: '01700-000003' }, nd_projects: { project_name: "Akhlima's Residence" }, amount: 80000, paid: 50000, due: 30000, status: 'Partial' },
  { id: 4, invoice_no: 'DS-2605-0044', date: '2026-05-19', nd_clients: { name: 'Mrs. Fatima Tuj Johra', phone: '01700-000004' }, nd_projects: { project_name: "Fatima's Residence" }, amount: 88000, paid: 0, due: 88000, status: 'Unpaid' },
]

export default function DesignSellList({ onNavigate, toast }) {
  const [list, setList] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', amount: '', paid: '', description: '', status: 'Unpaid' })

  useEffect(() => {
    async function load() {
      try {
        const [dRes, cRes] = await Promise.all([designSellsApi.getAll(), clientsApi.getAll()])
        setList(dRes.data?.length ? dRes.data : DEMO)
        setClients(cRes.data || [])
      } catch { setList(DEMO) }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (form.client_id) {
      projectsApi.getAll().then(res => {
        setProjects((res.data || []).filter(p => String(p.client_id) === String(form.client_id)))
      }).catch(() => {})
    }
  }, [form.client_id])

  useEffect(() => {
    const amt = parseFloat(form.amount) || 0
    const paid = parseFloat(form.paid) || 0
    const due = amt - paid
    const status = due <= 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
    setForm(f => ({ ...f, status }))
  }, [form.amount, form.paid])

  const filtered = list.filter(d =>
    d.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
    d.nd_clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.nd_projects?.project_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave() {
    if (!form.client_id) { toast.error('Select a client'); return }
    if (!form.amount) { toast.error('Enter amount'); return }
    setSaving(true)
    const invNo = generateInvoiceNo('DS')
    const amt = parseFloat(form.amount) || 0
    const paid = parseFloat(form.paid) || 0
    const due = amt - paid
    const data = { invoice_no: invNo, ...form, amount: amt, paid, due }
    try {
      const { data: saved } = await designSellsApi.create(data)
      const newItem = {
        id: saved?.id || Date.now(),
        invoice_no: invNo,
        date: form.date,
        nd_clients: clients.find(c => String(c.id) === String(form.client_id)) || { name: 'Client' },
        nd_projects: projects.find(p => String(p.id) === String(form.project_id)),
        amount: amt, paid, due, status: form.status,
      }
      setList(prev => [newItem, ...prev])
      toast.success(`Design Invoice ${invNo} saved!`)
      setViewItem(newItem)
      setShowForm(false)
      setForm({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', amount: '', paid: '', description: '', status: 'Unpaid' })
    } catch {
      toast.error('Save failed')
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return
    try { await designSellsApi.delete(id) } catch {}
    setList(prev => prev.filter(d => d.id !== id))
    toast.success('Deleted')
  }

  const statusBadge = (s) => {
    const map = { Paid: 'badge-success', Partial: 'badge-warning', Unpaid: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  if (viewItem) {
    return (
      <div>
        <div className="no-print flex gap-2 mb-4 items-center justify-between">
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setViewItem(null)}><i className="fas fa-arrow-left"></i> Back</button>
            <button className="btn btn-success btn-sm" onClick={() => { setViewItem(null); setShowForm(true) }}><i className="fas fa-plus"></i> New</button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fas fa-print"></i> Print</button>
            <button className="btn btn-pdf btn-sm" onClick={async () => { setDownloading(true); await downloadPDF('design-invoice', `DS-${viewItem.invoice_no}.pdf`); setDownloading(false) }} disabled={downloading}>
              {downloading ? <><i className="fas fa-spinner fa-spin"></i> PDF...</> : <><i className="fas fa-file-pdf"></i> Download PDF</>}
            </button>
          </div>
        </div>

        <div id="design-invoice" className="inv-wrap" style={{ maxWidth: 680 }}>
          <div className="inv-header">
            <div className="inv-logo">
              <img src={logo} alt="Nirman Dhara" />
              <div className="inv-company">
                <h1>nirmandhara</h1>
                <p>DESIGN YOUR DREAM</p>
                <p>📞 +8801620144641 | ✉ nirmandhara@gmail.com</p>
              </div>
            </div>
            <div className="inv-meta">
              <h2>DESIGN INVOICE</h2>
              <p><strong>No:</strong> {viewItem.invoice_no}</p>
              <p><strong>Date:</strong> {formatDate(viewItem.date)}</p>
              <p><strong>Status:</strong> <span style={{ fontWeight: 700, color: viewItem.status === 'Paid' ? '#198754' : viewItem.status === 'Partial' ? '#e67e00' : '#dc3545' }}>{viewItem.status}</span></p>
            </div>
          </div>

          <div className="inv-parties">
            <div className="inv-party">
              <h4>Client</h4>
              <p>{viewItem.nd_clients?.name}</p>
              <span>{viewItem.nd_clients?.phone}</span>
            </div>
            <div className="inv-party">
              <h4>Project</h4>
              <p>{viewItem.nd_projects?.project_name || 'As Discussed'}</p>
            </div>
          </div>

          <table className="inv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th style={{ width: 150 }}>Amount (৳)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Design Services</strong>
                  {viewItem.description && <><br /><span style={{ fontSize: 11, color: '#6b7280' }}>{viewItem.description}</span></>}
                </td>
                <td className="text-right"><strong>৳ {formatCurrency(viewItem.amount)}</strong></td>
              </tr>
            </tbody>
          </table>

          <div className="inv-totals">
            <table>
              <tbody>
                <tr><td>Total Amount</td><td className="text-right">৳ {formatCurrency(viewItem.amount)}</td></tr>
                <tr><td>Amount Paid</td><td className="text-right" style={{ color: '#198754' }}>৳ {formatCurrency(viewItem.paid)}</td></tr>
              </tbody>
              <tfoot>
                <tr className="grand-total" style={{ background: viewItem.due > 0 ? '#dc3545' : '#198754' }}>
                  <td>AMOUNT DUE</td>
                  <td className="text-right">৳ {formatCurrency(viewItem.due)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="inv-sign">
            <div className="inv-sign-box"><div className="inv-sign-line">Client Signature & Date</div></div>
            <div className="inv-sign-box"><div className="inv-sign-line">Authorized — Nirmandhara</div></div>
          </div>
          <div className="inv-watermark">Nirmandhara — Design Your Dream | nirmandhara@gmail.com | +8801620144641</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className="fas fa-drafting-compass" style={{ color: 'var(--accent)', marginRight: 8 }}></i>Design Invoice List</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i> {showForm ? 'Cancel' : 'Add Invoice'}
          </button>
        </div>

        {showForm && (
          <div className="block-content" style={{ borderBottom: '1px solid var(--border)', background: '#fafbfd' }}>
            <div className="form-row">
              <div className="form-col">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-col">
                <label className="form-label">Client <span className="required">*</span></label>
                <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value, project_id: '' })}>
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-col">
                <label className="form-label">Project</label>
                <select className="form-control" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                </select>
              </div>
              <div className="form-col">
                <label className="form-label">Total Amount (৳) <span className="required">*</span></label>
                <input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-col">
                <label className="form-label">Amount Paid (৳)</label>
                <input type="number" className="form-control" value={form.paid} onChange={e => setForm({ ...form, paid: e.target.value })} placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Design service details..." />
            </div>
            <div className="flex justify-end gap-2">
              <span style={{ background: form.status === 'Paid' ? '#d1fae5' : form.status === 'Partial' ? '#fef3c7' : '#fee2e2', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                Status: {form.status} | Due: ৳{formatCurrency((parseFloat(form.amount) || 0) - (parseFloat(form.paid) || 0))}
              </span>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Invoice</>}
              </button>
            </div>
          </div>
        )}

        <div className="block-content">
          <div className="search-bar">
            <input className="search-input" placeholder="Search by invoice no, client, project..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted">{filtered.length} invoices</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Amount (৳)</th>
                  <th>Paid (৳)</th>
                  <th>Due (৳)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td><strong style={{ color: 'var(--accent)' }}>{d.invoice_no}</strong></td>
                    <td>{formatDate(d.date)}</td>
                    <td>{d.nd_clients?.name || '-'}</td>
                    <td>{d.nd_projects?.project_name || '-'}</td>
                    <td className="text-right">{formatCurrency(d.amount)}</td>
                    <td className="text-right" style={{ color: '#198754' }}>{formatCurrency(d.paid)}</td>
                    <td className="text-right" style={{ color: d.due > 0 ? '#dc3545' : '#198754' }}><strong>{formatCurrency(d.due)}</strong></td>
                    <td>{statusBadge(d.status)}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-info btn-xs" onClick={() => setViewItem(d)}><i className="fas fa-eye"></i></button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(d.id)}><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, background: '#f8f9fa' }}>
                  <td colSpan={5} className="text-right">Totals:</td>
                  <td className="text-right">৳{formatCurrency(filtered.reduce((s, d) => s + (d.amount || 0), 0))}</td>
                  <td className="text-right" style={{ color: '#198754' }}>৳{formatCurrency(filtered.reduce((s, d) => s + (d.paid || 0), 0))}</td>
                  <td className="text-right" style={{ color: '#dc3545' }}>৳{formatCurrency(filtered.reduce((s, d) => s + (d.due || 0), 0))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
