import { useState, useEffect } from 'react'
import { quotationsApi } from '../../lib/api'
import { formatCurrency, formatDate, downloadPDF } from '../../lib/pdf'
import logo from '/logo.jpg'

const DEMO = [
  { id: 1, quotation_no: 'BOQ-2601-1021', date: '2026-01-15', nd_clients: { name: 'Mr.Safi', phone: '01700-000001' }, nd_projects: { project_name: "Safi's Residence" }, grand_total: 1610350, status: 'Approved' },
  { id: 2, quotation_no: 'BOQ-2602-3847', date: '2026-02-05', nd_clients: { name: 'Adv Imdadul Hoque Emon', phone: '01700-000002' }, nd_projects: { project_name: 'Emon Legal Counsel' }, grand_total: 125000, status: 'Approved' },
  { id: 3, quotation_no: 'BOQ-2603-2291', date: '2026-03-17', nd_clients: { name: 'Mr.Sanjay Kormomar', phone: '01700-000003' }, nd_projects: { project_name: "Sanjay's Residence" }, grand_total: 121500, status: 'Draft' },
  { id: 4, quotation_no: 'BOQ-2604-5511', date: '2026-04-16', nd_clients: { name: 'Mr.Safi', phone: '01700-000001' }, nd_projects: { project_name: "Safi's Residence Phase 2" }, grand_total: 900000, status: 'Sent' },
  { id: 5, quotation_no: 'BOQ-2605-8823', date: '2026-05-06', nd_clients: { name: 'Mrs Sultana Parvin', phone: '01700-000004' }, nd_projects: { project_name: "Sultana's Residence" }, grand_total: 600000, status: 'Approved' },
  { id: 6, quotation_no: 'BOQ-2605-9934', date: '2026-05-19', nd_clients: { name: 'MS Akhlima Akter', phone: '01700-000005' }, nd_projects: { project_name: "Akhlima's Residence" }, grand_total: 1601850, status: 'Draft' },
  { id: 7, quotation_no: 'BOQ-2606-1147', date: '2026-06-15', nd_clients: { name: 'Ms Sultana', phone: '01700-000006' }, nd_projects: null, grand_total: 22000, status: 'Draft' },
]

const DEMO_ITEMS = [
  { product_name: 'False Ceiling', description: 'Gypsum board false ceiling with lighting provision', qty: 320, unit: 'SQFT', unit_price: 180, total: 57600 },
  { product_name: 'Wall Paneling Works', description: 'Wooden wall paneling with veneer finish', qty: 150, unit: 'SQFT', unit_price: 320, total: 48000 },
  { product_name: 'Kitchen Cabinet', description: 'Modular kitchen with upper and lower cabinets', qty: 1, unit: 'Job', unit_price: 180000, total: 180000 },
  { product_name: 'TV Cabinet', description: 'Built-in TV unit with display shelves', qty: 1, unit: 'Nos', unit_price: 45000, total: 45000 },
  { product_name: 'Dressing Unit', description: 'Full-length mirror dressing unit', qty: 1, unit: 'Nos', unit_price: 38000, total: 38000 },
  { product_name: 'Wallpaper', description: 'Premium imported wallpaper installation', qty: 80, unit: 'SQFT', unit_price: 95, total: 7600 },
]

export default function BOQList({ onNavigate, toast }) {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewItem, setViewItem] = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await quotationsApi.getAll()
        setList(data?.length ? data : DEMO)
      } catch { setList(DEMO) }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = list.filter(q =>
    q.quotation_no?.toLowerCase().includes(search.toLowerCase()) ||
    q.nd_clients?.name?.toLowerCase().includes(search.toLowerCase()) ||
    q.nd_projects?.project_name?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleView(q) {
    try {
      const { data } = await quotationsApi.getItems(q.id)
      setViewItems(data?.length ? data : DEMO_ITEMS)
    } catch { setViewItems(DEMO_ITEMS) }
    setViewItem(q)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quotation?')) return
    try { await quotationsApi.delete(id) } catch {}
    setList(prev => prev.filter(q => q.id !== id))
    toast.success('Quotation deleted')
  }

  async function handleDownload() {
    setDownloading(true)
    await downloadPDF('boq-view-invoice', `BOQ-${viewItem.quotation_no}.pdf`)
    setDownloading(false)
  }

  const statusBadge = (s) => {
    const map = { Draft: 'badge-secondary', Sent: 'badge-info', Approved: 'badge-success', Rejected: 'badge-danger' }
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>
  }

  if (viewItem) {
    const subtotal = viewItems.reduce((s, r) => s + (r.total || 0), 0)
    return (
      <div>
        <div className="no-print flex gap-2 mb-4 items-center justify-between">
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setViewItem(null)}><i className="fas fa-arrow-left"></i> Back to List</button>
            <button className="btn btn-success btn-sm" onClick={() => onNavigate('boq-add')}><i className="fas fa-plus"></i> New BOQ</button>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fas fa-print"></i> Print</button>
            <button className="btn btn-pdf btn-sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? <><i className="fas fa-spinner fa-spin"></i> PDF...</> : <><i className="fas fa-file-pdf"></i> Download PDF</>}
            </button>
          </div>
        </div>

        <div id="boq-view-invoice" className="inv-wrap">
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
              <h2>QUOTATION</h2>
              <p><strong>No:</strong> {viewItem.quotation_no}</p>
              <p><strong>Date:</strong> {formatDate(viewItem.date)}</p>
              <p><strong>Status:</strong> <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{viewItem.status}</span></p>
            </div>
          </div>

          <div className="inv-parties">
            <div className="inv-party">
              <h4>Prepared For</h4>
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
                <th style={{ width: 35 }}>#</th>
                <th>Item / Description</th>
                <th style={{ width: 70 }}>Unit</th>
                <th style={{ width: 55 }}>Qty</th>
                <th style={{ width: 110 }}>Unit Price (৳)</th>
                <th style={{ width: 120 }}>Total (৳)</th>
              </tr>
            </thead>
            <tbody>
              {viewItems.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <strong>{r.product_name}</strong>
                    {r.description && <><br /><span style={{ fontSize: 11, color: '#6b7280' }}>{r.description}</span></>}
                  </td>
                  <td>{r.unit}</td>
                  <td>{r.qty}</td>
                  <td className="text-right">{formatCurrency(r.unit_price)}</td>
                  <td className="text-right"><strong>{formatCurrency(r.total)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <table>
              <tbody>
                <tr><td>Subtotal</td><td className="text-right">৳ {formatCurrency(subtotal)}</td></tr>
                {viewItem.discount_value > 0 && <tr><td>Discount</td><td className="text-right" style={{ color: '#dc3545' }}>- ৳ {formatCurrency(viewItem.discount_value)}</td></tr>}
                {viewItem.service_charge > 0 && <tr><td>Service Charge</td><td className="text-right">+ ৳ {formatCurrency(viewItem.service_charge)}</td></tr>}
                {viewItem.vat_pct > 0 && <tr><td>VAT ({viewItem.vat_pct}%)</td><td className="text-right">৳ {formatCurrency(subtotal * viewItem.vat_pct / 100)}</td></tr>}
                {viewItem.ait_pct > 0 && <tr><td>AIT ({viewItem.ait_pct}%)</td><td className="text-right">৳ {formatCurrency(subtotal * viewItem.ait_pct / 100)}</td></tr>}
              </tbody>
              <tfoot>
                <tr className="grand-total">
                  <td>GRAND TOTAL</td>
                  <td className="text-right">৳ {formatCurrency(viewItem.grand_total || subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {viewItem.terms_condition && (
            <div className="inv-terms">
              <h4>Terms & Conditions</h4>
              <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: 11 }}>{viewItem.terms_condition}</pre>
            </div>
          )}

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
          <h3 className="block-title"><i className="fas fa-file-invoice" style={{ color: 'var(--accent)', marginRight: 8 }}></i>B.O.Q / Quotation List</h3>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('boq-add')}>
            <i className="fas fa-plus"></i> Add B.O.Q
          </button>
        </div>
        <div className="block-content">
          <div className="search-bar">
            <input className="search-input" placeholder="Search by quotation no, client, project..." value={search} onChange={e => setSearch(e.target.value)} />
            <span className="text-muted">{filtered.length} quotations</span>
          </div>
          {loading ? (
            <div className="text-center" style={{ padding: 40 }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--accent)' }}></i></div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Quotation No</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Grand Total (৳)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center" style={{ padding: 40, color: 'var(--text-muted)' }}>No quotations found</td></tr>
                  ) : filtered.map((q, i) => (
                    <tr key={q.id}>
                      <td>{i + 1}</td>
                      <td><strong style={{ color: 'var(--accent)' }}>{q.quotation_no}</strong></td>
                      <td>{formatDate(q.date)}</td>
                      <td>{q.nd_clients?.name || '-'}</td>
                      <td>{q.nd_projects?.project_name || '-'}</td>
                      <td className="text-right"><strong>৳ {formatCurrency(q.grand_total)}</strong></td>
                      <td>{statusBadge(q.status)}</td>
                      <td>
                        <div className="actions">
                          <button className="btn btn-info btn-xs" onClick={() => handleView(q)} title="View & Download"><i className="fas fa-eye"></i></button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(q.id)} title="Delete"><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8f9fa', fontWeight: 700 }}>
                    <td colSpan={5} className="text-right">Total:</td>
                    <td className="text-right">৳ {formatCurrency(filtered.reduce((s, q) => s + (q.grand_total || 0), 0))}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
