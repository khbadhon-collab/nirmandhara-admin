import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // login | forgot
  const [resetSent, setResetSent] = useState(false)

  async function submit() {
    setError(''); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Wrong email or password'); return }
    onLogin(data.session.user)
  }

  async function sendReset() {
    if (!email) { setError('Enter your email address first'); return }
    setError(''); setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://nirmandhara.netlify.app'
    })
    setLoading(false)
    if (error) { setError(error.message || 'Failed to send reset email'); return }
    setResetSent(true)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:'40px 36px',borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,0.08)',width:360}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:24,fontWeight:800,color:'#1a5c3a'}}>Nirman Dhara</div>
          <div style={{fontSize:13,color:'#888',marginTop:4}}>
            {mode === 'login' ? 'Admin Panel' : 'Reset Password'}
          </div>
        </div>

        {mode === 'login' && (
          <>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:8,marginBottom:12,fontSize:14,boxSizing:'border-box'}} />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&submit()}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:8,marginBottom:8,fontSize:14,boxSizing:'border-box'}} />
            <div style={{textAlign:'right',marginBottom:16}}>
              <span
                onClick={() => { setMode('forgot'); setError(''); setResetSent(false) }}
                style={{fontSize:12,color:'#1a5c3a',cursor:'pointer',textDecoration:'underline'}}
              >
                Forgot password?
              </span>
            </div>
            {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,textAlign:'center'}}>{error}</div>}
            <button onClick={submit} disabled={loading}
              style={{width:'100%',padding:'12px',background:'#1a5c3a',color:'#fff',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading?0.7:1}}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </>
        )}

        {mode === 'forgot' && !resetSent && (
          <>
            <p style={{fontSize:13,color:'#555',marginBottom:16,textAlign:'center',lineHeight:1.5}}>
              Enter your email and we will send you a reset link.
            </p>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&sendReset()}
              style={{width:'100%',padding:'11px 14px',border:'1px solid #ddd',borderRadius:8,marginBottom:16,fontSize:14,boxSizing:'border-box'}} />
            {error && <div style={{color:'#c0392b',fontSize:13,marginBottom:12,textAlign:'center'}}>{error}</div>}
            <button onClick={sendReset} disabled={loading}
              style={{width:'100%',padding:'12px',background:'#1a5c3a',color:'#fff',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',opacity:loading?0.7:1}}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={{textAlign:'center',marginTop:14}}>
              <span onClick={() => { setMode('login'); setError('') }}
                style={{fontSize:12,color:'#888',cursor:'pointer',textDecoration:'underline'}}>
                Back to login
              </span>
            </div>
          </>
        )}

        {mode === 'forgot' && resetSent && (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:36,marginBottom:12}}>📧</div>
            <div style={{fontSize:14,color:'#1a5c3a',fontWeight:600,marginBottom:8}}>Check your email</div>
            <div style={{fontSize:13,color:'#555',marginBottom:20,lineHeight:1.6}}>
              A reset link was sent to <strong>{email}</strong>. Click the link in the email to set a new password.
            </div>
            <span onClick={() => { setMode('login'); setError(''); setResetSent(false) }}
              style={{fontSize:12,color:'#888',cursor:'pointer',textDecoration:'underline'}}>
              Back to login
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
