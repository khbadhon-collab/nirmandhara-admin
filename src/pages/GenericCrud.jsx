import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cleanForm } from '../lib/api'

// Configurable CRUD page: table list + add/edit modal + delete, wired to any nd_ table.
// config: { title, table, orderBy, select, columns: [{key,label,render?}], fields: [{key,label,type,options?,optionsTable?,optionLabel?,required?}], summary? }
export default function GenericCrud({ config, toast }) {
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [config.table])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from(config.table)
      .select(config.select || '*')
      .order(config.orderBy || 'created_at', { ascending: config.orderAsc ?? false })
    if (error) toast.error('Load failed: ' + error.message)
    setRows(data || [])
    // load dropdown lookups
    const lk = {}
    for (const f of config.fields || []) {
      if (f.optionsTable) {
        const { data: opts } = await supabase.from(f.optionsTable).select('*').order(f.optionLabel || 'name')
        lk[f.key] = opts || []
      }
    }
    setLookups(lk)
    setLoading(false)
  }

  function blank() {
    const b = {}
    for (const f of config.fields) b[f.key] = f.default ?? (f.type === 'date' ? new Date().toISOString().split('T')[0] : '')
    return b
  }

  function openAdd() { setForm(blank()); setEditItem(null); setShowModal(true) }
  function openEdit(r) {
    const f = {}
    for (const fl of config.fields) f[fl.key] = r[fl.key] ?? ''
    setForm(f); setEditItem(r); setShowModal(true)
  }

  async function handleSave() {
    for (const f of config.fields) {
      if (f.required && !String(form[f.key] ?? '').trim()) { toast.error(f.label + ' is required'); return }
    }
    setSaving(true)
    const payload = cleanForm({ ...form })
    for (const f of config.fields) if (f.type === 'number') payload[f.key] = parseFloat(form[f.key]) || 0
    let result
    if (editItem) result = await supabase.from(config.table).update(payload).eq('id', editItem.id).select(config.select || '*').single()
    else result = await supabase.from(config.table).insert(payload).select(config.select || '*').single()
    setSaving(false)
    if (result.error) { toast.error('Save failed: ' + result.error.message); return }
    if (editItem) setRows(prev => prev.map(r => r.id === editItem.id ? result.data : r))
    else setRows(prev => [result.data, ...prev])
    if (config.afterSave) await config.afterSave(result.data, supabase, !!editItem)
    toast.success(editItem ? 'Updated!' : 'Saved!')
    setShowModal(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this record?')) return
    const { error } = await supabase.from(config.table).delete().eq('id', id)
    if (error) { toast.error('Delete failed: ' + error.message); return }
    setRows(prev => prev.filter(r => r.id !== id))
    toast.success('Deleted')
  }

  const filtered = rows.filter(r =>
    !search || JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  )

  const cell = (r, c) => c.render ? c.render(r) : (r[c.key] ?? '-')

  return (
    <div>
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className={`fas ${config.icon || 'fa-list'}`}></i> {config.title}</h3>
          <div className="flex gap-2">
            <input className="form-control" style={{ width: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            {!config.readOnly && <button className="btn btn-primary btn-sm" onClick={openAdd}><i className="fas fa-plus"></i> Add</button>}
          </div>
        </div>
        <div className="block-content table-wrap">
          {loading ? <p style={{ padding: 20, color: 'var(--text-muted)' }}>Loading...</p> : (
            <table className="data-table">
              <thead><tr>
                {config.columns.map(c => <th key={c.key}>{c.label}</th>)}
                {!config.readOnly && <th style={{ width: 90 }}>Action</th>}
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={config.columns.length + 1} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No records yet</td></tr>}
                {filtered.map(r => (
                  <tr key={r.id}>
                    {config.columns.map(c => <td key={c.key}>{cell(r, c)}</td>)}
                    {!config.readOnly && (
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)} title="Edit"><i className="fas fa-pen"></i></button>{' '}
                        <button className="btn btn-outline btn-sm" style={{ color: '#c0392b' }} onClick={() => handleDelete(r.id)} title="Delete"><i className="fas fa-trash"></i></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {config.summary && !loading && (
            <div style={{ padding: '10px 14px', fontWeight: 700, borderTop: '1px solid var(--border)' }}>{config.summary(filtered)}</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay open" onClick={e => e.target.className.includes && String(e.target.className).includes('modal-overlay') && setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h5>{editItem ? 'Edit' : 'Add'} — {config.title}</h5>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {config.fields.map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}{f.required && <span className="required"> *</span>}</label>
                  {f.type === 'select' || f.optionsTable ? (
                    <select className="form-control" value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      <option value="">-- Select --</option>
                      {(f.optionsTable ? (lookups[f.key] || []) : f.options || []).map(o =>
                        f.optionsTable
                          ? <option key={o.id} value={o.id}>{o[f.optionLabel || 'name']}</option>
                          : <option key={o} value={o}>{o}</option>
                      )}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea className="form-control" rows={3} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  ) : (
                    <input className="form-control" type={f.type || 'text'} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
