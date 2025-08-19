This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev        # avvio in sviluppo
npm run build      # build produzione
npm run start      # avvio produzione
npm run lint       # eslint
npm run test       # unit test
npm run test:e2e   # test end-to-end
npm run seed:admin # crea utente admin iniziale
```
Before starting the server remember to configure the required environment variables. Copy `.env.example` to `.env.local` and update `MONGODB_URI` with your Mongo connection string.
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# PROJECT_GUIDE

## 📌 Scopo del progetto
La webapp **Evolve** è il sito aziendale ufficiale con due anime:
- **Parte pubblica**: homepage con sezioni istituzionali (Chi siamo, Lavori, Contatti).
- **Parte privata (area operatori)**: strumenti interni per i dipendenti (preventivi, magazzino, rubrica).

Stack principale: **Next.js + MongoDB Atlas + NextAuth**.

---

- **RBAC (Role Based Access Control):**
    - `admin`: accesso completo
    - `operator`: accesso agli strumenti, esclusa gestione utenti

- **Sicurezza**: middleware di protezione, validazioni input, gestione sessioni sicura.

---

## 🔑 Variabili d’ambiente
Crea un file `.env.local` con:
```
MONGODB_URI="mongodb+srv://..."
NEXTAUTH_SECRET="super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Script utile: `seed:admin` per creare l’utente admin iniziale.

---

## 🗂️ Modelli dati principali
- **Preventivo**:
  ```json
  {
    "_id": "...",
    "customerRef": "...",
    "title": "...",
    "steps": [],
    "total": 0,
    "markdown": "...",
    "state": "bozza|accettato",
    "invoicePdfUrl": null,
    "createdBy": "...",
    "updatedAt": "..."
  }
  ```

- **MagazzinoItem**:
  ```json
  {
    "_id": "...",
    "name": "PLA bianco",
    "brand": "Bambu Lab",
    "qty": 20,
    "unitCost": 18.5,
    "notes": "..."
  }
  ```

- **Contatto**:
  ```json
  {
    "_id": "...",
    "firstName": "Mario",
    "lastName": "Rossi",
    "company": "Cliente Srl",
    "email": "mario@example.com",
    "phone": "+39...",
    "notes": "..."
  }
  ```

---

## 🚀 Roadmap (step ~2 settimane)
### Step 1 — Setup fullstack & login
- Inizializzare Next.js
- Configurare MongoDB Atlas
- Setup NextAuth con provider Credentials
- Creare utente admin
- Implementare login + dashboard privata

### Step 2 — Home page pubblica
- Sezioni: Chi siamo, Lavori (IG embed/placeholder), Contatti
- Layout responsive
- Test accessibilità e performance (Lighthouse >90)

### Step 3 — Preventivatore
- Wizard multistep con logica di calcolo
- Salvataggio `.md` su MongoDB
- Stati: bozza / accettato
- Upload PDF solo su `accettato`
- Lista + filtri preventivi

### Step 4 — Magazzino + Rubrica
- CRUD completo con ricerca e filtri
- Audit di base (createdAt/updatedAt/user)
- UI semplice e funzionale

---
