## EPIC: Sviluppo piattaforma web Evolve (Next.js + MongoDB + NextAuth)

### ✅ Task 1: Setup iniziale fullstack (Next.js + MongoDB + Auth)
**Titolo:** 01 - Inizializzazione progetto fullstack con Next.js, MongoDB Atlas e NextAuth

**Descrizione:**
Preparazione del progetto base per la webapp Evolve. Si imposta la struttura fullstack Next.js, si collega il database MongoDB Atlas, si configura NextAuth per la login degli operatori (senza registrazione pubblica) e si crea la struttura delle prime rotte protette.

**Obiettivi:**
- Struttura base del progetto Next.js
- Connessione al database MongoDB Atlas
- Configurazione NextAuth con provider Credentials
- Gestione sessioni utente (role-based: admin, operator)
- Middleware per protezione delle pagine
- Layout base con header pubblico (Home) e header privato (strumenti)

**Checklist:**
- Inizializzare repo Git e struttura base Next.js (app/ o pages/)
- Configurare `.env.local` con variabili (Mongo URI, NextAuth secret)
- Setup di NextAuth con credenziali gestite via MongoDB
- Creare il primo utente admin (manualmente, da script)
- Impostare il layout principale con condizionale isAuthenticated
- Creare pagine:
  - `/` (pubblica - home)
  - `/login` (pubblica)
  - `/dashboard` (privata - accesso dopo login)
- Implementare logica di accesso in base al ruolo (admin, operator)

👥 Ruoli: fullstack (entrambi)  
📅 Durata stimata: 1 settimana

---

### ✅ Task 2: Sviluppo Home page aziendale
**Titolo:** 02 - Creazione home page aziendale con contenuti e galleria IG

**Descrizione:**
Progettazione e sviluppo della home page pubblica con contenuti aziendali, inclusa una galleria Instagram (API o embedding) per mostrare i lavori svolti. La pagina sarà responsive.

**Obiettivi:**
- Layout responsive per homepage
- Sezioni: Chi siamo, I nostri lavori, Contatti
- Collegamento dinamico o statico ai post Instagram

**Checklist:**
- Creare sezione "Chi siamo" con descrizione dell’azienda
- Progettare layout "I nostri lavori" con immagini IG (o placeholder)
- Collegare Instagram tramite embedding o fetch JSON (opzionale)
- Aggiungere sezione Contatti (anche solo testo/email/telefono)
- Applicare stile CSS coerente tra sezioni
- Test responsive mobile/tablet

👥 Ruoli: frontend  
📅 Durata stimata: 1 settimana

---

### ✅ Task 3: Backend e frontend del preventivatore (Wizard + .md + lock stato)
**Titolo:** 03 - Implementazione preventivatore interattivo con salvataggio Markdown

**Descrizione:**
Creazione dello strumento preventivatore accessibile agli utenti autenticati. Il sistema guida l’utente con una logica wizard per generare preventivi. I preventivi vengono salvati in formato `.md` nel DB e possono essere modificati finché non sono accettati. Dopo l’accettazione, è possibile allegare un PDF della fattura.

**Obiettivi:**
- Wizard di compilazione (multi-step)
- Calcolo preventivo secondo regole logiche (da definire)
- Salvataggio come testo `.md` in MongoDB
- Stato modificabile: bozza, accettato
- Upload PDF fattura solo se accettato
- CRUD base del preventivo (solo in stato modificabile)

**Checklist:**
- Progettare schema MongoDB per preventivi
- Implementare wizard multistep (UI semplice)
- Integrare calcolo automatico e generazione `.md`
- Salvataggio in Mongo + gestione stato
- Bloccare modifiche su `accettato`
- Aggiunta file upload (PDF) in preventivi accettati
- Creare lista visualizzazione + filtri base per utente

👥 Ruoli: fullstack  
📅 Durata stimata: 2-3 settimane

---

### ✅ Task 4: Magazzino e Rubrica Clienti (CRUD semplificato)
**Titolo:** 04 - Implementazione strumenti interni: Magazzino e Rubrica Clienti

**Descrizione:**
Sviluppo delle sezioni interne per la gestione del magazzino materiali (per stampa 3D) e per la gestione contatti dei clienti. Entrambe le sezioni saranno accessibili solo da utenti autenticati. Le operazioni CRUD (creazione, modifica, cancellazione, lettura) saranno disponibili per gli operatori.

**Obiettivi:**
- Struttura dati e modelli MongoDB per magazzino e rubrica
- Interfaccia CRUD semplice con moduli e liste
- Filtro e ricerca per prodotto o cliente
- Possibilità di aggiornare quantità o dati

**Checklist Magazzino:**
- Schema Mongo: prodotto, quantità, marca, costo medio/unità
- UI per aggiunta, modifica, cancellazione item
- Lista con filtri e visualizzazione quantitativi

**Checklist Rubrica:**
- Schema Mongo: nome, cognome, azienda, contatti, note
- UI per CRUD cliente
- Sezione visualizzazione e ricerca contatti

👥 Ruoli: frontend (UI) + fullstack (API)  
📅 Durata stimata: 2 settimane

---

## 🔁 Consigli operativi per il team
- Definire branch strategy (es. `main`, `dev`, `feature/*`)
- Attivare repo Git + CI/CD (es. GitHub + Vercel)
- Aprire Epic su Jira per ogni strumento: `Preventivi`, `Magazzino`, `Rubrica`
- Etichettare i task in Jira: `frontend`, `backend`, `auth`, `ui`, `db`, ecc.
- Scegliere uno stile UI coerente (Tailwind, Material UI, custom)
- Usare AI per generare asset UI ma mantenere struttura semantica HTML/CSS

