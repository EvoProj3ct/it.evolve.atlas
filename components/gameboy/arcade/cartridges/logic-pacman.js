// logic-pacman-pro.js
// Pac‑Man minimale, professionale e “impacchettato” per PixelWrapper (4-bit indexed).
// - Sceglie automaticamente i livelli: 16x16 (128x128) o 20x18 (160x144).
// - Pac-Man parte dal bordo in basso a destra, già in movimento verso sinistra.
// - Fantasma parte dal centro, già in movimento in una direzione valida.
// - Input bufferizzato + turn assist (svolte anticipate).
// - 3 vite con HUD, Game Over + "A = Restart" (score azzerato).

export function createPacmanLogic() {
    // ============ CONFIG ============
    const CELL = 8;            // px per cella (resta 8 per un look "retro")
    const RADIUS = 3;          // semilato per sprite 6x6
    const TURN_WINDOW = 2.25;  // px di anticipo per il turn-assist
    const DOT_SCORE = 10;
    const POWER_SCORE = 50;

    // Colori di palette (16 colori, 4-bit indexed)
    const COL = {
        BG: 0, WALL: 1, DOT: 2, POWER: 3,
        PAC: 4, RED: 5, CYAN: 6, PINK: 7, ORANGE: 8,
        HUD: 9
    };

    // Palette neon
    const PALETTE_NEON_16 = new Uint8Array([
        0,0,0,255,        // 0 nero (BG)
        0,229,255,255,    // 1 ciano (WALL)
        255,255,255,255,  // 2 bianco (DOT / testo)
        255,0,255,255,    // 3 magenta (POWER)
        255,255,0,255,    // 4 giallo (PAC / vite)
        255,23,68,255,    // 5 rosso (ghost)
        0,255,163,255,    // 6 cyan/menta
        255,102,255,255,  // 7 rosa
        255,145,0,255,    // 8 arancio
        57,255,20,255,    // 9 verde HUD
        138,43,226,255,   // 10 extra
        255,215,0,255,    // 11 extra
        0,255,234,255,    // 12 extra
        255,61,0,255,     // 13 extra
        204,204,204,255,  // 14 extra
        34,34,34,255      // 15 extra
    ]);

    // Font 3x5 cifre e poche lettere (GAME OVER / A)
    const FONT3x5 = {
        "0":["111","101","101","101","111"], "1":["010","110","010","010","111"],
        "2":["111","001","111","100","111"], "3":["111","001","111","001","111"],
        "4":["101","101","111","001","001"], "5":["111","100","111","001","111"],
        "6":["111","100","111","101","111"], "7":["111","001","010","010","010"],
        "8":["111","101","111","101","111"], "9":["111","101","111","001","111"],
        "A":["010","101","111","101","101"], "E":["111","100","111","100","111"],
        "G":["111","100","101","101","111"], "M":["101","111","111","101","101"],
        "O":["111","101","101","101","111"], "R":["110","101","110","101","101"],
        "V":["101","101","101","101","010"], " ":[ "000","000","000","000","000" ]
    };

    // ---- Livelli 16x16 (consigliato per 128x128) ----
    const LEVELS_16 = [
        [
            "WWWWWWWWWWWWWWWW",
            "W..............W",
            "W.WWWW.WWWW.WW.W",
            "W.W..W....W....W",
            "W.WW.W.WW.W.WW.W",
            "W....W.W..W....W",
            "W.WWWW.WW.W.WW.W",
            "W......W..W....W",
            "W.WWWW.WW.W.WW.W",
            "W....W....W....W",
            "W.WW.W.WWWW.WW.W",
            "W.W..W......W..W",
            "W.WW.W.WWWW.WW.W",
            "W..............W",
            "W..............W",
            "WWWWWWWWWWWWWWWW",
        ],
        [
            "WWWWWWWWWWWWWWWW",
            "W..O..........OW",
            "W.WWWW.WWWW.WW.W",
            "W.W..W....W....W",
            "W.WW.W.WW.W.WW.W",
            "W....W.W..W....W",
            "WWW.WW.WW.W.WW.W",
            "W....W..GG..W..W", // i 'G' non sono usati per lo spawn, ma restano dots
            "W.W.WWWW.WWWW.WW",
            "W.W....W..P..W.W", // idem 'P'
            "W.WWWW.WWWW.W..W",
            "W....W......W..W",
            "W.WW.W.WWWW.WW.W",
            "W..O........O..W",
            "W..............W",
            "WWWWWWWWWWWWWWWW",
        ],
        [
            "WWWWWWWWWWWWWWWW",
            "W.O..........O.W",
            "W.WWWWW.WWWW.W.W",
            "W.W....W....W..W",
            "W.W.WW.W.WW.WW.W",
            "W...W..W..W..W.W",
            "WWW.WW.WW.WW.W.W",
            "W...W........W.W",
            "W.W.WW.WWWW.WW.W",
            "W.W....W....W..W",
            "W.WWWWW.WWWW.W.W",
            "W....W......W..W",
            "W.WW.W.WWWW.WW.W",
            "W..O........O..W",
            "W..............W",
            "WWWWWWWWWWWWWWWW",
        ],
    ];

    // ---- Livelli 20x18 (per 160x144) ----
    const LEVELS_20x18 = [
        [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..................W",
            "W.WWWW.WWWWWW.WWWW.W",
            "W.O..W........W..O.W",
            "W.WW.W.WWWWWW.W.WW.W",
            "W....W...WW...W....W",
            "W.WWWW.W.WW.W.WWWW.W",
            "W......W....W......W",
            "W.WWWW.W.WWWW.WWWW.W",
            "W......W....W......W",
            "W.WWWW.WWWWWW.WWWW.W",
            "W....W........W....W",
            "W.WW.W.WWWWWW.W.WW.W",
            "W.O..W........W..O.W",
            "W.WWWW.WWWWWW.WWWW.W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
        ],
        [
            "WWWWWWWWWWWWWWWWWWWW",
            "W..O..............OW",
            "W.WWWW.WWWWWWWW.WW.W",
            "W.W..W....WW....W..W",
            "W.WW.W.WW.WW.WW.WW.W",
            "W....W.W......W.W..W",
            "WWW.WW.W.WWWW.W.WW.W",
            "W...W..W..GG..W..W.W",
            "W.W.WWWW.WWWWWW.W.WW",
            "W.W....W......W...WW",
            "W.WWWW.WWWWWWWW.W..W",
            "W....W..........W..W",
            "W.WW.W.WWWWWWWW.WW.W",
            "W..O.W..........O..W",
            "W.WWWW.WWWWWWWW.WW.W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
        ],
        [
            "WWWWWWWWWWWWWWWWWWWW",
            "W.O..............O.W",
            "W.WWWWW.WWWWWW.WWW.W",
            "W.W....W......W....W",
            "W.W.WW.W.WWWW.W.WW.W",
            "W...W..W..WW..W..W.W",
            "WWW.WW.WW.WW.WW.WW.W",
            "W...W..........W..W",
            "W.W.WW.WWWWWWWW.WW.W",
            "W.W....W......W....W",
            "W.WWWWW.WWWWWW.WWW.W",
            "W....W..........W..W",
            "W.WW.W.WWWWWWWW.WW.W",
            "W.O..W..........O..W",
            "W.WWWW.WWWWWWWW.WW.W",
            "W..................W",
            "W..................W",
            "WWWWWWWWWWWWWWWWWWWW",
        ],
    ];

    // ============ STATO ============
    let api = null;
    let GRID_W = 16, GRID_H = 16;      // in celle
    let WIDTH = GRID_W * CELL, HEIGHT = GRID_H * CELL;
    let LEVELS = LEVELS_16;

    let levelIndex = 0;
    let score = 0;
    let lives = 3;
    let pelletsLeft = 0;
    let gameOver = false;

    // Velocità lente, controllabili (px/frame)
    let PAC_SPEED = 0.9;
    let GHOST_SPEED = 0.8;

    const pac = { x:0,y:0,dirX:-1,dirY:0,wantX:-1,wantY:0, spawnX:0,spawnY:0, mouth:0 };
    const ghost = { x:0,y:0,dirX:1,dirY:0, spawnX:0,spawnY:0, color: COL.RED };

    // Layer statico per i muri (ottimizzazione)
    let mazeLayer = null; // Uint8Array|undefined (copia rapida nel buffer)

    // ============ HELPERS ============
    const tx = px => Math.floor(px / CELL);
    const ty = py => Math.floor(py / CELL);
    const cx = t => t * CELL + CELL / 2;
    const cy = t => t * CELL + CELL / 2;

    const inBounds = (tx0, ty0) => tx0 >= 0 && tx0 < GRID_W && ty0 >= 0 && ty0 < GRID_H;
    let map = []; // array di array di char
    const getTile = (tx0, ty0) => inBounds(tx0, ty0) ? map[ty0][tx0] : "W";
    const setTile = (tx0, ty0, ch) => { if (inBounds(tx0, ty0)) map[ty0][tx0] = ch; };
    const isWall = (tx0, ty0) => getTile(tx0, ty0) === "W";

    function availableDirsAt(tx0, ty0) {
        const out = [];
        if (!isWall(tx0+1, ty0)) out.push({x:1,y:0});
        if (!isWall(tx0-1, ty0)) out.push({x:-1,y:0});
        if (!isWall(tx0, ty0+1)) out.push({x:0,y:1});
        if (!isWall(tx0, ty0-1)) out.push({x:0,y:-1});
        return out;
    }
    const isOpp = (ax,ay,bx,by) => ax === -bx && ay === -by;

    // Disegno base
    function drawRect(x0,y0,w,h,col) {
        for (let y=0;y<h;y++) {
            const yy=y0+y;
            for (let x=0;x<w;x++) api.writeIndex(x0+x, yy, col);
        }
    }
    function drawDotCenter(tx0, ty0, size, col) {
        const x0 = cx(tx0) - (size>>1);
        const y0 = cy(ty0) - (size>>1);
        drawRect(x0, y0, size, size, col);
    }
    function drawDigit3x5(x,y,ch,col) {
        const g = FONT3x5[String(ch)];
        if (!g) return;
        for (let r=0;r<5;r++) {
            const row = g[r];
            for (let c=0;c<3;c++) if (row[c]==="1") api.writeIndex(x+c, y+r, col);
        }
    }
    function drawText3x5(x,y,str,col) {
        for (let i=0;i<str.length;i++) drawDigit3x5(x+i*4, y, str[i], col);
    }
    function drawNumber3x5(x,y,n,col) { drawText3x5(x,y,String(n),col); }

    // ============ MOVIMENTO ============
    function atCellCenter(px, py) {
        const ccx = Math.round(px / CELL) * CELL + CELL/2;
        const ccy = Math.round(py / CELL) * CELL + CELL/2;
        return Math.abs(px - ccx) <= 0.9 && Math.abs(py - ccy) <= 0.9;
    }
    function tryBufferedTurn(entity, wantX, wantY) {
        const tx0 = tx(entity.x), ty0 = ty(entity.y);
        const ccx = cx(tx0), ccy = cy(ty0);
        const near = Math.abs(entity.x - ccx) <= TURN_WINDOW && Math.abs(entity.y - ccy) <= TURN_WINDOW;
        if (!near) return false;
        const nx = tx0 + wantX, ny = ty0 + wantY;
        if (!isWall(nx, ny)) {
            entity.x = ccx; entity.y = ccy;
            entity.dirX = wantX; entity.dirY = wantY;
            return true;
        }
        return false;
    }
    function chooseFallback(entity, preferX, preferY) {
        const tx0 = tx(entity.x), ty0 = ty(entity.y);
        const opts = availableDirsAt(tx0, ty0);
        if (!opts.length) return false;

        // 1) preferita (input)
        let pick = opts.find(d => d.x===preferX && d.y===preferY);
        // 2) avanti
        if (!pick) pick = opts.find(d => d.x===entity.dirX && d.y===entity.dirY);
        // 3) non invertire se possibile
        if (!pick) {
            const nonRev = opts.filter(d => !isOpp(d.x,d.y,entity.dirX,entity.dirY));
            pick = (nonRev.length ? nonRev : opts)[0];
        }
        entity.dirX = pick.x; entity.dirY = pick.y;
        return true;
    }
    function stepEntity(entity, speed, wantX=0, wantY=0) {
        // turn assist + turn preciso al centro
        tryBufferedTurn(entity, wantX, wantY);
        if (atCellCenter(entity.x, entity.y)) tryBufferedTurn(entity, wantX, wantY);

        // muovi (se blocco, scegli alternativa)
        const nx = entity.x + entity.dirX * speed;
        const ny = entity.y + entity.dirY * speed;
        const fwdWall =
            isWall(tx(nx + Math.sign(entity.dirX)*RADIUS), ty(ny)) ||
            isWall(tx(nx), ty(ny + Math.sign(entity.dirY)*RADIUS));

        if (fwdWall) {
            const txx = tx(entity.x), tyy = ty(entity.y);
            entity.x = cx(txx); entity.y = cy(tyy);
            chooseFallback(entity, wantX, wantY);
        } else {
            entity.x = nx; entity.y = ny;
        }

        // tunnel wrap orizzontale
        if (entity.x < -4) entity.x = WIDTH + 4;
        if (entity.x > WIDTH + 4) entity.x = -4;
    }

    function ghostDecide(g) {
        if (!atCellCenter(g.x, g.y)) return;
        const txx = tx(g.x), tyy = ty(g.y);
        const opts = availableDirsAt(txx, tyy);
        if (!opts.length) return;
        const cand = opts.filter(d => !isOpp(d.x,d.y,g.dirX,g.dirY));
        const pool = cand.length ? cand : opts;

        // scegli in base alla distanza (chase semplice)
        let best = pool[0], bestScore = -Infinity;
        for (const d of pool) {
            const nx = cx(txx + d.x), ny = cy(tyy + d.y);
            const dist = Math.abs(nx - pac.x) + Math.abs(ny - pac.y);
            const score = -dist;
            if (score > bestScore) { bestScore = score; best = d; }
        }
        // un pizzico di random per variare
        if (Math.random() < 0.12 && pool.length > 1) best = pool[(Math.random()*pool.length)|0];
        g.dirX = best.x; g.dirY = best.y;
    }

    // ============ LEVEL / SPAWN ============
    function buildMazeLayer() {
        // muro → colore WALL, resto → BG
        const N = WIDTH * HEIGHT;
        const bg = new Uint8Array(N); // parte tutta a 0 (BG)
        for (let y=0; y<GRID_H; y++) for (let x=0; x<GRID_W; x++) {
            if (map[y][x] !== "W") continue;
            const x0 = x*CELL, y0 = y*CELL;
            for (let j=0;j<CELL;j++) {
                let o = (y0+j)*WIDTH + x0;
                for (let i=0;i<CELL;i++,o++) bg[o] = COL.WALL;
            }
        }
        return bg;
    }

    function pickBottomRightFreeCell() {
        for (let y=GRID_H-2; y>=1; y--) {
            for (let x=GRID_W-2; x>=1; x--) {
                if (getTile(x,y) === " ") return {x, y};
            }
        }
        return { x: GRID_W-2, y: GRID_H-2 };
    }

    function pickCenterFreeCell() {
        const cx0 = Math.floor(GRID_W/2), cy0 = Math.floor(GRID_H/2);
        let best = null, bestD = Infinity;
        for (let y=1;y<GRID_H-1;y++) for (let x=1;x<GRID_W-1;x++) {
            if (getTile(x,y) !== " ") continue;
            const d = Math.abs(x-cx0) + Math.abs(y-cy0);
            if (d < bestD) { bestD = d; best = {x,y}; }
        }
        return best || {x:cx0,y:cy0};
    }

    function loadLevel(idx) {
        const rows = LEVELS[idx % LEVELS.length];
        map = rows.map(r => r.split(""));

        // conta pellet
        pelletsLeft = 0;
        for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) {
            const ch = map[y][x];
            if (ch === "." || ch === "O") pelletsLeft++;
        }

        // Pac-Man: spawn in basso a destra (cella libera), già in movimento verso sinistra
        const p = pickBottomRightFreeCell();
        pac.spawnX = cx(p.x); pac.spawnY = cy(p.y);
        pac.x = pac.spawnX; pac.y = pac.spawnY;
        pac.dirX = -1; pac.dirY = 0; pac.wantX = -1; pac.wantY = 0; pac.mouth = 0;

        // Fantasma: centro (cella libera più vicina al centro), direzione valida
        const g = pickCenterFreeCell();
        ghost.spawnX = cx(g.x); ghost.spawnY = cy(g.y);
        ghost.x = ghost.spawnX; ghost.y = ghost.spawnY; ghost.color = COL.RED;
        // scegli subito una direzione non-muro
        const opts = availableDirsAt(g.x, g.y);
        const pick = opts[0] || {x:1,y:0};
        ghost.dirX = pick.x; ghost.dirY = pick.y;

        // Precostruisci layer muri
        mazeLayer = buildMazeLayer();
    }

    function resetAll() {
        score = 0; lives = 3; gameOver = false; levelIndex = 0;
        loadLevel(levelIndex);
    }
    function nextLevel() {
        levelIndex = (levelIndex + 1) % LEVELS.length;
        loadLevel(levelIndex);
    }

    // ============ GAME STEP ============
    function eatPelletUnderPac() {
        const tx0 = tx(pac.x), ty0 = ty(pac.y);
        const ch = getTile(tx0, ty0);
        if (ch === ".") { setTile(tx0, ty0, " "); pelletsLeft--; score += DOT_SCORE; }
        else if (ch === "O") { setTile(tx0, ty0, " "); pelletsLeft--; score += POWER_SCORE; }
    }

    function checkCollisions() {
        const dx = ghost.x - pac.x, dy = ghost.y - pac.y;
        if ((dx*dx + dy*dy) <= (RADIUS*RADIUS)*4) {
            // morte
            lives--;
            if (lives > 0) {
                // respawn pac al suo spawn (sempre in movimento)
                pac.x = pac.spawnX; pac.y = pac.spawnY;
                pac.dirX = -1; pac.dirY = 0; pac.wantX = -1; pac.wantY = 0;
            } else {
                gameOver = true;
            }
        }
    }

    function stepGame(inputQueue) {
        if (gameOver) {
            // ascolta solo A per restart
            for (const ev of inputQueue) if (ev.name === "A") { resetAll(); }
            return;
        }
        // input bufferizzato (dir desiderata)
        for (const ev of inputQueue) {
            if (ev.name === "UP")    { pac.wantX=0;  pac.wantY=-1; }
            if (ev.name === "DOWN")  { pac.wantX=0;  pac.wantY= 1; }
            if (ev.name === "LEFT")  { pac.wantX=-1; pac.wantY= 0; }
            if (ev.name === "RIGHT") { pac.wantX=1;  pac.wantY= 0; }
        }

        // movimento continuo
        pac.mouth++;
        stepEntity(pac, PAC_SPEED, pac.wantX, pac.wantY);
        ghostDecide(ghost);
        stepEntity(ghost, GHOST_SPEED, 0, 0);

        eatPelletUnderPac();
        checkCollisions();

        if (pelletsLeft <= 0) nextLevel();
    }

    // ============ RENDER ============
    function renderAll() {
        // sfondo: copia layer muri e poi disegna elementi (copia rapida in buffer)
        const buf = api.getBuffer();
        if (mazeLayer && buf && buf.length === mazeLayer.length) buf.set(mazeLayer);
        else api.fillIndex(COL.BG);

        // pellet
        for (let y=0;y<GRID_H;y++) for (let x=0;x<GRID_W;x++) {
            const ch = map[y][x];
            if (ch === ".") drawDotCenter(x,y,2,COL.DOT);
            if (ch === "O") drawDotCenter(x,y,4,COL.POWER);
        }

        // pac
        drawRect(Math.floor(pac.x)-RADIUS, Math.floor(pac.y)-RADIUS, RADIUS*2, RADIUS*2, COL.PAC);
        // bocca (taglio nero)
        const open = (Math.floor(pac.mouth/6)%2) ? 1 : 2;
        if (pac.dirX>0)  drawRect(Math.floor(pac.x)+RADIUS-1, Math.floor(pac.y)-open, 1, open*2+1, COL.BG);
        if (pac.dirX<0)  drawRect(Math.floor(pac.x)-RADIUS,   Math.floor(pac.y)-open, 1, open*2+1, COL.BG);
        if (pac.dirY>0)  drawRect(Math.floor(pac.x)-open, Math.floor(pac.y)+RADIUS-1, open*2+1,1, COL.BG);
        if (pac.dirY<0)  drawRect(Math.floor(pac.x)-open, Math.floor(pac.y)-RADIUS,   open*2+1,1, COL.BG);

        // ghost
        drawRect(Math.floor(ghost.x)-RADIUS, Math.floor(ghost.y)-RADIUS, RADIUS*2, RADIUS*2, ghost.color);

        // HUD: score (sx), level (dx), vite (sotto lo score)
        drawNumber3x5(2, 2, score, COL.HUD);
        drawDigit3x5(WIDTH-8, 2, (levelIndex%LEVELS.length)+1, COL.HUD);

        for (let i=0;i<lives;i++) {
            drawRect(2 + i*8, 10, 6, 6, COL.PAC);
        }

        if (gameOver) {
            // overlay "GAME OVER" + punteggio + A=RESTART
            const text = "GAME OVER";
            const x = Math.floor(WIDTH/2 - (text.length*4-1)/2);
            drawText3x5(x, Math.floor(HEIGHT/2 - 8), text, COL.DOT);
            const s = String(score);
            const x2 = Math.floor(WIDTH/2 - (s.length*4-1)/2);
            drawNumber3x5(x2, Math.floor(HEIGHT/2 + 2), score, COL.DOT);
            drawText3x5(Math.floor(WIDTH/2 - 4), Math.floor(HEIGHT/2 + 12), "A", COL.DOT);
        }
    }

    // ============ MENU (START) ============
    function installGameMenu() {
        if (!api.configureGameMenu) return;
        api.configureGameMenu({
            title: `PacPro L${(levelIndex%LEVELS.length)+1}`,
            items: [
                { label: "Resume",  value: "resume"  },
                { label: "Restart", value: "restart" },
                { label: "Next",    value: "next"    },
            ],
            onSelect: (value) => {
                if (value === "restart") { resetAll(); installGameMenu(); return "close"; }
                if (value === "next")    { nextLevel(); installGameMenu();  return "close"; }
                return "close";
            }
        });
    }

    // ============ API ============
    return {
        init(_api) {
            api = _api;

            // adatta alla risoluzione del wrapper
            GRID_W = Math.floor(api.width / CELL);
            GRID_H = Math.floor(api.height / CELL);
            WIDTH = GRID_W * CELL;
            HEIGHT = GRID_H * CELL;

            // seleziona il pacchetto livelli coerente
            if (GRID_W === 20 && GRID_H === 18) LEVELS = LEVELS_20x18;
            else LEVELS = LEVELS_16;

            // palette neon
            api.setPalette(PALETTE_NEON_16);

            resetAll();
            installGameMenu();
        },

        reset() { resetAll(); installGameMenu(); },

        update(_dtMs, inputQueue) {
            stepGame(inputQueue);
            renderAll();
        }
    };
}
