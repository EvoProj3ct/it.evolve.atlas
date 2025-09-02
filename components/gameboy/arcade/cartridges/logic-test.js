// logic-runner64.js
// Cartuccia minimal: 64x64, sfondo nero, un quadrato giallo che si muove sempre.
// Frecce = cambi direzione. Se tocca il bordo, respawna dal lato opposto con direzione opposta.

export function createRunner64Logic(opts = {}) {
    // Config base
    const CELLLESS = true;              // non usiamo griglia di celle, muoviamo in px
    const SIZE = Math.max(3, opts.size || 6);      // lato del quadrato
    const SPEED = Math.max(0.2, opts.speed || 0.8); // px/frame
    const TURN_COOLDOWN = 0;                         // niente cooldown: input immediato

    // Palette (4-bit indexed)
    const COL = { BG: 0, YELLOW: 4 };
    const PALETTE_NEON_16 = new Uint8Array([
        0,0,0,255,        // 0 nero (BG)
        0,229,255,255,    // 1 extra ciano
        255,255,255,255,  // 2 bianco
        255,0,255,255,    // 3 magenta
        255,255,0,255,    // 4 giallo (player)
        255,23,68,255,    // 5 rosso
        0,255,163,255,    // 6 menta
        255,102,255,255,  // 7 rosa
        255,145,0,255,    // 8 arancio
        57,255,20,255,    // 9 verde HUD
        138,43,226,255,   // 10 viola
        255,215,0,255,    // 11 oro
        0,255,234,255,    // 12 acqua
        255,61,0,255,     // 13 arancio scuro
        204,204,204,255,  // 14 grigio
        34,34,34,255      // 15 grigio scuro
    ]);

    // Stato runtime
    let api = null;
    let W = 64, H = 64;

    // player: parte da sinistra, già in movimento verso destra
    const player = {
        x: 0, y: 0,         // centro del quadrato
        dx: 1, dy: 0,       // direzione normalizzata in assi (4 direzioni)
        wantDx: 1, wantDy: 0,
        lastTurnAt: 0
    };

    // Helpers ----------------------------------------------------
    function drawSquare(cx, cy, size, col) {
        const half = size >> 1;
        const x0 = Math.floor(cx) - half;
        const y0 = Math.floor(cy) - half;
        for (let y = 0; y < size; y++) {
            const yy = y0 + y;
            if (yy < 0 || yy >= H) continue;
            for (let x = 0; x < size; x++) {
                const xx = x0 + x;
                if (xx < 0 || xx >= W) continue;
                api.writeIndex(xx, yy, col);
            }
        }
    }

    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    function handleInputs(inputQueue, t) {
        for (const ev of inputQueue) {
            if (ev.name === "UP")    { player.wantDx = 0;  player.wantDy = -1; }
            if (ev.name === "DOWN")  { player.wantDx = 0;  player.wantDy =  1; }
            if (ev.name === "LEFT")  { player.wantDx = -1; player.wantDy =  0; }
            if (ev.name === "RIGHT") { player.wantDx = 1;  player.wantDy =  0; }
        }
        // Applica subito la direzione voluta (niente throttling)
        if (TURN_COOLDOWN === 0 || t - player.lastTurnAt >= TURN_COOLDOWN) {
            if (player.dx !== player.wantDx || player.dy !== player.wantDy) {
                player.dx = player.wantDx;
                player.dy = player.wantDy;
                player.lastTurnAt = t;
            }
        }
    }

    function movePlayer() {
        player.x += player.dx * SPEED;
        player.y += player.dy * SPEED;

        // Se il quadrato oltrepassa un bordo, respawna sul lato opposto
        // e inverte la direzione.
        const half = SIZE >> 1;

        // Orizzontale
        if (player.x - half > W) {       // uscito a destra
            player.x = -half;              // ricompare a sinistra
            player.dx = -Math.abs(player.dx); // direzione opposta (verso sinistra)
        } else if (player.x + half < 0) { // uscito a sinistra
            player.x = W + half;           // ricompare a destra
            player.dx = Math.abs(player.dx);  // direzione opposta (verso destra)
        }

        // Verticale
        if (player.y - half > H) {       // uscito in basso
            player.y = -half;              // ricompare in alto
            player.dy = -Math.abs(player.dy); // verso su
        } else if (player.y + half < 0) { // uscito in alto
            player.y = H + half;           // ricompare in basso
            player.dy = Math.abs(player.dy);  // verso giù
        }

        // Evita drift fuori schermo in diagonale (non la usiamo, ma safety)
        player.x = clamp(player.x, -half - 1, W + half + 1);
        player.y = clamp(player.y, -half - 1, H + half + 1);
    }

    function render() {
        // Sfondo nero
        api.fillIndex(COL.BG);
        // Player
        drawSquare(player.x, player.y, SIZE, COL.YELLOW);
    }

    // API per PixelWrapper --------------------------------------
    return {
        init(_api) {
            api = _api;
            // Aspettiamo 64x64 ma supportiamo qualunque risoluzione del wrapper
            W = api.width|0; H = api.height|0;

            // Palette
            api.setPalette(PALETTE_NEON_16);

            // Spawn iniziale: lato sinistro, centro verticale, direzione → destra
            player.x = (SIZE >> 1);        // appena dentro lo schermo
            player.y = Math.floor(H / 2);
            player.dx = 1; player.dy = 0;
            player.wantDx = 1; player.wantDy = 0;
            player.lastTurnAt = 0;
        },

        reset() {
            // Resetta come l’init
            player.x = (SIZE >> 1);
            player.y = Math.floor(H / 2);
            player.dx = 1; player.dy = 0;
            player.wantDx = 1; player.wantDy = 0;
            player.lastTurnAt = 0;
        },

        // update(dtMs, inputQueue): chiamato dal wrapper ad ogni frame
        update(dtMs, inputQueue) {
            handleInputs(inputQueue, performance.now?.() || 0);
            movePlayer();
            render();
        }
    };
}
