import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { projectsApi, clientsApi, quotationsApi, paymentsApi } from '../lib/api'

const COLORS = ['#198754', '#9b1c1c', '#001880']

function daysDiff(endDate) {
  return Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ projects: 0, ongoing: 0, done: 0, clients: 0, revenue: 0, due: 0 })
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes, qRes, payRes] = await Promise.all([
          projectsApi.getAll(),
          clientsApi.getAll(),
          quotationsApi.getAll(),
          paymentsApi.getAll(),
        ])
        const projs = pRes.data || []
        const ongoing = projs.filter(p => p.status === 'Ongoing').length
        const done = projs.filter(p => p.status === 'Completed').length
        const revenue = (payRes.data || []).reduce((s, p) => s + (p.amount || 0), 0)
        const totalBudget = projs.reduce((s, p) => s + (p.total_budget || 0), 0)
        const totalPaid = projs.reduce((s, p) => s + (p.total_paid || 0), 0)
        setStats({
          projects: projs.length,
          ongoing, done,
          clients: (cRes.data || []).length,
          revenue,
          due: totalBudget - totalPaid,
        })
        setProjects(projs.slice(0, 20))
      } catch (e) {
        setStats({ projects: 0, ongoing: 0, done: 0, clients: 0, revenue: 0, due: 0 })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pieData = [
    { name: 'Total', value: stats.projects || 0 },
    { name: 'Ongoing', value: stats.ongoing || 0 },
    { name: 'Complete', value: stats.done || 0 },
  ]

  const barData = projects.map(p => ({ name: p.project_name?.slice(0, 18), days: daysDiff(p.end_date || new Date()) }))

  const quickCards = [
    { label: 'CRM', page: 'client-list', gradient: 'linear-gradient(135deg,#0277bd,#01579b)' },
    { label: 'Design', page: 'design-sell-list', gradient: 'linear-gradient(135deg,#0288d1,#004d80)' },
    { label: 'Accounts', page: 'payment-collection', gradient: 'linear-gradient(135deg,#01579b,#003060)' },
    { label: 'Project', page: 'project-list', gradient: 'linear-gradient(135deg,#004d80,#001a40)' },
  ]

  return (
    <div>
      {/* Quick Cards */}
      <div className="quick-cards">
        {quickCards.map(c => (
          <button key={c.label} className="quick-card" style={{ background: c.gradient }} onClick={() => onNavigate(c.page)}>
            <div className="quick-card-content"><h3>{c.label}</h3></div>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="summary-grid mb-4">
        <div className="summary-card orange">
          <div><div className="summary-num">{stats.projects}</div><div className="summary-lbl">Total Projects</div></div>
          <i className="fas fa-city summary-icon"></i>
        </div>
        <div className="summary-card green">
          <div><div className="summary-num">{stats.clients}</div><div className="summary-lbl">Total Clients</div></div>
          <i className="fas fa-users summary-icon"></i>
        </div>
        <div className="summary-card blue">
          <div><div className="summary-num">৳{(stats.revenue / 1000).toFixed(0)}K</div><div className="summary-lbl">Revenue Collected</div></div>
          <i className="fas fa-money-bill summary-icon"></i>
        </div>
        <div className="summary-card red">
          <div><div className="summary-num">৳{(stats.due / 1000).toFixed(0)}K</div><div className="summary-lbl">Outstanding Due</div></div>
          <i className="fas fa-file-invoice summary-icon"></i>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-row">
        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span>Project Details</span>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('project-list')}>
              <i className="fas fa-external-link-alt"></i> View All
            </button>
          </div>
          <div className="card-body">
            <PieChart width={320} height={220}>
              <Pie data={pieData} cx={160} cy={110} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
            <div className="stat-boxes">
              <a className="stat-box bg-green" onClick={() => onNavigate('project-list')} style={{ cursor: 'pointer' }}>
                <div><div className="stat-val">{stats.projects || 0}</div><div className="stat-lbl">Total Project</div></div>
                <i className="fas fa-calendar-check stat-icon"></i>
              </a>
              <a className="stat-box bg-red" onClick={() => onNavigate('project-list')} style={{ cursor: 'pointer' }}>
                <div><div className="stat-val">{stats.ongoing || 0}</div><div className="stat-lbl">Ongoing Project</div></div>
                <i className="fas fa-calendar-minus stat-icon"></i>
              </a>
              <a className="stat-box bg-navy" onClick={() => onNavigate('project-list')} style={{ cursor: 'pointer', gridColumn: '1 / span 2' }}>
                <div><div className="stat-val">{stats.done || 0}</div><div className="stat-lbl">Done</div></div>
                <i className="fas fa-calendar-check stat-icon"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <div className="card-header"><span>Project Overview — Remaining / Overdue Days</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" domain={[-365, 365]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => v > 0 ? `Remaining: ${v} days` : `Overdue: ${Math.abs(v)} days`} />
                <Legend />
                <Bar dataKey="days" name="Days"
                  fill="#4bc0c0"
                  cell={(entry) => <rect fill={entry.days > 0 ? '#4bc0c0' : '#ff6384'} />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
