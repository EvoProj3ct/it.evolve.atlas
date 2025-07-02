# Next.js Auth App

Questo progetto dimostra una semplice autenticazione con Next.js, MongoDB e bcrypt.

## Script disponibili

- `npm run dev` avvia il server di sviluppo
- `npm run build` crea la build
- `npm start` avvia la build

Imposta le variabili nel file `.env.local` per la connessione a MongoDB e il segreto JWT.
Puoi prendere come riferimento il file `.env.example`.

## Deploy su Vercel

1. Crea un nuovo progetto su Vercel puntando alla cartella `nextjs-auth-app` (vedi `vercel.json`).
2. Nelle impostazioni del progetto definisci le variabili d'ambiente `MONGODB_URI` e `JWT_SECRET`.
3. Avvia la pubblicazione tramite la CLI `vercel` oppure collegando il repository a GitHub.
