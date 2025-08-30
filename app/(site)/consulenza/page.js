"use client";

import React from "react";
import ScrollProgress from "@/components/ui/ScrollProgress";
import HomeParallax from "@/components/game/HomeParallax";
import WindowFrame, { WindowProvider, WindowTray } from "@/components/window";

export default function ConsulenzaPage() {
    return (
        <WindowProvider>
            {/* HUD / overlay */}
            <ScrollProgress />
            <WindowTray />

            {/* Sezioni come finestre */}
            <WindowFrame id="intro-consulenza" title="Consulenza che ti fa correre" maximizeHref="/consulenza">
                <p>
                    La nostra consulenza unisce metodologie snelle e prototipi rapidi per
                    portare <strong>innovazione concreta</strong> in azienda. Partiamo da obiettivi chiari,
                    misuriamo il ritorno, e consegniamo risultati <em>subito spendibili</em>: niente slide
                    infinite, ma tool che funzionano davvero.
                </p>
            </WindowFrame>

            <WindowFrame id="metaverso" title="Consulenza per Metaversi" maximizeHref="/consulenza#metaverso">
                <p>
                    Progettiamo esperienze immersive per vendita, formazione e onboarding:
                    <br/>• showroom 3D per prodotti complessi<br/>
                    • ambienti per training e assistenza remota<br/>
                    • eventi e community branded
                </p>
                <p>
                    Dalla scelta della piattaforma alla <strong>misura dei KPI</strong> (engagement, lead, conversioni),
                    ti diamo un percorso graduale: POC → MVP → scalabilità.
                </p>
            </WindowFrame>

            <WindowFrame id="ia" title="Pacchetto IA: dalla strategia al rilascio" maximizeHref="/consulenza#ia">
                <p>
                    Assessment dei processi, scelte architetturali (on-prem/cloud), privacy e compliance.
                    Implementiamo <strong>assistenti</strong>, <strong>automazioni</strong> e <strong>analisi</strong> con modelli generativi e classici.
                </p>
                <p>
                    Il pacchetto include: <br/>
                    • mappatura use-case ad alto ROI<br/>
                    • prototipo in 2–4 settimane<br/>
                    • formazione del team e handover<br/>
                    • monitoraggio qualità e costi (guardrail, logging, A/B)
                </p>
            </WindowFrame>

            <WindowFrame id="ottimizzazione" title="Ottimizzazione dei Processi" maximizeHref="/consulenza#ottimizzazione">
                <p>
                    Riduciamo gli attriti operativi con integrazioni e automazioni:
                    <br/>• flussi approvativi, CRM/ERP, ticketing <br/>
                    • estrazione dati da PDF/email e sincronizzazione sistemi <br/>
                    • dashboard KPI in tempo reale
                </p>
                <p>
                    Obiettivo: <strong>meno tempo perso, più margine</strong>. Misuriamo prima/dopo: cycle-time,
                    errori, SLA, costi di processo.
                </p>
            </WindowFrame>

            <WindowFrame id="software" title="Sviluppo Software su Misura" maximizeHref="/consulenza#software">
                <p>
                    App web/mobile, integrazioni IoT, portali e microservizi. Architetture moderne,
                    UX essenziale, attenzione a performance e sicurezza. Dal prototipo al rilascio in
                    produzione, con CI/CD e osservabilità.
                </p>
            </WindowFrame>

            <WindowFrame id="cta-consulenza" title="Parliamo del tuo progetto" maximizeHref="/contatti">
                <p>
                    Raccontaci obiettivi e vincoli: prepariamo un <strong>mini-piano</strong> con tempi, milestone e
                    stima costi. Zero fronzoli, subito sostanza.
                </p>
                <form
                    className="form"
                    action="mailto:info@example.com"
                    method="post"
                    encType="text/plain"
                >
                    <input type="text" name="name" placeholder="Nome" required />
                    <input type="email" name="email" placeholder="Email" required />
                    <textarea name="message" rows="4" placeholder="Descrivi il progetto" required />
                    <button type="submit">Invia</button>
                </form>
            </WindowFrame>
        </WindowProvider>
    );
}
