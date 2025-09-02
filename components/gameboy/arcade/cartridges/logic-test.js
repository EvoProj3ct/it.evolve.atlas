// logic-runner64-thickmaze-4x4.js
// 64x64 — Maze a blocchi 4x4: corridoi 4px, muri 4px (player 4x4 calza perfetto).
// Frecce: cambia direzione; movimento continuo (lento).
// Wrap+inversione ai varchi bordo. A: proiettile 1px che si distrugge sui muri.
// START: selezione maze (seeds).

export function createRunner64Logic(opts = {}) {
    // ── CONFIG ──────────────────────────────────────────────────────────────────
    const W_EXPECTED = 64, H_EXPECTED = 64;

    // taglia dei blocchi (corridoio e muro hanno spessore di 1 "tile" = 4px)
    const TILE = 4;                           // 64 / 4 = 16 tiles per lato
    const GTW = W_EXPECTED / TILE;            // 16 (griglia "tile")
    const GTH = H_EXPECTED / TILE;            // 16

    // player 4x4
    const PLAYER_SIZE = 4;                    // px (esattamente la larghezza del corridoio)
    const PLAYER_SPEED = opts.playerSpeed ?? 0.6;   // px/frame (sensibilmente più lento)
    const BULLET_SPEED = opts.bulletSpeed ?? 1.5;   // px/frame
    const FIRE_COOLDOWN = opts.fireCooldown ?? 10;  // frame

    // palette 4-bit
    const COL = { BG: 0, WALL: 14, PLAYER: 4 };
    const PALETTE = new Uint8Array([
        0,0,0,255,        // 0 BG
        0,229,255,255,    // 1
        255,255,255,255,  // 2
        255,0,255,255,    // 3
        255,255,0,255,    // 4 PLAYER (giallo)
        255,23,68,255,    // 5
        0,255,163,255,    // 6
        255,102,255,255,  // 7
        255,145,0,255,    // 8
        57,255,20,255,    // 9
        138,43,226,255,   // 10
        255,215,0,255,    // 11
        0,255,234,255,    // 12
        255,61,0,255,     // 13
        204,204,204,255,  // 14 WALL (grigio)
        34,34,34,255      // 15
    ]);

    // ── STATO ───────────────────────────────────────────────────────────────────
    let api = null, W = 64, H = 64;

    // mappa “a blocchi” (tile): griglia 16x16 di char 'W' (muro) o ' ' (corridoio)
    let gmap = null;
    // bitmap pixel di muri/corridoi (1 = muro, 0 = corridoio)
    let wallBits = null;     // Uint8Array(W*H)
    let mazeLayer = null;    // Uint8Array(W*H) già colorata (WALL/BG)

    // player 4x4
    const player = { x: 0, y: 0, dx: -1, dy: 0, wantDx: -1, wantDy: 0, fireCd: 0 };

    // proiettili 1px
    const bullets = []; // {x,y,dx,dy}

    // seeds per menu START
    let mazeIndex = 0;
    const seeds = [0xA11CE, 0xBADA55, 0xC0FFEE, 0xDEAD10C];

    // ── RNG deterministico ──────────────────────────────────────────────────────
    function makeRng(seed) {
        let s = (seed >>> 0) || 1;
        return () => {
            s ^= s << 13; s >>>= 0;
            s ^= s >> 17; s >>>= 0;
            s ^= s << 5;  s >>>= 0;
            return (s >>> 0) / 0xFFFFFFFF;
        };
    }

    // ── UTILS PIXEL/TILE ────────────────────────────────────────────────────────
    const inBoundsPx = (x,y) => x >= 0 && x < W && y >= 0 && y < H;
    const idxPx = (x,y) => y * W + x;

    const tileToPx = (tx, ty) => ({ x: tx * TILE, y: ty * TILE });
    const pxToTile = (px, py) => ({ tx: (px / TILE) | 0, ty: (py / TILE) | 0 });

    // collisione AABB con muri (usa wallBits)
    function rectOverlapsWall(x0, y0, w, h) {
        // campiona perimetro
        for (let x = x0; x < x0 + w; x++) {
            if (!inBoundsPx(x, y0) || wallBits[idxPx(x, y0)]) return true;
            if (!inBoundsPx(x, y0 + h - 1) || wallBits[idxPx(x, y0 + h - 1)]) return true;
        }
        for (let y = y0; y < y0 + h; y++) {
            if (!inBoundsPx(x0, y) || wallBits[idxPx(x0, y)]) return true;
            if (!inBoundsPx(x0 + w - 1, y) || wallBits[idxPx(x0 + w - 1, y)]) return true;
        }
        return false;
    }

    // ── GENERAZIONE MAZE A BLOCCHI 4x4 ─────────────────────────────────────────
    // Griglia 16x16: celle ai tile a indici dispari, muri ai tile pari; DFS per scavare.
    function generateMazeBlocks(seed) {
        const rnd = makeRng(seed);

        // inizializza griglia di tile: tutto muro
        gmap = Array.from({ length: GTH }, () => Array(GTW).fill('W'));

        // helper per “celle” (indici dispari)
        const visited = Array.from({ length: GTH }, () => Array(GTW).fill(0));

        // scegli cella di partenza (dispari)
        const start = {
            tx: (Math.floor(rnd() * ((GTW - 1) / 2)) * 2 + 1) | 0,
            ty: (Math.floor(rnd() * ((GTH - 1) / 2)) * 2 + 1) | 0
        };
        gmap[start.ty][start.tx] = ' '; visited[start.ty][start.tx] = 1;

        const stack = [start];
        const DIRS = [ {dx:0,dy:-2}, {dx:0,dy:2}, {dx:-2,dy:0}, {dx:2,dy:0} ];

        function shuffle(a) {
            for (let i=a.length-1;i>0;i--) {
                const j = (rnd()*(i+1))|0;
                const t = a[i]; a[i]=a[j]; a[j]=t;
            }
        }

        while (stack.length) {
            const cur = stack[stack.length - 1];
            const dirs = DIRS.slice(); shuffle(dirs);
            let carved = false;

            for (const d of dirs) {
                const nx = cur.tx + d.dx, ny = cur.ty + d.dy;
                if (nx <= 0 || nx >= GTW-1 || ny <= 0 || ny >= GTH-1) continue;
                if (visited[ny][nx]) continue;

                // scava muro tra celle (tile pari a metà) + cella nuova
                const bx = cur.tx + (d.dx >> 1);
                const by = cur.ty + (d.dy >> 1);
                gmap[by][bx] = ' ';
                gmap[ny][nx] = ' ';
                visited[ny][nx] = 1;
                stack.push({ tx: nx, ty: ny });
                carved = true;
                break;
            }
            if (!carved) stack.pop();
        }

        // varchi ai bordi (su tile a indice dispari)
        const randOddX = () => (1 + 2 * ((rnd() * ((GTW - 1) / 2)) | 0));
        const randOddY = () => (1 + 2 * ((rnd() * ((GTH - 1) / 2)) | 0));
        gmap[0][randOddX()] = ' ';
        gmap[GTH-1][randOddX()] = ' ';
        gmap[randOddY()][0] = ' ';
        gmap[randOddY()][GTW-1] = ' ';

        // costruisci wallBits/mazeLayer (ogni tile -> blocco 4x4 px)
        wallBits = new Uint8Array(W * H);
        for (let ty=0; ty<GTH; ty++) {
            for (let tx=0; tx<GTW; tx++) {
                const isWall = gmap[ty][tx] === 'W';
                const { x, y } = tileToPx(tx, ty);
                for (let j=0; j<TILE; j++) {
                    let o = (y + j) * W + x;
                    if (isWall) for (let i=0; i<TILE; i++, o++) wallBits[o] = 1;
                    // corridoio: lascia 0
                }
            }
        }
        mazeLayer = new Uint8Array(W * H);
        for (let i=0;i<mazeLayer.length;i++) mazeLayer[i] = wallBits[i] ? COL.WALL : COL.BG;
    }

    // ── SPAWN SICURO 4x4 ───────────────────────────────────────────────────────
    function pickSafeSpawn() {
        // scegli un tile corridoio lontano dal bordo e possibilmente con almeno un vicino corridoio
        for (let ty=GTH-2; ty>=1; ty--) {
            for (let tx=GTW-2; tx>=1; tx--) {
                if (gmap[ty][tx] !== ' ') continue;
                // richiedi almeno 1 adiacente corridoio per partire
                if ((gmap[ty][tx+1]===' ') || (gmap[ty][tx-1]===' ') || (gmap[ty+1][tx]===' ') || (gmap[ty-1][tx]===' ')) {
                    const { x, y } = tileToPx(tx, ty);
                    return { x, y };
                }
            }
        }
        // fallback
        return tileToPx(1, 1);
    }

    // ── INPUT ──────────────────────────────────────────────────────────────────
    function handleInputs(queue) {
        for (const ev of queue) {
            if (ev.name === "UP")    { player.wantDx = 0;  player.wantDy = -1; }
            if (ev.name === "DOWN")  { player.wantDx = 0;  player.wantDy =  1; }
            if (ev.name === "LEFT")  { player.wantDx = -1; player.wantDy =  0; }
            if (ev.name === "RIGHT") { player.wantDx = 1;  player.wantDy =  0; }
            if (ev.name === "A")     { tryFire(); }
        }
        // cambio immediato della direzione
        player.dx = player.wantDx; player.dy = player.wantDy;
    }

    // ── MOVIMENTO PLAYER 4x4 ───────────────────────────────────────────────────
    function stepPlayer() {
        let nx = player.x + player.dx * PLAYER_SPEED;
        let ny = player.y + player.dy * PLAYER_SPEED;

        // arrotonda a intero: resta allineato ai pixel (maze a blocchi)
        nx = (nx + 0.5) | 0;
        ny = (ny + 0.5) | 0;

        if (!rectOverlapsWall(nx, ny, PLAYER_SIZE, PLAYER_SIZE)) {
            player.x = nx; player.y = ny;
        }

        // wrap + inversione SOLO se dall’altro lato l’AABB è libera
        const half = PLAYER_SIZE; // usiamo AABB con (x,y) = angolo in alto-sx
        // verso destra
        if (player.x >= W) {
            const candX = 0;
            if (!rectOverlapsWall(candX, player.y, PLAYER_SIZE, PLAYER_SIZE)) {
                player.x = candX; player.dx = -Math.abs(player.dx);
            } else {
                // non wrappare se chiuso da muro: inverti e resta
                player.dx = -Math.abs(player.dx);
            }
        }
        // verso sinistra
        else if (player.x + PLAYER_SIZE <= 0) {
            const candX = W - PLAYER_SIZE;
            if (!rectOverlapsWall(candX, player.y, PLAYER_SIZE, PLAYER_SIZE)) {
                player.x = candX; player.dx = Math.abs(player.dx);
            } else {
                player.dx = Math.abs(player.dx);
            }
        }
        // verso giù
        if (player.y >= H) {
            const candY = 0;
            if (!rectOverlapsWall(player.x, candY, PLAYER_SIZE, PLAYER_SIZE)) {
                player.y = candY; player.dy = -Math.abs(player.dy);
            } else {
                player.dy = -Math.abs(player.dy);
            }
        }
        // verso su
        else if (player.y + PLAYER_SIZE <= 0) {
            const candY = H - PLAYER_SIZE;
            if (!rectOverlapsWall(player.x, candY, PLAYER_SIZE, PLAYER_SIZE)) {
                player.y = candY; player.dy = Math.abs(player.dy);
            } else {
                player.dy = Math.abs(player.dy);
            }
        }

        if (player.fireCd > 0) player.fireCd--;
    }

    // ── PROIETTILI 1px ─────────────────────────────────────────────────────────
    function tryFire() {
        if (player.fireCd > 0) return;
        // spara dal bordo del player nella direzione corrente
        let bx = player.x, by = player.y;
        if (player.dx > 0) bx = player.x + PLAYER_SIZE;     // a destra del player
        if (player.dx < 0) bx = player.x - 1;               // a sinistra
        if (player.dy > 0) by = player.y + PLAYER_SIZE;     // sotto
        if (player.dy < 0) by = player.y - 1;               // sopra

        const ix = bx | 0, iy = by | 0;
        if (!inBoundsPx(ix, iy) || wallBits[idxPx(ix, iy)]) return;

        bullets.push({ x: ix, y: iy, dx: player.dx, dy: player.dy });
        player.fireCd = FIRE_COOLDOWN;
    }

    function stepBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            let nx = b.x + b.dx * BULLET_SPEED;
            let ny = b.y + b.dy * BULLET_SPEED;
            nx = (nx + 0.5) | 0; ny = (ny + 0.5) | 0;

            if (!inBoundsPx(nx, ny) || wallBits[idxPx(nx, ny)]) {
                bullets.splice(i, 1); continue;
            }
            b.x = nx; b.y = ny;
        }
    }

    // ── RENDER ─────────────────────────────────────────────────────────────────
    function render() {
        // copia layer maze
        const buf = api.getBuffer && api.getBuffer();
        if (buf && mazeLayer && buf.length === mazeLayer.length) buf.set(mazeLayer);
        else api.fillIndex(COL.BG);

        // player 4x4 (riempi blocco)
        for (let y = 0; y < PLAYER_SIZE; y++) {
            const yy = player.y + y;
            if (yy < 0 || yy >= H) continue;
            for (let x = 0; x < PLAYER_SIZE; x++) {
                const xx = player.x + x;
                if (xx < 0 || xx >= W) continue;
                api.writeIndex(xx, yy, COL.PLAYER);
            }
        }

        // bullets 1px
        for (const b of bullets) {
            if (inBoundsPx(b.x, b.y)) api.writeIndex(b.x, b.y, COL.PLAYER);
        }
    }

    // ── MENU START ──────────────────────────────────────────────────────────────
    function installGameMenu() {
        if (!api.configureGameMenu) return;
        api.configureGameMenu({
            title: "Thick Maze 4x4",
            items: [
                { label: "Maze A", value: 0 },
                { label: "Maze B", value: 1 },
                { label: "Maze C", value: 2 },
                { label: "Maze D", value: 3 },
            ],
            onSelect: (value) => {
                mazeIndex = (value | 0) % seeds.length;
                buildMazeForSeed(seeds[mazeIndex]);
                return "close";
            }
        });
    }

    // ── BUILD/RESET ────────────────────────────────────────────────────────────
    function buildMazeForSeed(seed) {
        generateMazeBlocks(seed);
        const spawn = pickSafeSpawn();
        // posiziona player allineato alla griglia di blocchi (4x4)
        player.x = spawn.x; player.y = spawn.y;
        // direzione iniziale: prova sinistra, poi dx/su/giù
        const dirs = [ {dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1} ];
        let set = false;
        for (const d of dirs) {
            const nx = player.x + d.dx, ny = player.y + d.dy;
            if (inBoundsPx(nx, ny) && !wallBits[idxPx(nx, ny)]) {
                player.dx = d.dx; player.dy = d.dy; player.wantDx = d.dx; player.wantDy = d.dy; set = true; break;
            }
        }
        if (!set) { player.dx = -1; player.dy = 0; player.wantDx = -1; player.wantDy = 0; }
        player.fireCd = 0;

        bullets.length = 0;
    }

    // ── API WRAPPER ────────────────────────────────────────────────────────────
    return {
        init(_api) {
            api = _api;
            W = api.width | 0; H = api.height | 0;
            api.setPalette(PALETTE);

            // (Assumiamo 64x64; se diverso, funziona ma il rapporto TILE potrebbe non tornare perfetto)
            buildMazeForSeed(seeds[mazeIndex]);
            installGameMenu();
        },
        reset() {
            buildMazeForSeed(seeds[mazeIndex]);
            installGameMenu();
        },
        update(_dtMs, inputQueue) {
            handleInputs(inputQueue);
            stepPlayer();
            stepBullets();
            render();
        }
    };
}
