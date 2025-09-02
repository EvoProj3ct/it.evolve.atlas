// logic-pong.js
// Pong minimalista per PixelWrapper (modalità consigliata: indexed 2bpp).
// Controlli:
// - Frecce ↑/↓: muovi paddle destro
// - A: rimette in gioco la palla (serve)
// - B: azzera punteggi
// - START: apre il MENU di GIOCO (gestito dal wrapper, ma definito qui via api.configureGameMenu)
// - SELECT: apre menu Impostazioni (reset/mostra info), gestito dal wrapper

export function createPongLogic() {
    // Stato “global” della logica
    let api, W, H;

    // Palla
    let px, py, vx, vy, speed, ballSize;

    // Paddle
    let padH, padW, padMargin;
    let pLeftY, pRightY;

    // Punteggio
    let scoreL, scoreR;

    // Colori (indexed 2bpp: 0..3)
    const C_BG = 0, C_NET = 1, C_PAD = 2, C_BALL = 3;

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function serve(toRight) {
        px = (W / 2) | 0;
        py = (H / 2) | 0;
        vx = (toRight ? 1 : -1) * speed;
        vy = (Math.random() * 2 - 1) * speed * 0.6;
    }

    function drawVLine(x, y0, y1, col) {
        for (let y = y0; y <= y1; y++) api.writeIndex(x, y, col);
    }
    function fillRect(x, y, w, h, col) {
        for (let j = 0; j < h; j++) {
            const yy = y + j; if (yy < 0 || yy >= H) continue;
            for (let i = 0; i < w; i++) {
                const xx = x + i; if (xx < 0 || xx >= W) continue;
                api.writeIndex(xx, yy, col);
            }
        }
    }

    // Mini font 3x5 per punteggi
    const DIGITS = {
        "0":["111","101","101","101","111"],
        "1":["010","110","010","010","111"],
        "2":["111","001","111","100","111"],
        "3":["111","001","111","001","111"],
        "4":["101","101","111","001","001"],
        "5":["111","100","111","001","111"],
        "6":["111","100","111","101","111"],
        "7":["111","001","010","010","010"],
        "8":["111","101","111","101","111"],
        "9":["111","101","111","001","111"],
    };
    function drawDigit(x, y, d, col) {
        const g = DIGITS[String(d)];
        if (!g) return;
        for (let r = 0; r < 5; r++) {
            const row = g[r];
            for (let c = 0; c < 3; c++) {
                if (row[c] === "1") api.writeIndex(x + c, y + r, col);
            }
        }
    }

    // --- RESET (condizione di reset per TUTTI i giochi) ---
    function resetInternal() {
        W = api.width; H = api.height;

        // parametri
        speed = 1.2;
        ballSize = 2;

        padH = 18;
        padW = 2;
        padMargin = 3;

        // posizioni iniziali
        pLeftY = (H - padH) / 2;
        pRightY = (H - padH) / 2;

        // punteggi
        scoreL = 0; scoreR = 0;

        // sfondo pulito
        api.fillIndex(C_BG);

        // serve iniziale casuale
        serve(Math.random() < 0.5);
    }

    return {
        // --- chiamata dal wrapper quando la cartuccia viene “inserita” ---
        init(_api) {
            api = _api;
            resetInternal();

            // Aggancio il MENU di GIOCO (aperto con START dal wrapper).
            // Qui definisco le voci e cosa succede quando seleziono.
            api.configureGameMenu({
                title: "Pong",
                items: [
                    { label: "Resume",  value: "resume"  },     // torna al gioco
                    { label: "Restart", value: "restart" },     // resetta
                ],
                onSelect: (value) => {
                    if (value === "restart") {
                        this.reset(api);     // chiama il reset della logica
                        return "close";
                    }
                    // "resume" o altro → chiudi il menu
                    return "close";
                },
                onOpen: () => { /* opzionale: suono/pause FX */ },
                onClose: () => { /* opzionale */ },
            });
        },

        // --- RESET pubblico usato dal Settings Menu o dal Game Menu ---
        reset() {
            resetInternal();
        },

        // --- step logico a timestep fisso (chiamato dal wrapper) ---
        update(dtMs, inputQueue) {
            // Input giocatore (paddle destro)
            for (const ev of inputQueue) {
                if (ev.name === "UP")   pRightY -= 18.4;
                if (ev.name === "DOWN") pRightY += 18.4;
                if (ev.name === "A")    serve(vx <= 0);              // rimette la palla
                if (ev.name === "B")    { scoreL = scoreR = 0; }     // azzera punteggi
            }
            pRightY = clamp(pRightY, 0, H - padH);

            // AI semplice (paddle sinistro)
            const target = clamp(py - padH / 2, 0, H - padH);
            pLeftY += (target - pLeftY) * 0.12;

            // Fisica palla
            px += vx; py += vy;

            // rimbalzi alto/basso
            if (py < 0)        { py = 0;        vy = Math.abs(vy); }
            if (py >= H - 2)   { py = H - 2;    vy = -Math.abs(vy); }

            // collisione con paddles
            const pRx = W - padMargin - padW; // destro
            if (px + ballSize >= pRx && px <= pRx + padW) {
                if (py + ballSize >= pRightY && py <= pRightY + padH) {
                    px = pRx - ballSize; vx = -Math.abs(vx) - 0.05; // piccola accelerazione
                    const rel = ((py + ballSize/2) - (pRightY + padH/2)) / (padH/2);
                    vy += rel * 0.6;
                }
            }
            const pLx = padMargin; // sinistro
            if (px <= pLx + padW && px + ballSize >= pLx) {
                if (py + ballSize >= pLeftY && py <= pLeftY + padH) {
                    px = pLx + padW; vx = Math.abs(vx) + 0.05;
                    const rel = ((py + ballSize/2) - (pLeftY + padH/2)) / (padH/2);
                    vy += rel * 0.6;
                }
            }

            // punto segnato
            if (px < -4)  { scoreR++; serve(false); }
            if (px > W+4) { scoreL++; serve(true); }

            // --- draw ---
            api.fillIndex(C_BG);

            // rete tratteggiata
            for (let y = 0; y < H; y += 4) drawVLine(W>>1, y, y+1, C_NET);

            // paddles
            fillRect(padMargin, pLeftY|0, padW, padH|0, C_PAD);
            fillRect(W - padMargin - padW, pRightY|0, padW, padH|0, C_PAD);

            // palla
            fillRect(px|0, py|0, ballSize, ballSize, C_BALL);

            // punteggi
            drawDigit((W>>1) - 10, 2, scoreL % 10, C_NET);
            drawDigit((W>>1) + 7,  2, scoreR % 10, C_NET);
        }
    };
}
