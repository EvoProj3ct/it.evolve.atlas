"use client"; //home page effetto parallasse + finestre dinamiche

import React from "react";
import ScrollProgress from "@/components/ui/ScrollProgress";
import HomeParallax from "@/components/game/HomeParallax";
import WindowFrame, { WindowProvider, WindowTray } from "@/components/window";

export default function Home() {
    return (
        <WindowProvider>
            {/* HUD / overlay */}
            <ScrollProgress />
            <HomeParallax />
            <WindowTray />

            {/* Sezioni come finestre */}
            <WindowFrame id="intro" title="Benvenuto in Evolve" maximizeHref="/portfolio">
                <p>
                    Evolve è la tua officina digitale: realizziamo software su misura e
                    prototipi in stampa 3D con dispositivi PLA dotati di NFC. Con soluzioni
                    come E-Linker ed E-Talk aiutiamo persone e oggetti a comunicare,
                    offrendo a ogni impresa l'accesso all'innovazione. Offriamo consulenza
                    e strumenti integrati per ottimizzare e innovare i processi aziendali
                    delle piccole e medie imprese: anche tu ora te lo puoi permettere!
                </p>
            </WindowFrame>

            <WindowFrame id="chi-siamo" title="Chi Siamo" maximizeHref="/chi-siamo">
                <p>
                    Siamo un team di professionisti appassionati di tecnologia e cultura
                    8-bit. Uniamo esperienza in sviluppo, IoT e design per accompagnarti
                    con cordialità verso il futuro digitale.
                </p>
            </WindowFrame>

            <WindowFrame id="prodotti" title="I Nostri Prodotti" maximizeHref="/stampa-3d">
                <p>
                    Dal nostro E-Linker all'E-Talk, sviluppiamo dispositivi e piattaforme
                    che integrano NFC e stampa 3D per connettere ciò che conta. Ogni prodotto
                    è pensato per essere semplice, fluo e pronto all'uso.
                </p>
            </WindowFrame>

            <WindowFrame id="servizi" title="I Nostri Servizi" maximizeHref="/chi-siamo">
                <p>
                    Offriamo soluzioni integrate e consulenza personalizzata per ottimizzare
                    i processi aziendali. Dallo sviluppo software alla prototipazione rapida,
                    ti guidiamo nell'innovazione della tua PMI.
                </p>
            </WindowFrame>

            <WindowFrame id="testimonianze" title="Cosa Dicono di Noi" maximizeHref="/contatti">
                <p>
                    "I ragazzi di Evolve hanno trasformato le nostre idee in realtà in pochissimo tempo!"<br />
                    "Finalmente un partner che parla la lingua delle piccole imprese."
                </p>
            </WindowFrame>

            <WindowFrame id="contatti" title="Contattaci" maximizeHref="/chi-siamo">
                <form
                    className="form"
                    action="mailto:info@example.com"
                    method="post"
                    encType="text/plain"
                >
                    <input type="text" name="name" placeholder="Nome" required />
                    <input type="email" name="email" placeholder="Email" required />
                    <textarea name="message" rows="4" placeholder="Messaggio" required />
                    <button type="submit">Invia</button>
                </form>
            </WindowFrame>
        </WindowProvider>
    );
}
