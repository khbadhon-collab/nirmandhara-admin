export default function ComingSoon({ title = 'Coming Soon', onNavigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 60, marginBottom: 20, opacity: .15 }}>
        <i className="fas fa-tools"></i>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        This page is under development. Core pages are functional.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>
          <i className="fas fa-home"></i> Dashboard
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('client-list')}>
          <i className="fas fa-users"></i> Clients
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('project-list')}>
          <i className="fas fa-city"></i> Projects
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('boq-add')}>
          <i className="fas fa-file-invoice"></i> BOQ
        </button>
        <button className="btn btn-outline" onClick={() => onNavigate('payment-collection')}>
          <i className="fas fa-money-bill"></i> Payments
        </button>
      </div>
    </div>
  )
}
