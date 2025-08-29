// app/(dashboard)/dashboard/layout.js
import "@/styles/main.css";
import "@/styles/buttons.css";
import "@/styles/forms.css";
import "@/styles/navbar.css";
import "@/styles/footer.css";
import "@/styles/pages.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }) {
    return (
        <section style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Reports", href: "/dashboard/reports" },
                    { label: "Finanze", href: "/dashboard/finanze" },
                    { label: "Magazzino", href: "/dashboard/magazzino" },
                    { label: "E Molto Altro", href: "/dashboard/altro" },
                ]}
            />
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 120px)",
                }}
            >
                {children}
            </main>
            <Footer />
        </section>
    );
}
