// app/(site)/layout.js
import "@/styles/main.css";
import "@/styles/buttons.css";
import "@/styles/forms.css";
import "@/styles/navbar.css";
import "@/components/ui/footer/FooterStyles.module.css";
import "@/styles/pages.css";
import "@/styles/home.css";
import "@/styles/icons.css";
import "@/styles/game.css";
import "@/styles/about.css";
import "@/styles/portfolio.css";


import Navbar from "@/components/Navbar";
import Footer from "@/components/ui/footer/Footer";
import PixeledChatWidget from "@/components/chat/PixeledChatWidget";
import React from "react";

export default function SiteLayout({ children }) {
    return (
        <>
            <Navbar
                items={[
                    { label: "Home", href: "/" },
                    { label: "Chi Siamo", href: "/chi-siamo" },
                    { label: "Portfolio", href: "/portfolio" },
                    { label: "Consulenza", href: "/consulenza" },
                    { label: "Stampa", href: "/stampa" },
                    { label: "Arcade", href: "/arcade"},
                    { label: "Contatti", href: "/contatti" },
                ]}
            />
            {children}
            {/* Widget chat pixel */}
            <PixeledChatWidget
                label="Talk To Leo"
                avatarSrc="/avatars/leo.png"
                initialText="Ciao! Sono Leo, hai domande?"
                redirectHref="https://chatgpt.com/g/g-68a634b4bb888191b1209375250d95f1-leo?model=gpt-4o"
                chatTitle="LEO • EVOLVE"
            />
            <Footer />
        </>
    );
}
