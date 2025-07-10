export const metadata = { title: 'Dashboard' };

export default function DashboardLayout({ children }) {
  return (
    <section style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 120px)'}}>
      {children}
    </section>
  );
}
