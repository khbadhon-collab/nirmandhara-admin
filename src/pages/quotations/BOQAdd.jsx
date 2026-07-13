import { useState, useEffect, useRef } from 'react'
import { clientsApi, projectsApi, categoriesApi, productsApi, unitsApi, quotationsApi } from '../../lib/api'
import { formatCurrency, formatDate, generateInvoiceNo, downloadPDF } from '../../lib/pdf'
import logo from '/logo.jpg'

const DEFAULT_TERMS = `Terms & Conditions & Payment Schedule

Payment Schedule:
1. Advance Payment: 50% advance payment is required before commencing any work.
2. Progress Payment 1: 20% payment required 2 weeks after work starts.
3. Progress Payment 2: 25% payment required 5 weeks after work starts.
4. Progress Payment 3: 5% payment before start of color work.
5. Final Payment: Remaining 5% due upon full project completion and before handover.

Important: Full payment must be made before project completion.

Execution Timeline:
- Project completed within 60 (sixty) working days from material delivery date.
- Timeline may vary due to weather, supplier, or labor availability.

General Terms:
- Prices quoted EXCLUDE VAT and TAX.
- All payments by account payee cheque to "Nirmandhara" or cash.
- 1-year hardware replacement guarantee and 1-year service warranty from handover.

Communication:
WhatsApp: +8801620144641
Email: nirmandhara@gmail.com
Office Hours: 11:00 AM – 6:00 PM (Saturday–Thursday)`

const DEMO_CLIENTS = [
  { id: 12, name: 'Atikur Rahman' }, { id: 14, name: 'Ms Sanzida' },
  { id: 16, name: 'Mr.Sabbir' }, { id: 44, name: 'Md Rakib Hasan' },
  { id: 46, name: 'Mrs. Rabiya Akter' }, { id: 52, name: 'Mr.Naymur Rahman' },
  { id: 64, name: 'Mr.Sanjay Kormomar' }, { id: 67, name: 'Mr.Zulfikar Haider' },
  { id: 70, name: 'Mr.Safi' }, { id: 75, name: 'Mrs. Fatima Tuj Johra' },
  { id: 84, name: 'Mrs Sultana Parvin' }, { id: 86, name: 'Ms Sultana' },
]
const DEMO_CATS = [
  { id: 1, name: 'Interior Decoration' }, { id: 2, name: '3D Design' },
  { id: 3, name: 'Interior Products' }, { id: 5, name: '2D Design' },
  { id: 31, name: 'Master Bed' }, { id: 37, name: 'Drawing Room' },
  { id: 38, name: 'Dining Room' }, { id: 42, name: 'Kitchen' },
  { id: 43, name: 'Bathroom' }, { id: 47, name: 'Dry-Kitchen' },
  { id: 48, name: 'Wet-Kitchen' }, { id: 45, name: 'Labor' },
]
const DEMO_PRODUCTS = [
  { id: 4, name: 'Wall Paneling', price: 0 }, { id: 5, name: 'False Ceiling', price: 0 },
  { id: 6, name: 'Wall Cabinet', price: 0 }, { id: 7, name: 'TV Cabinet', price: 0 },
  { id: 9, name: 'Kitchen Cabinet', price: 0 }, { id: 10, name: 'Cloth Cabinet', price: 0 },
  { id: 11, name: 'Dressing Unit', price: 0 }, { id: 15, name: 'Paint Works', price: 0 },
  { id: 19, name: 'Design & Consultancy', price: 0 }, { id: 21, name: '2D Design', price: 0 },
  { id: 25, name: '3D Design', price: 0 }, { id: 30, name: 'Drop Ceiling', price: 0 },
  { id: 67, name: 'Wall Paneling Works', price: 0 }, { id: 70, name: 'Dressing Unit', price: 0 },
  { id: 81, name: 'Wallpaper', price: 0 }, { id: 3, name: 'Shelve', price: 0 },
]
const DEMO_UNITS = [
  { id: 6, name: 'SQFT' }, { id: 3, name: 'Nos' }, { id: 2, name: 'pcs' },
  { id: 5, name: 'Job' }, { id: 7, name: 'Taka' },
]

export default function BOQAdd({ onNavigate, toast }) {
  const [clients, setClients] = useState(DEMO_CLIENTS)
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState(DEMO_CATS)
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [units, setUnits] = useState(DEMO_UNITS)
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', category_id: '', product_id: '', unit_id: '' })
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, service: 0, vat: 0, ait: 0, grand: 0 })
  const [discountType, setDiscountType] = useState('')
  const [discountVal, setDiscountVal] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [serviceVal, setServiceVal] = useState('')
  const [vatPct, setVatPct] = useState('')
  const [aitPct, setAitPct] = useState('')
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('product')
  const [newProd, setNewProd] = useState({ name: '', code: '', price: '', description: '' })
  const [newCat, setNewCat] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [viewInvoice, setViewInvoice] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedQuotation, setSavedQuotation] = useState(null)
  const invoiceRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const [cRes, catRes, pRes, uRes] = await Promise.all([
          clientsApi.getAll(), categoriesApi.getAll(), productsApi.getAll(), unitsApi.getAll()
        ])
        if (cRes.data?.length) setClients(cRes.data)
        if (catRes.data?.length) setCategories(catRes.data)
        if (pRes.data?.length) setProducts(pRes.data)
        if (uRes.data?.length) setUnits(uRes.data)
      } catch {}
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

  useEffect(() => { calcTotals() }, [rows, discountType, discountVal, serviceType, serviceVal, vatPct, aitPct])

  function calcTotals() {
    const sub = rows.reduce((s, r) => s + (parseFloat(r.total) || 0), 0)
    let disc = 0
    if (discountType === 'flat') disc = parseFloat(discountVal) || 0
    else if (discountType === 'percentage') disc = sub * ((parseFloat(discountVal) || 0) / 100)
    let svc = 0
    if (serviceType === 'flat') svc = parseFloat(serviceVal) || 0
    else if (serviceType === 'percentage') svc = sub * ((parseFloat(serviceVal) || 0) / 100)
    const afterDisc = sub - disc + svc
    const vat = afterDisc * ((parseFloat(vatPct) || 0) / 100)
    const ait = afterDisc * ((parseFloat(aitPct) || 0) / 100)
    setTotals({ subtotal: sub, discount: disc, service: svc, vat, ait, grand: afterDisc + vat + ait })
  }

  function addRow() {
    if (!form.date) { toast.error('Date is required'); return }
    if (!form.client_id) { toast.error('Select a client'); return }
    if (!form.category_id) { toast.error('Select a category'); return }
    if (!form.product_id) { toast.error('Select a product'); return }
    if (form.product_id === 'new') { setShowModal(true); return }
    const prod = products.find(p => String(p.id) === String(form.product_id))
    const unit = units.find(u => String(u.id) === String(form.unit_id))
    const cat = categories.find(c => String(c.id) === String(form.category_id))
    const newRow = {
      id: Date.now(),
      category_id: form.category_id,
      category_name: cat?.name || '',
      product_id: form.product_id,
      product_name: prod?.name || '',
      description: prod?.description || '',
      unit_price: prod?.price || 0,
      qty: 1,
      unit: unit?.name || '',
      total: prod?.price || 0,
    }
    setRows(prev => [newRow, ...prev])
  }

  function updateRow(id, field, val) {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r
      const updated = { ...r, [field]: val }
      updated.total = (parseFloat(updated.unit_price) || 0) * (parseFloat(updated.qty) || 0)
      return updated
    }))
  }

  function removeRow(id) { setRows(prev => prev.filter(r => r.id !== id)) }

  async function handleSave() {
    if (!form.client_id) { toast.error('Select a client'); return }
    if (rows.length === 0) { toast.error('Add at least one item'); return }
    setSaving(true)
    const qNo = generateInvoiceNo('BOQ')
    const qData = {
      quotation_no: qNo,
      date: form.date,
      client_id: form.client_id,
      project_id: form.project_id || null,
      subtotal: totals.subtotal,
      discount_type: discountType,
      discount_value: totals.discount,
      service_charge_type: serviceType,
      service_charge: totals.service,
      vat_pct: parseFloat(vatPct) || 0,
      ait_pct: parseFloat(aitPct) || 0,
      grand_total: totals.grand,
      terms_condition: terms,
      status: 'Draft',
    }
    const { data: q, error: qErr } = await quotationsApi.create(qData)
    if (qErr) { toast.error('Save failed: ' + qErr.message); setSaving(false); return }
    // Only send columns that exist in the database table
    const items = rows.map((r, i) => ({
      quotation_id: q.id,
      category_id: /^\d+$/.test(String(r.category_id)) ? r.category_id : null,
      product_id: /^\d+$/.test(String(r.product_id)) ? r.product_id : null,
      product_name: r.product_name,
      description: r.description,
      unit_price: parseFloat(r.unit_price) || 0,
      qty: parseFloat(r.qty) || 1,
      unit: r.unit,
      total: parseFloat(r.total) || 0,
      sort_order: i,
    }))
    const { error: iErr } = await quotationsApi.createItems(items)
    if (iErr) {
      await quotationsApi.delete(q.id)
      toast.error('Save failed: ' + iErr.message)
      setSaving(false)
      return
    }
    setSavedQuotation({ ...qData, id: q.id, quotation_no: qNo })
    toast.success(`Quotation ${qNo} saved!`)
    setSaving(false)
    setViewInvoice(true)
  }

  async function handleNewProduct() {
    if (!newProd.name.trim()) { toast.error('Product name required'); return }
    const payload = { name: newProd.name, price: parseFloat(newProd.price) || 0, description: newProd.description, category_id: /^\d+$/.test(String(form.category_id)) ? form.category_id : null }
    const { data: saved, error } = await productsApi.create(payload)
    if (error) { toast.error('Could not save product: ' + error.message); return }
    const item = saved
    setProducts(prev => [...prev, item])
    setForm(f => ({ ...f, product_id: item.id }))
    productsApi.create({ name: newProd.name, product_code: newProd.code, price: item.price, description: newProd.description }).catch(() => {})
    setNewProd({ name: '', code: '', price: '', description: '' })
    setShowModal(false)
    toast.success('Product added!')
  }
  function handleNewCategory() {
    if (!newCat.trim()) { toast.error('Category name required'); return }
    const item = { id: 'cat-' + Date.now(), name: newCat }
    setCategories(prev => [item, ...prev])
    setForm(f => ({ ...f, category_id: item.id }))
    categoriesApi.create({ name: newCat }).catch(() => {})
    setNewCat('')
    toast.success('Category added!')
  }
  function handleNewUnit() {
    if (!newUnit.trim()) { toast.error('Unit name required'); return }
    const item = { id: 'unit-' + Date.now(), name: newUnit }
    setUnits(prev => [...prev, item])
    setForm(f => ({ ...f, unit_id: item.id }))
    unitsApi.create({ name: newUnit }).catch(() => {})
    setNewUnit('')
    setShowModal(false)
    toast.success('Unit added!')
  }

  const client = clients.find(c => String(c.id) === String(form.client_id))
  const project = projects.find(p => String(p.id) === String(form.project_id))

  if (viewInvoice) {
    return <BOQInvoice
      quotation={savedQuotation}
      client={client}
      project={project}
      rows={rows}
      totals={totals}
      discountType={discountType}
      serviceType={serviceType}
      vatPct={vatPct}
      aitPct={aitPct}
      terms={terms}
      onBack={() => setViewInvoice(false)}
      onNew={() => { setViewInvoice(false); setRows([]); setForm({ date: new Date().toISOString().split('T')[0], client_id: '', project_id: '', category_id: '', product_id: '', unit_id: '' }); setSavedQuotation(null) }}
      onNavigate={onNavigate}
    />
  }

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title">Add Quotation</h3>
          <button className="btn btn-success btn-sm" onClick={() => onNavigate('boq-list')}>
            <i className="fas fa-list"></i> B.O.Q List
          </button>
        </div>
        <div className="block-content">
          {/* Selectors */}
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-col">
              <label className="form-label">Select Client</label>
              <select className="form-control" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value, project_id: '' })}>
                <option value="">Choose One</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Select Project</label>
              <select className="form-control" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                <option value="">Choose One</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Select Category <span className="required">*</span></label>
              <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">Choose One</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Select Product</label>
              <select className="form-control" value={form.product_id} onChange={e => { setForm({ ...form, product_id: e.target.value }); if (e.target.value === 'new') { setShowModal(true); setModalTab('product') } }}>
                <option value="">Choose One</option>
                <option value="new">➕ New Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Select Unit</label>
              <select className="form-control" value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })}>
                <option value="">Choose One</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-col-auto">
              <button className="btn btn-success" onClick={addRow} style={{ minWidth: 46 }}>
                <i className="fas fa-plus-circle"></i>
              </button>
            </div>
          </div>

          {/* BOQ Table */}
          <div className="mt-4">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Product Name</th>
                    <th>Description</th>
                    <th style={{ width: '11%' }}>Price</th>
                    <th style={{ width: '7%' }}>QTY</th>
                    <th style={{ width: '7%' }}>Unit</th>
                    <th style={{ width: '11%' }}>Total</th>
                    <th style={{ width: '6%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={7} className="text-center" style={{ padding: 30, color: 'var(--text-muted)' }}>
                      No items added. Select category, product and click <strong>+</strong>
                    </td></tr>
                  ) : rows.map(r => (
                    <tr key={r.id}>
                      <td><input className="form-control" value={r.product_name} readOnly style={{ height: 54 }} /></td>
                      <td><textarea className="form-control" value={r.description} onChange={e => updateRow(r.id, 'description', e.target.value)} rows={2} style={{ height: 54 }} /></td>
                      <td><input type="number" className="form-control" value={r.unit_price} onChange={e => updateRow(r.id, 'unit_price', e.target.value)} min="0" step="0.01" style={{ height: 54 }} /></td>
                      <td><input type="number" className="form-control" value={r.qty} onChange={e => updateRow(r.id, 'qty', e.target.value)} min="1" step="0.01" style={{ height: 54 }} /></td>
                      <td><input className="form-control" value={r.unit} readOnly style={{ height: 54 }} /></td>
                      <td><input className="form-control highlight" value={formatCurrency(r.total)} readOnly style={{ height: 54, textAlign: 'center' }} /></td>
                      <td><button className="btn btn-danger btn-xs" onClick={() => removeRow(r.id)}><i className="fas fa-times"></i></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-right fw-600">Grand Total :</td>
                    <td><input className="form-control highlight fw-600" value={formatCurrency(totals.subtotal)} readOnly style={{ textAlign: 'center' }} /></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="fw-600 text-center">Discount:</td>
                    <td className="text-center">
                      <div className="form-check"><input type="radio" name="disc" value="flat" checked={discountType === 'flat'} onChange={() => setDiscountType('flat')} /><label className="form-check-label">Flat</label></div>
                      <div className="form-check"><input type="radio" name="disc" value="percentage" checked={discountType === 'percentage'} onChange={() => setDiscountType('percentage')} /><label className="form-check-label">Percent</label></div>
                    </td>
                    <td>{discountType && <input type="number" className="form-control highlight" value={discountVal} onChange={e => setDiscountVal(e.target.value)} min="0" step="0.01" placeholder="0" />}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="fw-600 text-center">Service Charge:</td>
                    <td className="text-center">
                      <div className="form-check"><input type="radio" name="svc" value="flat" checked={serviceType === 'flat'} onChange={() => setServiceType('flat')} /><label className="form-check-label">Flat</label></div>
                      <div className="form-check"><input type="radio" name="svc" value="percentage" checked={serviceType === 'percentage'} onChange={() => setServiceType('percentage')} /><label className="form-check-label">Percent</label></div>
                    </td>
                    <td>{serviceType && <input type="number" className="form-control highlight" value={serviceVal} onChange={e => setServiceVal(e.target.value)} min="0" step="0.01" placeholder="0" />}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="text-right fw-600">VAT (%) :</td>
                    <td><input type="number" className="form-control highlight" value={vatPct} onChange={e => setVatPct(e.target.value)} min="0" step="0.01" placeholder="_ %" /></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="text-right fw-600">AIT (%) :</td>
                    <td><input type="number" className="form-control highlight" value={aitPct} onChange={e => setAitPct(e.target.value)} min="0" step="0.01" placeholder="_ %" /></td>
                    <td></td>
                  </tr>
                  <tr style={{ background: '#fff3e0' }}>
                    <td colSpan={5} className="text-right fw-600" style={{ color: 'var(--accent)', fontSize: 15 }}>GRAND TOTAL :</td>
                    <td><input className="form-control fw-600" value={`৳ ${formatCurrency(totals.grand)}`} readOnly style={{ textAlign: 'center', fontWeight: 700, background: '#fff3e0', color: 'var(--accent)', fontSize: 14 }} /></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-4">
            <label className="form-label fw-600">Terms & Conditions</label>
            <textarea className="form-control" value={terms} onChange={e => setTerms(e.target.value)} rows={12} style={{ fontFamily: 'inherit', fontSize: 12 }} />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button className="btn btn-outline" onClick={() => { setRows([]); setSavedQuotation(null) }}>
              <i className="fas fa-redo"></i> Reset
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Quotation</>}
            </button>
          </div>
        </div>
      </div>

      {/* Add Product/Category/Unit Modal */}
      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target.className.includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h5>Add New</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="nav-tabs">
                {['product', 'category', 'unit'].map(t => (
                  <div key={t} className={`nav-tab ${modalTab === t ? 'active' : ''}`} onClick={() => setModalTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>
              {modalTab === 'product' && (
                <div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Product Name <span className="required">*</span></label><input className="form-control" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} placeholder="Product name" /></div>
                    <div className="form-group"><label className="form-label">Product Code</label><input className="form-control" value={newProd.code} onChange={e => setNewProd({ ...newProd, code: e.target.value })} placeholder="Code" /></div>
                    <div className="form-group"><label className="form-label">Price</label><input type="number" className="form-control" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} placeholder="0.00" /></div>
                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} rows={3} /></div>
                  </div>
                  <div className="text-center"><button className="btn btn-primary" onClick={handleNewProduct}>Submit</button></div>
                </div>
              )}
              {modalTab === 'category' && (
                <div>
                  <div className="form-group"><label className="form-label">Category Name <span className="required">*</span></label><input className="form-control" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name" /></div>
                  <div className="text-center"><button className="btn btn-primary" onClick={handleNewCategory}>Submit</button></div>
                </div>
              )}
              {modalTab === 'unit' && (
                <div>
                  <div className="form-group"><label className="form-label">Unit Name <span className="required">*</span></label><input className="form-control" value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Unit name" /></div>
                  <div className="text-center"><button className="btn btn-primary" onClick={handleNewUnit}>Submit</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── INVOICE VIEW ─────────────────────────────────────────────────────────────
function BOQInvoice({ quotation, client, project, rows, totals, discountType, serviceType, vatPct, aitPct, terms, onBack, onNew, onNavigate }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    await downloadPDF('boq-invoice', `BOQ-${quotation?.quotation_no || 'invoice'}.pdf`)
    setDownloading(false)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="no-print flex gap-2 mb-4 items-center justify-between">
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={onBack}><i className="fas fa-arrow-left"></i> Back</button>
          <button className="btn btn-outline btn-sm" onClick={onNew}><i className="fas fa-plus"></i> New BOQ</button>
          <button className="btn btn-success btn-sm" onClick={() => onNavigate('boq-list')}><i className="fas fa-list"></i> BOQ List</button>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => window.print()}><i className="fas fa-print"></i> Print</button>
          <button className="btn btn-pdf btn-sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? <><i className="fas fa-spinner fa-spin"></i> Generating...</> : <><i className="fas fa-file-pdf"></i> Download PDF</>}
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div id="boq-invoice" ref={null} className="inv-wrap">
        {/* Header */}
        <div className="inv-header">
          <div className="inv-logo">
            <img src={logo} alt="Nirman Dhara" />
            <div className="inv-company">
              <h1>nirmandhara</h1>
              <p>DESIGN YOUR DREAM</p>
              <p>📞 +8801620144641</p>
              <p>✉ nirmandhara@gmail.com</p>
              <p>🕐 Sat–Thu, 11AM–6PM</p>
            </div>
          </div>
          <div className="inv-meta">
            <h2>QUOTATION</h2>
            <p><strong>No:</strong> {quotation?.quotation_no}</p>
            <p><strong>Date:</strong> {formatDate(quotation?.date)}</p>
            <p><strong>Status:</strong> <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{quotation?.status || 'Draft'}</span></p>
          </div>
        </div>

        {/* Parties */}
        <div className="inv-parties">
          <div className="inv-party">
            <h4>Prepared For</h4>
            <p>{client?.name || 'Client Name'}</p>
            <span>{client?.phone || ''}</span>
            {client?.address && <><br /><span>{client.address}</span></>}
          </div>
          <div className="inv-party">
            <h4>Project</h4>
            <p>{project?.project_name || 'As Discussed'}</p>
            {project?.address && <span>{project.address}</span>}
            {project?.start_date && <><br /><span>Start: {formatDate(project.start_date)}</span></>}
            {project?.end_date && <><br /><span>End: {formatDate(project.end_date)}</span></>}
          </div>
        </div>

        {/* Items Table */}
        <table className="inv-table">
          <thead>
            <tr>
              <th style={{ width: 35 }}>#</th>
              <th>Item / Description</th>
              <th style={{ width: 80 }}>Unit</th>
              <th style={{ width: 60 }}>Qty</th>
              <th style={{ width: 110 }}>Unit Price (৳)</th>
              <th style={{ width: 120 }}>Total (৳)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
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

        {/* Totals */}
        <div className="inv-totals">
          <table>
            <tbody>
              <tr><td>Subtotal</td><td className="text-right">৳ {formatCurrency(totals.subtotal)}</td></tr>
              {totals.discount > 0 && <tr><td>Discount ({discountType})</td><td className="text-right" style={{ color: '#dc3545' }}>- ৳ {formatCurrency(totals.discount)}</td></tr>}
              {totals.service > 0 && <tr><td>Service Charge ({serviceType})</td><td className="text-right">+ ৳ {formatCurrency(totals.service)}</td></tr>}
              {totals.vat > 0 && <tr><td>VAT ({vatPct}%)</td><td className="text-right">+ ৳ {formatCurrency(totals.vat)}</td></tr>}
              {totals.ait > 0 && <tr><td>AIT ({aitPct}%)</td><td className="text-right">+ ৳ {formatCurrency(totals.ait)}</td></tr>}
            </tbody>
            <tfoot>
              <tr className="grand-total">
                <td>GRAND TOTAL</td>
                <td className="text-right">৳ {formatCurrency(totals.grand)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms */}
        {terms && (
          <div className="inv-terms">
            <h4>Terms & Conditions</h4>
            <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', fontSize: 11 }}>{terms}</pre>
          </div>
        )}

        {/* Signatures */}
        <div className="inv-sign">
          <div className="inv-sign-box"><div className="inv-sign-line">Client Signature & Date</div></div>
          <div className="inv-sign-box"><div className="inv-sign-line">Authorized Signature — Nirmandhara</div></div>
        </div>

        <div className="inv-watermark">
          This is a computer-generated quotation. For queries contact: nirmandhara@gmail.com | +8801620144641<br />
          Nirmandhara — Design Your Dream
        </div>
      </div>
    </div>
  )
}
