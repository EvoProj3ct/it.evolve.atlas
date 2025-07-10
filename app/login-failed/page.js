export const metadata = { title: 'Login Fallito' }

export default function LoginFailed() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 120px)'}}>
      <h1>Login fallito</h1>
      <p>Controlla le credenziali e riprova.</p>
    </div>
  )
}
