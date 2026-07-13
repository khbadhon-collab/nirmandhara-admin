import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError(''); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Wrong email or password'); return }
    onLogin(data.session.user)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:'40px 36px',borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,0.08)',width:360}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:24,fontWeight:800,color:'#1a5c3a'}}>Nirman Dhara</div>
          <div style={{fontSize:13,color:'#888',marginTop:4}}>Admin Panel</div>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:8,marginBottom:12,fontSize:14,boxSizing:'border-box'}} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&submit()}
          style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:8,marginBottom:16,fontSize:14,boxSizing:'border-box'}} />
        {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,textAlign:'center'}}>{error}</div>}
        <button onClick={submit} disabled={loading}
          style={{width:'100%',padding:'12px',background:'#1a5c3a',color:'#fff',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading?0.7:1}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
