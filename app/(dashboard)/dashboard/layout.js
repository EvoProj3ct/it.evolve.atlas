import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }) {
    return (
        <section
            style={{
                display:'flex',
                flexDirection:'column',
                minHeight:'100vh'
            }}
        >
            <Navbar
                items={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Reports', href: '/dashboard/reports' },
                    { label: 'Finanze', href: '/dashboard/finanze' },
                    { label: 'Magazzino', href: '/dashboard/magazzino' },
                    { label: 'Instagram', href: '/dashboard/instagram' },
                    { label: 'Logout', href: '/api/auth/signout' },
                ]}
            />
            <main
                style={{
                    flex:1,
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    justifyContent:'center',
                    minHeight:'calc(100vh - 120px)',
                }}
            >
                {children}
            </main>
            <Footer />
        </section>
    );
}
