// app/(site)/layout.js
import "@/styles/main.css";
import "@/styles/buttons.css";
import "@/styles/forms.css";
import "@/styles/navbar.css";
import "@/styles/footer.css";
import "@/styles/pages.css";
import "@/styles/home.css";
import "@/styles/icons.css";
import "@/styles/game.css";
import "@/styles/magazzino.css";
import "@/styles/about.css";
import "@/styles/finanze.css";
import "@/styles/spesatore.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }) {
    return (
        <>
            <Navbar
                items={[
                    { label: "Home", href: "/" },
                    { label: "Chi Siamo", href: "/chi-siamo" },
                    { label: "Game", href: "/game" },
                    {
                        label: "Talk to LEO",
                        href: "http://evolve3d.it/leo/virtual-assistant.html",
                        external: true,
                    },
                    { label: "Contatti", href: "/contatti" },
                ]}
            />
            {children}
            <Footer />
        </>
    );
}
