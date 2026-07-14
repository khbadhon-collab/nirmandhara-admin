import { useState, useEffect } from 'react'
import { clientsApi } from '../../lib/api'

const today = () => new Date().toISOString().split('T')[0]

const VIEWS = {
  'today-call':   { title: "Today's Calls",   icon: 'fa-bell',       filter: c => c.next_call_date === today() },
  'overdue-call': { title: 'Overdue Calls',   icon: 'fa-bell-slash', filter: c => c.next_call_date && c.next_call_date < today() },
  'upcoming-call':{ title: 'Upcoming Calls',  icon: 'fa-arrow-right',filter: c => c.next_call_date && c.next_call_date > today() },
  'visit-date':   { title: 'Client Visits',   icon: 'fa-calendar',   filter: c => !!c.visit_date, dateKey: 'visit_date' },
  'client-status':{ title: 'Clients by Status',   icon: 'fa-shopping-basket', groupBy: 'status' },
  'client-category':{ title: 'Clients by Category', icon: 'fa-list',  groupBy: 'category' },
  'area':         { title: 'Clients by Area', icon: 'fa-map-marker-alt', groupBy: 'area' },
  'sqft':         { title: 'Clients by SQFT', icon: 'fa-square',     filter: c => !!c.sqft, extraCol: { key: 'sqft', label: 'SQFT' } },
  'reference':    { title: 'Clients by Reference', icon: 'fa-window-restore', groupBy: 'reference' },
}

export default function ClientViews({ view, toast, onNavigate }) {
  const cfg = VIEWS[view] || VIEWS['today-call']
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await clientsApi.getAll()
      if (error) toast.error('Load failed: ' + error.message)
      setClients(data || [])
      setLoading(false)
    }
    load()
  }, [view])

  const base = clients.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.area?.toLowerCase().includes(search.toLowerCase())
  )

  const rows = cfg.filter ? base.filter(cfg.filter) : base

  // grouped summary views
  if (cfg.groupBy) {
    const groups = {}
    for (const c of rows) {
      const k = c[cfg.groupBy] || '(Not set)'
      groups[k] = groups[k] || []
      groups[k].push(c)
    }
    return (
      <div className="block">
        <div className="block-header">
          <h3 className="block-title"><i className={`fas ${cfg.icon}`}></i> {cfg.title}</h3>
          <input className="form-control" style={{ width: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="block-content">
          {loading ? <p className="text-muted" style={{ padding: 16 }}>Loading...</p> :
            Object.keys(groups).length === 0 ? <p className="text-muted" style={{ padding: 16 }}>No clients yet. <a href="#" onClick={e => { e.preventDefault(); onNavigate('client-list') }}>Add clients first.</a></p> :
            Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([g, list]) => (
              <div key={g} style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, padding: '8px 4px', borderBottom: '2px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{g}</span><span className="badge badge-info">{list.length}</span>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <tbody>
                      {list.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>{c.phone || '-'}</td>
                          <td>{c.area || '-'}</td>
                          <td>{c.status || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  const dateKey = cfg.dateKey || 'next_call_date'
  return (
    <div className="block">
      <div className="block-header">
        <h3 className="block-title"><i className={`fas ${cfg.icon}`}></i> {cfg.title} <span className="badge badge-info">{rows.length}</span></h3>
        <input className="form-control" style={{ width: 200 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="block-content table-wrap">
        {loading ? <p className="text-muted" style={{ padding: 16 }}>Loading...</p> : (
          <table className="data-table">
            <thead><tr>
              <th>Client</th><th>Phone</th><th>Area</th>
              <th>{cfg.extraCol ? cfg.extraCol.label : 'Date'}</th>
              <th>Status</th><th>Notes</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: 30 }}>Nothing here right now</td></tr>}
              {rows.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : '-'}</td>
                  <td>{c.area || '-'}</td>
                  <td>{cfg.extraCol ? (c[cfg.extraCol.key] || '-') : (c[dateKey] || '-')}</td>
                  <td>{c.status || '-'}</td>
                  <td>{c.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
