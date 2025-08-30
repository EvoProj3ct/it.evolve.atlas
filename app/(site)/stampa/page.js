"use client";

import React from "react";
import ScrollProgress from "@/components/ui/ScrollProgress";
import HomeParallax from "@/components/game/HomeParallax";
import WindowFrame, { WindowProvider, WindowTray } from "@/components/window";

export default function StampaPage() {
    return (
        <WindowProvider>
            {/* HUD / overlay */}
            <ScrollProgress />
            <HomeParallax />
            <WindowTray />

            {/* Sezioni come finestre */}
            <WindowFrame id="intro-stampa" title="Stampa 3D che lavora per te" maximizeHref="/stampa">
                <p>
                    Usiamo la stampa 3D per creare <strong>pezzi funzionali</strong>, mockup realistici e micro-lotti.
                    Con materiali tecnici e <em>moduli smart</em> integriamo elettronica, sensori e NFC direttamente nel PLA,
                    per prodotti pronti all’uso e alla vendita.
                </p>
            </WindowFrame>

            <WindowFrame id="cos-e" title="Cos'è la Stampa 3D (FDM)" maximizeHref="/stampa#cos-e">
                <p>
                    Tecnologia additiva: depositiamo strati di materiale (PLA/PETG/ABS) guidati dal modello 3D.
                    Vantaggi: tempi rapidi, costi contenuti sui piccoli volumi, libertà geometrica e personalizzazione
                    spinta.
                </p>
            </WindowFrame>

            <WindowFrame id="macchine" title="Le nostre macchine" maximizeHref="/stampa#macchine">
                <p>
                    Parco FDM multi-estrusore e camere chiuse per materiali tecnici. Volume di stampa per pezzo fino a
                    <strong> 300×300×400 mm</strong>. Controllo qualità su dimensioni, resistenza e finitura.
                </p>
            </WindowFrame>

            <WindowFrame id="portachiavi" title="Portachiavi & Gadget Personalizzati" maximizeHref="/stampa#portachiavi">
                <p>
                    Portachiavi, badge e gadget brandizzati in PLA (<strong>colori fluo</strong> inclusi) con possibilità di
                    inserire tag <strong>NFC</strong> o QR per landing, coupon, manuali e tracciabilità.
                </p>
            </WindowFrame>

            <WindowFrame id="nfc-iot" title="Tecnologia Integrata: NFC & Sensori" maximizeHref="/stampa#nfc-iot">
                <p>
                    Alloggiamo <strong>tag NFC</strong>, lettori, moduli BLE/Wi-Fi e sensori di movimento direttamente nel pezzo.
                    Esempi: segnaletica smart, componenti per <em>smart home</em>, dispositivi di asset-tracking, fixture per collaudo.
                </p>
            </WindowFrame>

            <WindowFrame id="industria" title="Pezzi su Misura per l'Industria Plastica" maximizeHref="/stampa#industria">
                <p>
                    Dime, guide, carter, convogliatori, attrezzature per linee di produzione e prototipi funzionali.
                    Lavoriamo da disegno o reverse-engineering. Consegniamo file e <strong>distinte</strong> per riordini rapidi.
                </p>
            </WindowFrame>

            <WindowFrame id="cta-stampa" title="Chiedi un preventivo rapido" maximizeHref="/contatti">
                <p>
                    Inviaci il file 3D o una foto con misure: ti rispondiamo con tempi, materiali consigliati e costi.
                </p>
                <form
                    className="form"
                    action="mailto:info@example.com"
                    method="post"
                    encType="text/plain"
                >
                    <input type="text" name="name" placeholder="Nome" required />
                    <input type="email" name="email" placeholder="Email" required />
                    <textarea name="message" rows="4" placeholder="Raccontaci cosa ti serve" required />
                    <button type="submit">Invia</button>
                </form>
            </WindowFrame>
        </WindowProvider>
    );
}
