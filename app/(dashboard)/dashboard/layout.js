// app/(dashboard)/dashboard/layout.js
import "@/styles/main.css";
import "@/styles/buttons.css";
import "@/styles/forms.css";
import "@/styles/navbar.css";
import "@/styles/footer.css";
import "@/styles/pages.css";
import "@/styles/magazzino.css"

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PixeledChatWidget from "@/components/chat/PixeledChatWidget";
import React from "react";

export const metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }) {
    return (
        <section style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar
                items={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Magazzino", href: "/dashboard/magazzino" },
                    { label: "Reports", href: "/dashboard/reports" },
                    { label: "Finanze", href: "/dashboard/finanze" },
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
            {/* Widget chat pixel */}
            <PixeledChatWidget
                label="Talk To Spark"
                avatarSrc="/avatars/spark.png"
                initialText="Sono il dottor Spark, ti serve aiuto?"
                redirectHref="https://chatgpt.com/g/g-68a70d14dad48191959d24315ed3795d-dr-spark?model=gpt-5"
                chatTitle="SPARK • EVOLVE"
            />
            <Footer />
        </section>
    );
}
