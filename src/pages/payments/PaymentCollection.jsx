import { useState, useEffect } from 'react'
import { clientsApi, projectsApi, paymentsApi, paymentMethodsApi, quotationsApi } from '../../lib/api'
import { formatCurrency, formatDate, generateInvoiceNo, downloadPDF } from '../../lib/pdf'
import logo from '/logo.jpg'

const DEMO_PAYMENTS = [
  { id: 1, receipt_no: 'RCP-2601-0011', date: '2026-01-15', nd_clients: { name: 'Mr.Safi', phone: '01700-000001' }, nd_projects: { project_name: "Safi's Residence" }, amount: 300000, nd_payment_methods: { name: 'bKash' }, note: '1st advance payment', created_at: '2026-01-15' },
  { id: 2, receipt_no: 'RCP-2602-0023', date: '2026-02-09', nd_clients: { name: 'Adv Imdadul Hoque Emon', phone: '01700-000002' }, nd_projects: { project_name: 'Emon Legal Counsel' }, amount: 75000, nd_payment_methods: { name: 'Cash' }, note: 'Advance', created_at: '2026-02-09' },
  { id: 3, receipt_no: 'RCP-2603-0034', date: '2026-03-04', nd_clients: { name: 'Mr.Zulfikar Haider', phone: '01700-000003' }, nd_projects: { project_name: 'Badshah Villa' }, amount: 500000, nd_payment_methods: { name: 'Bank Transfer' }, note: 'Progress payment 2', created_at: '2026-03-04' },
  { id: 4, receipt_no: 'RCP-2604-0047', date: '2026-04-16', nd_clients: { name: 'MS Akhlima Akter', phone: '01700-000004' }, nd_projects: { project_name: "Akhlima's Residence" }, amount: 300000, nd_payment_methods: { name: 'bKash' }, note: 'Advance payment', created_at: '2026-04-16' },
  { id: 5, receipt_no: 'RCP-2605-0058', date: '2026-05-06', nd_clients: { name: 'Mrs Sultana Parvin', phone: '01700-000005' }, nd_projects: { project_name: "Sultana's Residence" }, amount: 340000, nd_payment_methods: { name: 'Cash' }, note: '50% advance', created_at: '2026-05-06' },
  { id: 6, receipt_no: 'RCP-2606-0071', date: '2026-06-08', nd_clients: { name: 'Mr.Sanjay Kormomar', phone: '01700-000006' }, nd_projects: { project_name: "Sanjay's Residence" }, amount: 110000, nd_payment_methods: { name: 'Nagad' }, note: 'Final payment', created_at: '2026-06-08' },
]

export default function PaymentCollection({ onNavigate, toast }) {
  const [payments, setPayments] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [methods, setMethods] = useState([{ id: 1, name: 'Cash' }, { id: 2, name: 'Bank Transfer' }, { id: 3, name: 'bKash' }, { id: 4, name: 'Nagad' }])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [viewReceipt, setViewReceipt] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', amount: '', payment_method_id: '', note: '' })

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes, mRes] = await Promise.all([paymentsApi.getAll(), clientsApi.getAll(), paymentMethodsApi.getAll()])
        setPayments(pRes.data?.length ? pRes.data : DEMO_PAYMENTS)
        setClients(cRes.data || [])
        if (mRes.data?.length) setMethods(mRes.data)
      } catch { setPayments(DEMO_PAYMENTS) }
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

  const filtered = payments.filter(p =>
    p.receipt_no?.toLowerCase().includes(search.toLowerCase()) ||
    p.nd_clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.nd_projects?.project_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave() {
    if (!form.client_id) { toast.error('Select a client'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter valid amount'); return }
    setSaving(true)
    const rNo = generateInvoiceNo('RCP')
    const data = { receipt_no: rNo, ...form, amount: parseFloat(form.amount) }
    try {
      const { data: saved } = await paymentsApi.create(data)
      const newItem = {
        id: saved?.id || Date.now(),
        receipt_no: rNo,
        date: form.date,
        nd_clients: clients.find(c => String(c.id) === String(form.client_id)) || { name: 'Client' },
        nd_projects: projects.find(p => String(p.id) === String(form.project_id)),
        amount: parseFloat(form.amount),
        nd_payment_methods: methods.find(m => String(m.id) === String(form.payment_method_id)) || { name: 'Cash' },
        note: form.note,
        created_at: new Date().toISOString(),
      }
      setPayments(prev => [newItem, ...prev])
      toast.success(`Receipt ${rNo} saved!`)
      setViewReceipt(newItem)
      setShowForm(false)
      setForm({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', amount: '', payment_method_id: '', note: '' })
    } catch (e) {
      toast.error('Save failed, showing preview anyway')
    }
    setSaving(false)
  }

  async function handleDownload(item) {
    setDownloading(true)
    await downloadPDF('payment-receipt', `Receipt-${item.receipt_no}.pdf`)
    setDownloading(false)
  }

  const totalReceived = filtered.reduce((s, p) => s + (p.amount || 0), 0)

  return (
    <div>
      {/* Receipt View */}
      {viewReceipt && (
        <div>
          <div className="no-print flex gap-2 mb-4 items-center justify-between">
            <button className="btn btn-outline btn-sm" onClick={() => setViewReceipt(null)}><i className="fas fa-arrow-left"></i> Back to List</button>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fas fa-print"></i> Print</button>
              <button className="btn btn-pdf btn-sm" onClick={() => handleDownload(viewReceipt)} disabled={downloading}>
                {downloading ? <><i className="fas fa-spinner fa-spin"></i> PDF...</> : <><i className="fas fa-file-pdf"></i> Download PDF</>}
              </button>
            </div>
          </div>

          <div id="payment-receipt" className="inv-wrap" style={{ maxWidth: 600 }}>
            {/* Header */}
            <div className="inv-header">
              <div className="inv-logo">
                <img src={logo} alt="Nirman Dhara" style={{ width: 55, height: 55 }} />
                <div className="inv-company">
                  <h1 style={{ fontSize: 16 }}>nirmandhara</h1>
                  <p>DESIGN YOUR DREAM</p>
                  <p>📞 +8801620144641</p>
                  <p>✉ nirmandhara@gmail.com</p>
                </div>
              </div>
              <div className="inv-meta">
                <h2 style={{ color: '#198754' }}>RECEIPT</h2>
                <p><strong>No:</strong> {viewReceipt.receipt_no}</p>
                <p><strong>Date:</strong> {formatDate(viewReceipt.date)}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="inv-party" style={{ marginBottom: 20 }}>
              <h4>Received From</h4>
              <p>{viewReceipt.nd_clients?.name}</p>
              <span>{viewReceipt.nd_clients?.phone}</span>
              {viewReceipt.nd_projects && <><br /><span>Project: <strong>{viewReceipt.nd_projects.project_name}</strong></span></>}
            </div>

            {/* Amount Box */}
            <div style={{ background: '#f0fdf4', border: '2px solid #198754', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: '#166534', marginBottom: 8, fontWeight: 600 }}>AMOUNT RECEIVED</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#198754' }}>৳ {formatCurrency(viewReceipt.amount)}</div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 6 }}>
                via {viewReceipt.nd_payment_methods?.name || 'Cash'}
              </div>
            </div>

            {/* Note */}
            {viewReceipt.note && (
              <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 6, marginBottom: 20, fontSize: 13 }}>
                <strong>Note:</strong> {viewReceipt.note}
              </div>
            )}

            {/* Signatures */}
            <div className="inv-sign">
              <div className="inv-sign-box"><div className="inv-sign-line">Client Signature</div></div>
              <div className="inv-sign-box"><div className="inv-sign-line">Received By — Nirmandhara</div></div>
            </div>

            <div className="inv-watermark">
              This is an official payment receipt. Keep this for your records.<br />
              Nirmandhara — Design Your Dream | nirmandhara@gmail.com
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {!viewReceipt && (
        <div>
          <div className="block">
            <div className="block-header">
              <h3 className="block-title"><i className="fas fa-money-bill-wave" style={{ color: '#198754', marginRight: 8 }}></i>Payment Collection</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                <i className={`fas fa-${showForm ? 'times' : 'plus'}`}></i> {showForm ? 'Cancel' : 'Add Payment'}
              </button>
            </div>

            {/* Add Payment Form */}
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
                    <label className="form-label">Amount (৳) <span className="required">*</span></label>
                    <input type="number" className="form-control" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" />
                  </div>
                  <div className="form-col">
                    <label className="form-label">Payment Method</label>
                    <select className="form-control" value={form.payment_method_id} onChange={e => setForm({ ...form, payment_method_id: e.target.value })}>
                      <option value="">Select Method</option>
                      {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-col">
                    <label className="form-label">Note</label>
                    <input className="form-control" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Payment note..." />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save &amp; Generate Receipt</>}
                  </button>
                </div>
              </div>
            )}

            <div className="block-content">
              {/* Summary */}
              <div className="grid-3 mb-4">
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Received</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#198754' }}>৳{formatCurrency(totalReceived)}</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total Transactions</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af' }}>{filtered.length}</div>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#9a3412', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Average Payment</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>৳{formatCurrency(filtered.length ? totalReceived / filtered.length : 0)}</div>
                </div>
              </div>

              <div className="search-bar">
                <input className="search-input" placeholder="Search by receipt no, client, project..." value={search} onChange={e => setSearch(e.target.value)} />
                <span className="text-muted">{filtered.length} records</span>
              </div>

              {loading ? (
                <div className="text-center" style={{ padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--accent)' }}></i></div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Receipt No</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Project</th>
                        <th>Amount (৳)</th>
                        <th>Method</th>
                        <th>Note</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={9} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No payments found</td></tr>
                      ) : filtered.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td><strong style={{ color: '#198754' }}>{p.receipt_no}</strong></td>
                          <td>{formatDate(p.date)}</td>
                          <td>{p.nd_clients?.name || '-'}</td>
                          <td>{p.nd_projects?.project_name || '-'}</td>
                          <td className="text-right"><strong>৳ {formatCurrency(p.amount)}</strong></td>
                          <td><span className="badge badge-info">{p.nd_payment_methods?.name || '-'}</span></td>
                          <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.note || '-'}</td>
                          <td>
                            <div className="actions">
                              <button className="btn btn-info btn-xs" onClick={() => setViewReceipt(p)} title="View Receipt"><i className="fas fa-eye"></i></button>
                              <button className="btn btn-pdf btn-xs" onClick={() => { setViewReceipt(p); setTimeout(() => handleDownload(p), 300) }} title="Download PDF"><i className="fas fa-file-pdf"></i></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
                        <td colSpan={5} className="text-right">Total Received:</td>
                        <td className="text-right" style={{ color: '#198754' }}>৳ {formatCurrency(totalReceived)}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
