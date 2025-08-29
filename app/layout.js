// app/layout.js
import { Poppins, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const poppins = Poppins({ variable: "--font-poppins", weight: ["400","600"], subsets:["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets:["latin"] });
const pressStart = Press_Start_2P({ variable: "--font-press-start", weight:"400", subsets:["latin"] });

export const metadata = {
    title: "App di Evolve",
    description: "Evolve Studio",
};

export default function RootLayout({ children }) {
    return (
        <html lang="it">
        <body className={`${poppins.variable} ${geistMono.variable} ${pressStart.variable}`}>
        <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    );
}
