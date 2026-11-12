(() => {
    'use strict';
    /* ================= geometry ================= */
    let PW = 400; const PWMIN = 400, PWMAX = 640, HBASE = 720, LS = 28, LINE0 = 12, OFF_STEPS = 6, HMAX = HBASE + LS * OFF_STEPS, GUT = 56;
    const lineY = k => LINE0 + LS * k;
    let H = HBASE, OFF = 0;
    const SPAWN_Y = lineY(5);
    let DEF_Y, SLIT_Y, CANNON_Y, TUR_Y;
    const CB = { x: 46, y: 0, r: 27 }, FB = { x: 46, y: 0, r: 23 };
    let TUR_X = PW - 74;
    const CMIN = 40, INV_ZONE = 82, INV_ZONE_Y = 320;
    let CMAX = PW - 40;
    function setPW(w) { PW = w; TUR_X = PW - 74; CMAX = PW - 40; }
    function setOff(off) { OFF = off; H = HBASE + OFF; DEF_Y = lineY(20) + OFF; SLIT_Y = lineY(21) + OFF; CANNON_Y = 640 + OFF; TUR_Y = HBASE + OFF - 8; CB.y = 676 + OFF; FB.y = 616 + OFF; }
    setOff(0);
    const MAX_BLUE = 600, MAX_PART = 420, DS = 2;
    const FONT = '"Gochi Hand","Patrick Hand","Comic Sans MS",cursive';
    const INK = '#1f4fb8', INK_D = '#173a8a', RED = '#e2384b', RED_D = '#8f1424', PENCIL = '#55555e', NAVY = '#1d2a4d';
    const EASE = 0.95;

    const cv = document.getElementById('c'), ctx = cv.getContext('2d');
    const $ = id => document.getElementById(id);
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const rand = (a, b) => a + Math.random() * (b - a);
    function rand2(r, a, b) { return a + r() * (b - a); }
    function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    const hsh = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return (s - Math.floor(s)) * 2 - 1; };
    let boil = 0;
    const wob = seed => hsh(seed + boil * 17.13);

    /* ================= upgrades ================= */
    const UP = [
        { cat: 'Cannon', tab: '🔫 Cannon' },
        { k: 'rate',  name: 'Fire Rate',     desc: 'Shoot mobs faster',              max: 10, cost: l => 30 + l * 35,  fx: l => (3.6 + 0.7 * l).toFixed(1) + ' shots/sec' },
        { k: 'multi', name: 'Extra Barrel',  desc: '+1 mob every shot',              max: 2,  cost: l => 300 + l * 500, fx: l => (1 + l) + ' per shot' },
        { k: 'big',   name: 'Big Shot',      desc: 'Chance to fire a tough Big Mob', max: 6,  cost: l => 80 + l * 70,  fx: l => (4 * l) + '% chance' },
        { k: 'speed', name: 'Quick Feet',    desc: 'Mobs run faster',                max: 8,  cost: l => 40 + l * 40,  fx: l => '+' + (6 * l) + '% speed' },
        { k: 'armor', name: 'Thick Skin',    desc: 'Chance a mob survives a hit',    max: 8,  cost: l => 50 + l * 55,  fx: l => (5 * l) + '% survive' },
        { k: 'crit',  name: 'Heavy Hitters', desc: 'Chance of double tower damage',  max: 8,  cost: l => 50 + l * 50,  fx: l => (8 * l) + '% double hit' },
        { cat: 'Heavy Cannon', tab: '💣 Heavy' },
        { k: 'hai',  name: 'Cannon Brain',  desc: 'Teach the heavy cannon to help on its own', max: 3, cost: l => [200, 450, 800][l] || 0, fx: l => ['you aim & fire', 'fires by itself', 'aims at reds near your line', 'smart aim: giants first, leads shots'][l] },
        { k: 'hpow', name: 'Shell Power',   desc: 'Heavy shells hit harder',             max: 10, cost: l => 50 + l * 50,  fx: l => (30 + 10 * l) + ' tower dmg' },
        { k: 'hrel', name: 'Fast Reload',   desc: 'Heavy cannon fires more often',       max: 10, cost: l => 50 + l * 45,  fx: l => Math.max(0.6, 1.8 - 0.12 * l).toFixed(2) + 's reload' },
        { k: 'hblast', name: 'Big Boom',    desc: 'Bigger shell explosions',             max: 6,  cost: l => 60 + l * 60,  fx: l => (34 + 6 * l) + ' blast size' },
        { k: 'hcluster', name: 'Cluster Shells', desc: 'Blasts scatter mini bombs',      max: 3,  cost: l => 150 + l * 150, fx: l => l ? (2 * l) + ' mini bombs' : 'none yet' },
        { k: 'hgate', name: 'Gate Shells',  desc: 'A shell flying through a gate drops new mobs', max: 3, cost: l => 120 + l * 140, fx: l => l ? '×' + l + ' gate drop' : 'none yet' },
        { cat: 'Squad', tab: '🪖 Squad' },
        { k: 'squad', name: 'Recruits',     desc: 'More soldiers guarding your side',     max: 2,  cost: l => 250 + l * 350, fx: l => (1 + l) + ' soldier' + (l ? 's' : '') },
        { k: 'trig',  name: 'Quick Trigger', desc: 'Soldiers shoot faster',               max: 8,  cost: l => 50 + l * 45,  fx: l => Math.max(0.35, 1.0 - 0.08 * l).toFixed(2) + 's per shot' },
        { k: 'reach', name: 'Long Shot',    desc: 'Soldiers see and shoot farther',       max: 6,  cost: l => 50 + l * 50,  fx: l => (150 + 22 * l) + ' range' },
        { k: 'pierce', name: 'Sharp Pencils', desc: 'Bullets go through more reds',      max: 3,  cost: l => 120 + l * 120, fx: l => 'hits ' + (1 + l) + ' red' + (l ? 's' : '') },
        { k: 'vest',  name: 'Tough Vests',  desc: 'Soldiers take more hits, get up faster', max: 5, cost: l => 60 + l * 60, fx: l => (3 + l) + ' HP, up in ' + (6 - 0.7 * l).toFixed(1) + 's' },
        { cat: 'Champion', tab: '⭐ Champ' },
        { k: 'champ', name: 'Champion Power', desc: 'Tougher, hits the tower harder', max: 10, cost: l => 40 + l * 40, fx: l => (12 + 6 * l) + ' HP, ' + (25 + 8 * l) + ' dmg' },
        { k: 'charge', name: 'Fast Charge',  desc: 'Champion ready sooner',          max: 6,  cost: l => 45 + l * 55,  fx: l => Math.max(4, 10 - l) + 's to charge' },
        { k: 'head',  name: 'Head Start',    desc: 'Start each level charged up',    max: 5,  cost: l => 50 + l * 50,  fx: l => Math.round(Math.min(1, 0.35 + 0.13 * l) * 100) + '% at start' },
        { k: 'splash', name: 'Ink Bomb',     desc: 'Champion explodes when it ends', max: 5,  cost: l => 90 + l * 80,  fx: l => l ? (35 + 10 * l) + ' blast size' : 'no blast yet' },
        { cat: 'Gates', tab: '🖍 Gates' },
        { k: 'wide',  name: 'Wide Gates',    desc: 'Highlighter gates get wider',    max: 6,  cost: l => 60 + l * 60,  fx: l => '+' + (7 * l) + '% width' },
        { k: 'bonus', name: 'Gate Magic',    desc: 'Chance a gate makes 1 extra',    max: 8,  cost: l => 60 + l * 55,  fx: l => (7 * l) + '% extra copy' },
        { k: 'gold', name: 'Golden Gates',  desc: 'Gates can start one tier higher',     max: 5,  cost: l => 90 + l * 80,  fx: l => (12 * l) + '% per gate' },
        { k: 'dbl', name: 'Double Trouble', desc: 'A gate can double its copies',        max: 8,  cost: l => 70 + l * 60,  fx: l => (4 * l) + '% chance' },
        { cat: 'Viruses & Mutations', tab: '🧪 Lab' },
        { k: 'virus', name: 'Ink Virus',    desc: 'Hits can turn reds into purple carriers on YOUR side', max: 10, cost: l => 60 + l * 60, fx: l => (4 * l) + '% infect' },
        { k: 'spread', name: 'Contagion',   desc: 'Carriers infect more reds as they go', max: 5, cost: l => 100 + l * 90, fx: l => l ? Math.round((0.25 + 0.1 * l) * 100) + '% spread, ' + (1 + l) + ' jumps' : 'carriers don\'t spread yet' },
        { k: 'mitosis', name: 'Mitosis',    desc: 'Mobs can split in two mid-run',        max: 6,  cost: l => 70 + l * 60,  fx: l => (6 * l) + '% split' },
        { k: 'rot', name: 'Tower Rot',      desc: 'Hits leave ooze that keeps eating the tower', max: 6, cost: l => 80 + l * 70, fx: l => l ? 'rot ×' + l : 'no rot yet' },
        { k: 'frenzy', name: 'Frenzy',      desc: 'Kill streaks make both cannons fire 2× fast', max: 6, cost: l => 80 + l * 70, fx: l => l ? 'every ' + (70 - 7 * l) + ' kills' : 'off' },
        { cat: 'Base & Fire', tab: '🏠 Base' },
        { k: 'fproof', name: 'Fireproof Paper', desc: 'Muzzle flashes scorch the page slower', max: 5, cost: l => 70 + l * 70, fx: l => '-' + (10 * l) + '% burn' },
        { k: 'bucket', name: 'Big Bucket',  desc: 'Page stays wet longer after you put it out', max: 4, cost: l => 60 + l * 60, fx: l => (3 + 2 * l) + 's no-burn' },
        { k: 'line',  name: 'Thick Walls',   desc: 'More hearts on your line',       max: 5,  cost: l => 60 + l * 70,  fx: l => (10 + 3 * l) + ' hearts' },
        { k: 'slow',  name: 'Sticky Paper',  desc: 'Enemies walk slower',            max: 6,  cost: l => 70 + l * 60,  fx: l => '-' + (5 * l) + '% enemy speed' },
        { k: 'loot', name: 'Lucky Ink',     desc: 'Squashed reds can drop coins',         max: 8,  cost: l => 70 + l * 60,  fx: l => (4 * l) + '% drop' },
        { k: 'coin',  name: 'Coin Doodles',  desc: 'Earn more coins',                max: 10, cost: l => 80 + l * 90,  fx: l => '+' + (10 * l) + '% coins' },
    ];
    const UPKEYS = UP.filter(u => u.k).map(u => u.k);
    const defUp = () => { const o = {}; UPKEYS.forEach(k => o[k] = 0); return o; };

    /* ================= save + settings ================= */
    const DEF_SET = {
        master: 80, battle: 70, events: 90, muted: false,
        fps: 'max', res: 'auto', particles: 'high', damage: true, wobble: 'anim', shading: true, shake: true, showFps: false,
        side: 'right', flip: false, sens: 100, sliderVis: true, autofire: false, vibrate: true,
    };
    let S = { coins: 0, level: 1, best: 1, up: defUp(), set: Object.assign({}, DEF_SET) };
    try {
        const raw = localStorage.getItem('mobrush-v2') || localStorage.getItem('mobrush-v1');
        const s = JSON.parse(raw);
        if (s && s.up) {
            S.coins = s.coins | 0; S.level = s.level || 1; S.best = s.best || S.level;
            S.up = Object.assign(defUp(), s.up);
            S.set = Object.assign({}, DEF_SET, s.set || {});
            if (!S.set.v3) { S.set.res = 'auto'; S.set.v3 = true; }
            if (s.set == null) { if (s.muted != null) S.set.muted = !!s.muted; if (s.flip != null) S.set.flip = !!s.flip; }
        }
    } catch (e) {}
    S.level = 1; // every time the game opens you start at Level 1
    function save() { try { localStorage.setItem('mobrush-v2', JSON.stringify(S)); } catch (e) {} }
    const U = () => S.up, ST = () => S.set;

    /* ================= sound ================= */
    let AC = null, master = null, noiseBuf = null; const lastSnd = {};
    function audio() {
        if (!AC) {
            try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.connect(AC.destination); applyVolume(); }
            catch (e) { AC = null; }
        }
        if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
        return AC;
    }
    function applyVolume() { if (master) master.gain.value = ST().muted ? 0 : ST().master / 100; }
    function catVol(cat) { return (cat === 'b' ? ST().battle : ST().events) / 100; }
    function sndOk(key, gap) { const now = performance.now(); if (lastSnd[key] && now - lastSnd[key] < gap) return false; lastSnd[key] = now; return true; }
    function beep(cat, key, gap, f, d, type, v, slide) {
        if (ST().muted || !ST().master || !catVol(cat) || !sndOk(key, gap)) return;
        const a = audio(); if (!a) return;
        try {
            const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
            o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
            if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
            g.gain.setValueAtTime((v || 0.05) * catVol(cat), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
            o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02);
        } catch (e) {}
    }
    function rip(key, gap, vol, freq) {
        if (ST().muted || !ST().master || !catVol('e') || !sndOk(key, gap)) return;
        const a = audio(); if (!a) return;
        try {
            if (!noiseBuf) {
                noiseBuf = a.createBuffer(1, Math.floor(a.sampleRate * 0.3), a.sampleRate);
                const d = noiseBuf.getChannelData(0);
                for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2) * (Math.random() < 0.3 ? 1 : 0.4);
            }
            const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
            src.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq || 2400; f.Q.value = 0.9; g.gain.value = vol * catVol('e');
            src.connect(f); f.connect(g); g.connect(master); src.start();
        } catch (e) {}
    }
    function jingle(notes, type) { notes.forEach((n, i) => setTimeout(() => beep('e', 'j' + i, 0, n, 0.2, type || 'triangle', 0.08), i * 120)); }
    function buzz(ms) { if (!ST().vibrate) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }

    /* ================= paper + decals (fixed 2x resolution) ================= */
    const dec = document.createElement('canvas'); dec.width = PWMAX * DS; dec.height = HMAX * DS;
    const dctx = dec.getContext('2d'); dctx.setTransform(DS, 0, 0, DS, 0, 0);

    const page = document.createElement('canvas');
    function buildPage() {
        const vw = innerWidth, vh = innerHeight, pd = Math.min(rdpr, 2);
        page.width = Math.max(1, Math.round(vw * pd)); page.height = Math.max(1, Math.round(vh * pd));
        const p = page.getContext('2d');
        p.setTransform(pd, 0, 0, pd, 0, 0);
        const r = mulberry(pageSeed);
        const PAPERS = [['#fdfaf0', 'rgba(105,155,220,.6)'], ['#fbfbf6', 'rgba(115,150,205,.55)'], ['#fdf6e3', 'rgba(100,150,210,.55)'], ['#f6faf2', 'rgba(105,160,195,.55)'], ['#fcf8f2', 'rgba(125,145,200,.55)']];
        const pal = PAPERS[Math.floor(r() * PAPERS.length)];
        p.fillStyle = pal[0]; p.fillRect(0, 0, vw, vh);
        const dots = Math.min(14000, Math.round(vw * vh / 55));
        for (let i = 0; i < dots; i++) { p.fillStyle = `rgba(120,100,60,${r() * 0.05})`; p.fillRect(r() * vw, r() * vh, (r() * 1.6 + 0.3) * scale, (r() * 1.6 + 0.3) * scale); }
        // world-space decorations, aligned with the playfield's ruled lines
        p.setTransform(pd * scale, 0, 0, pd * scale, pd * sx0, pd * sy0);
        const wx0 = -sx0 / scale, wx1 = (vw - sx0) / scale, wy0 = -sy0 / scale, wy1 = (vh - sy0) / scale;
        for (let i = 0; i < 60; i++) { p.strokeStyle = `rgba(150,130,90,${r() * 0.06})`; p.lineWidth = 0.6; const x = wx0 + r() * (wx1 - wx0), y = wy0 + r() * (wy1 - wy0); p.beginPath(); p.moveTo(x, y); p.lineTo(x + r() * 14 - 7, y + r() * 4 - 2); p.stroke(); }
        p.strokeStyle = pal[1]; p.lineWidth = 1;
        const kStart = Math.floor((wy0 - PFY - LINE0) / LS), kEnd = Math.ceil((wy1 - PFY - LINE0) / LS);
        for (let k = kStart; k <= kEnd; k++) { if (k < 1 && PFY < LS) continue; const y = PFY + lineY(k); p.beginPath(); p.moveTo(wx0, y); p.lineTo(wx1, y); p.stroke(); }
        p.strokeStyle = 'rgba(235,110,125,.55)'; p.lineWidth = 1.2;
        const mx = wx0 + 46; p.beginPath(); p.moveTo(mx, wy0); p.lineTo(mx, wy1); p.moveTo(mx + 3.5, wy0); p.lineTo(mx + 3.5, wy1); p.stroke();
        for (let hy = wy0 + 118; hy < wy1 - 10; hy += 244) {
            const hx = wx0 + 21, g = p.createRadialGradient(hx, hy - 1, 1, hx, hy, 9); g.addColorStop(0, '#1e1813'); g.addColorStop(1, '#4a3c33');
            p.fillStyle = g; p.beginPath(); p.arc(hx, hy, 8, 0, 6.283); p.fill();
            p.strokeStyle = 'rgba(0,0,0,.18)'; p.lineWidth = 1.6; p.beginPath(); p.arc(hx + 0.5, hy + 1, 9, 0.3, 2.8); p.stroke();
        }
        const rings = Math.floor(r() * 3);
        for (let i = 0; i < rings; i++) {
            const cx = PFX + 60 + r() * (PW - 120), cy = PFY + 160 + r() * (H - 300), rr = 30 + r() * 14, a0 = r() * 6;
            p.strokeStyle = 'rgba(150,100,50,.11)'; p.lineWidth = 3.5; p.beginPath(); p.arc(cx, cy, rr, a0, a0 + 5.1); p.stroke();
            p.lineWidth = 1.2; p.beginPath(); p.arc(cx, cy, rr - 5, 0, 6.283); p.stroke();
        }
        p.strokeStyle = 'rgba(85,85,94,.35)'; p.lineWidth = 1;
        // a few random margin doodles
        const nd = 2 + Math.floor(r() * 3);
        for (let i = 0; i < nd; i++) {
            const dx = wx0 + 24, dy = PFY + 180 + r() * (H - 260), kind = Math.floor(r() * 5);
            p.beginPath();
            if (kind === 0) { for (let a = 0; a < 14; a += 0.3) { const rr = a * 0.9; p.lineTo(dx + Math.cos(a) * rr, dy + Math.sin(a) * rr); } }
            else if (kind === 1) { for (let k = 0; k < 11; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? 4 : 9; p.lineTo(dx + Math.cos(a) * d, dy + Math.sin(a) * d); } }
            else if (kind === 2) { p.arc(dx, dy, 9, 0, 6.283); p.moveTo(dx - 4, dy - 2); p.arc(dx - 4, dy - 2, 0.8, 0, 6.283); p.moveTo(dx + 4, dy - 2); p.arc(dx + 4, dy - 2, 0.8, 0, 6.283); p.moveTo(dx - 5, dy + 3); p.quadraticCurveTo(dx, dy + 7, dx + 5, dy + 3); }
            else if (kind === 3) { p.moveTo(dx - 8, dy); p.lineTo(dx + 8, dy); p.lineTo(dx + 3, dy - 5); p.moveTo(dx + 8, dy); p.lineTo(dx + 3, dy + 5); }
            else { p.moveTo(dx, dy + 7); p.bezierCurveTo(dx - 11, dy - 1, dx - 4, dy - 10, dx, dy - 3); p.bezierCurveTo(dx + 4, dy - 10, dx + 11, dy - 1, dx, dy + 7); }
            p.stroke();
        }
        // pencil borders of the play area when there is extra paper beside it
        if (PFX - GW > 30 || SW - (PFX + PW) - GW > 30) {
            p.strokeStyle = 'rgba(85,85,94,.35)'; p.lineWidth = 1.4; p.setLineDash([6, 6]);
            p.beginPath(); p.moveTo(PFX, PFY); p.lineTo(PFX, PFY + H); p.moveTo(PFX + PW, PFY); p.lineTo(PFX + PW, PFY + H); p.stroke(); p.setLineDash([]);
        }
        // doodled title in the spare space above the game on tall screens
        if (PFY > 64) {
            const fs = Math.min(70, PFY * 0.55), cx = PFX + PW / 2, cy = PFY * 0.52;
            p.textAlign = 'center'; p.textBaseline = 'middle'; p.font = `${fs}px ${FONT}`;
            p.save(); p.translate(cx, cy); p.rotate(-0.04);
            const w1 = p.measureText('Mob ').width, w2 = p.measureText('Rush').width;
            p.fillStyle = INK; p.fillText('Mob ', -w2 / 2, 0); p.fillStyle = RED; p.fillText('Rush', w1 / 2, 0);
            p.restore();
        }
        p.setTransform(pd, 0, 0, pd, 0, 0);
        const eg = p.createLinearGradient(0, 0, vw, 0);
        eg.addColorStop(0, 'rgba(0,0,0,.06)'); eg.addColorStop(0.04, 'rgba(0,0,0,0)'); eg.addColorStop(0.96, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,.08)');
        p.fillStyle = eg; p.fillRect(0, 0, vw, vh);
    }

    const DMG = () => ST().damage;
    function dSplat(x, y, r, color, alpha) {
        if (!DMG()) return;
        dctx.globalAlpha = alpha; dctx.fillStyle = color; dctx.beginPath();
        const n = 11;
        for (let i = 0; i <= n; i++) { const a = i / n * 6.283, rr = r * (0.65 + Math.random() * 0.55); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? dctx.lineTo(px, py) : dctx.moveTo(px, py); }
        dctx.fill();
        for (let i = 0; i < Math.round(r / 1.5) + 2; i++) {
            const a = Math.random() * 6.283, d = r * (1 + Math.random() * 1.4), s = Math.random() * r * 0.28 + 0.5;
            dctx.beginPath(); dctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, 6.283); dctx.fill();
        }
        dctx.globalAlpha = 1;
    }
    function dTear(x, y, len, ang) {
        if (!DMG()) return;
        const n = Math.max(5, Math.round(len / 3.5)), ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
        const top = [], bot = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n, along = (t - 0.5) * len, gap = Math.sin(t * Math.PI) * (1.4 + len * 0.07), j = (Math.random() - 0.5) * 3.2;
            const bx = x + ca * along + nx * j, by = y + sa * along + ny * j;
            top.push([bx - nx * gap / 2, by - ny * gap / 2]); bot.push([bx + nx * gap / 2, by + ny * gap / 2]);
        }
        dctx.fillStyle = 'rgba(70,50,35,.25)'; dctx.beginPath();
        top.forEach((p, i) => i ? dctx.lineTo(p[0] + 1.5, p[1] + 2) : dctx.moveTo(p[0] + 1.5, p[1] + 2));
        for (let i = bot.length - 1; i >= 0; i--) dctx.lineTo(bot[i][0] + 1.5, bot[i][1] + 2.5);
        dctx.fill();
        dctx.fillStyle = '#2a211b'; dctx.beginPath();
        top.forEach((p, i) => i ? dctx.lineTo(p[0], p[1]) : dctx.moveTo(p[0], p[1]));
        for (let i = bot.length - 1; i >= 0; i--) dctx.lineTo(bot[i][0], bot[i][1]);
        dctx.closePath(); dctx.fill();
        dctx.strokeStyle = 'rgba(255,255,255,.95)'; dctx.lineWidth = 1; dctx.beginPath();
        top.forEach((p, i) => i ? dctx.lineTo(p[0] - nx * 0.8, p[1] - ny * 0.8) : dctx.moveTo(p[0] - nx * 0.8, p[1] - ny * 0.8)); dctx.stroke();
        const m = top[Math.floor(n / 2)];
        dctx.fillStyle = '#f6f1e2'; dctx.strokeStyle = 'rgba(80,60,40,.4)'; dctx.lineWidth = 0.7;
        dctx.beginPath(); dctx.moveTo(m[0] - ca * 4, m[1] - sa * 4); dctx.lineTo(m[0] + ca * 4, m[1] + sa * 4); dctx.lineTo(m[0] + nx * 5 + ca, m[1] + ny * 5 + sa); dctx.closePath(); dctx.fill(); dctx.stroke();
    }
    function dScorch(x, y, r) {
        if (!DMG()) return;
        const g = dctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(45,28,12,.5)'); g.addColorStop(0.45, 'rgba(90,55,20,.25)'); g.addColorStop(1, 'rgba(90,55,20,0)');
        dctx.fillStyle = g; dctx.beginPath(); dctx.arc(x, y, r, 0, 6.283); dctx.fill();
        dctx.fillStyle = 'rgba(30,20,10,.35)';
        for (let i = 0; i < 6; i++) { const a = Math.random() * 6.283, d = Math.random() * r * 0.5; dctx.beginPath(); dctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.random() * 2 + 0.5, 0, 6.283); dctx.fill(); }
    }
    function dScar(x, y, w) {
        if (!DMG()) return;
        if (Math.random() < 0.5) {
            dctx.save(); dctx.translate(x, y); dctx.rotate(rand(-0.15, 0.15));
            dctx.fillStyle = 'rgba(255,240,170,.45)'; dctx.fillRect(-w / 2 - 4, -6, w + 8, 12);
            dctx.strokeStyle = 'rgba(160,130,60,.25)'; dctx.lineWidth = 0.6; dctx.strokeRect(-w / 2 - 4, -6, w + 8, 12);
            dctx.restore();
        }
        dctx.strokeStyle = 'rgba(40,30,25,.6)'; dctx.lineWidth = 0.9; dctx.beginPath();
        for (let i = 0; i <= 8; i++) { const px = x - w / 2 + w * i / 8, py = y + (Math.random() - 0.5) * 2.4; i ? dctx.lineTo(px, py) : dctx.moveTo(px, py); }
        dctx.stroke();
        dctx.strokeStyle = 'rgba(40,30,25,.45)'; dctx.beginPath();
        for (let sx = x - w / 2 + 3; sx < x + w / 2; sx += 6) { dctx.moveTo(sx - 1, y - 3); dctx.lineTo(sx + 1, y + 3); }
        dctx.stroke();
    }
    function dRubble(x, y, w) {
        if (!DMG()) return;
        dScorch(x, y, w * 0.55);
        for (let i = 0; i < 22; i++) {
            const px = x + rand(-w / 2, w / 2), py = y + rand(-10, 10), r = rand(3, 8);
            dctx.fillStyle = Math.random() < 0.5 ? '#f3c6cb' : '#e9a8b0'; dctx.strokeStyle = RED_D; dctx.lineWidth = 1;
            dctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; dctx.lineTo(px + Math.cos(a) * r * rand(0.7, 1.1), py + Math.sin(a) * r * rand(0.6, 1)); }
            dctx.closePath(); dctx.fill(); dctx.stroke();
        }
    }
    function clearDecals() { dctx.clearRect(0, 0, PWMAX, HMAX); }

    /* ================= sprites (rebuilt on resize / setting change) ================= */
    let scale = 1, rdpr = 1, sx0 = 0, sy0 = 0, SW = PW + GUT, SH = HBASE, PFX = 0, PFY = 0, GW = GUT, TW = PW + GUT, SPR = {};
    let autoR = Math.min(window.devicePixelRatio || 1, 2), slowSecs = 0, fastSecs = 0, skipSecs = 0;
    function makeSprite(r, fill, edge, angry, teeth) {
        const s = scale * rdpr, half = r + 2.5, size = Math.max(4, Math.ceil(half * 2 * s));
        const c = document.createElement('canvas'); c.width = c.height = size;
        const x = c.getContext('2d'); x.setTransform(size / (half * 2), 0, 0, size / (half * 2), 0, 0);
        const cx = half, cy = half;
        x.fillStyle = fill; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
        if (ST().shading) {
            x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.clip();
            x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = Math.max(0.6, r * 0.12);
            x.beginPath(); for (let i = -r * 2; i < r * 2; i += Math.max(2, r * 0.45)) { x.moveTo(cx + i, cy + r); x.lineTo(cx + i + r, cy + r * 0.2); } x.stroke();
            x.restore();
        }
        x.strokeStyle = edge; x.lineWidth = Math.max(1.2, r * 0.2); x.lineCap = 'round';
        x.beginPath(); x.arc(cx + 0.3, cy + 0.2, r - 0.2, 0.15, 6.2); x.stroke();
        x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.ellipse(cx - r * 0.42, cy - r * 0.45, r * 0.26, r * 0.15, -0.6, 0, 6.283); x.fill();
        const ey = cy - r * 0.08, ex = r * 0.36, er = r * 0.27;
        x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - ex, ey, er, 0, 6.283); x.arc(cx + ex, ey, er, 0, 6.283); x.fill();
        x.fillStyle = '#111'; const py = angry ? r * 0.08 : -r * 0.1;
        x.beginPath(); x.arc(cx - ex, ey + py, er * 0.55, 0, 6.283); x.arc(cx + ex, ey + py, er * 0.55, 0, 6.283); x.fill();
        if (angry) {
            x.strokeStyle = '#3a040c'; x.lineWidth = Math.max(1, r * 0.17);
            x.beginPath(); x.moveTo(cx - ex - er * 1.1, ey - er * 1.5); x.lineTo(cx - ex + er, ey - er * 0.55);
            x.moveTo(cx + ex + er * 1.1, ey - er * 1.5); x.lineTo(cx + ex - er, ey - er * 0.55); x.stroke();
        }
        if (teeth) {
            x.fillStyle = '#3a040c'; x.beginPath(); x.ellipse(cx, cy + r * 0.45, r * 0.42, r * 0.2, 0, 0, 6.283); x.fill();
            x.fillStyle = '#fff';
            for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(cx + i * r * 0.22 - r * 0.08, cy + r * 0.3); x.lineTo(cx + i * r * 0.22 + r * 0.08, cy + r * 0.3); x.lineTo(cx + i * r * 0.22, cy + r * 0.48); x.fill(); }
        }
        return { c, half };
    }
    function buildSprites() {
        SPR.blue = makeSprite(6, '#3d7bf0', INK_D, false);
        SPR.big = makeSprite(9, '#2a63d6', '#0f2c6e', false);
        SPR.red = makeSprite(6, '#f04a5a', RED_D, true);
        SPR.green = makeSprite(6, '#46b84e', '#1d5e22', true);
        SPR.giant = makeSprite(14, '#d62839', '#5a0612', true, true);
        SPR.vir = makeSprite(6, '#9b4de0', '#4a1580', false);
    }
    function spr(sp, x, y, s) { const h = sp.half * s; ctx.drawImage(sp.c, x - h, y - h, h * 2, h * 2); }

    /* ================= sketchy drawing helpers ================= */
    function sketchPoly(pts, closed, j, seed) {
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) { const x = pts[i][0] + wob(seed + i * 3.1) * j, y = pts[i][1] + wob(seed + i * 5.7) * j; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        if (closed) ctx.closePath();
    }
    function rectPts(x, y, w, h) {
        const pts = [], seg = (x1, y1, x2, y2, n) => { for (let i = 0; i < n; i++) pts.push([x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]); };
        const nx = Math.max(2, Math.round(w / 28)), ny = Math.max(2, Math.round(h / 28));
        seg(x, y, x + w, y, nx); seg(x + w, y, x + w, y + h, ny); seg(x + w, y + h, x, y + h, nx); seg(x, y + h, x, y, ny);
        return pts;
    }
    function sketchRect(x, y, w, h, j, seed) { sketchPoly(rectPts(x, y, w, h), true, j, seed); }
    function sketchCircle(x, y, r, j, seed, n) { const pts = []; n = n || 16; for (let i = 0; i < n; i++) { const a = i / n * 6.283; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } sketchPoly(pts, true, j, seed); }
    function stroke(color, w, alpha) { ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); ctx.globalAlpha = 1; }
    function hatch(x, y, w, h, gap, color, lw) { if (!ST().shading) return; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); for (let i = -h; i < w; i += gap) { ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); } ctx.stroke(); }
    function heart(x, y, s, fill) {
        ctx.beginPath(); ctx.moveTo(x, y + s * 0.35);
        ctx.bezierCurveTo(x - s * 1.1, y - s * 0.4, x - s * 0.45, y - s * 1.05, x, y - s * 0.4);
        ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.4, x, y + s * 0.35);
        ctx.fillStyle = fill; ctx.fill(); stroke(RED_D, 1.4);
    }
    function star(x, y, R, r, fill, edge) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * d + wob(i + 900) * 0.6, y + Math.sin(a) * d + wob(i + 950) * 0.6); }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (edge) stroke(edge, 1.6);
    }
    const SHAKE = () => ST().shake;

    /* ================= level ================= */
    let G = null, state = 'menu';

// pick how wide the field is for this level: bigger screens get more room, never smaller than 400
    function chooseOff() {
        const sr = safeRect(), gw = ST().sliderVis ? GUT : 0, T = 0.72;
        const sH = sr.h / HBASE;
        const sc = Math.min(sH, Math.max(T, sr.w / (PWMAX + 2 * gw)));
        setPW(clamp(Math.floor(sr.w / sc - 2 * gw), PWMIN, PWMAX));
        const want = (PW + gw * 2) * sr.h / Math.max(1, sr.w);
        setOff(clamp(Math.floor((want - HBASE) / LS), 0, OFF_STEPS) * LS);
    }
    let pageSeed = 42;
    function makeLevel(n) {
        const seed = (Math.random() * 2147483647) | 0;
        pageSeed = seed;
        chooseOff(); layout();
        const up = U();
        const rnd = mulberry(seed);
        const pick = arr => arr[Math.floor(rnd() * arr.length)];
        const pool = n < 3 ? ['x2', 'x2', 'x3', '+5'] : n < 7 ? ['x2', 'x2', 'x3', '+10', '+5', 'x3'] : ['x2', 'x3', 'x3', '+10', '+20', 'x4', 'x2'];
        const total = n < 3 ? 2 : 3;                         // at most 3 gates on the whole map
        const plan = []; let left = total;
        while (left > 0) {
            if (left >= 2 && rnd() < 0.4) { plan.push(n >= 3 && rnd() < 0.4 ? 'sync' : 'pair'); left -= 2; }
            else { plan.push('single'); left--; }
        }
        for (let i = plan.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [plan[i], plan[j]] = [plan[j], plan[i]]; }
        const rows = plan.length;
        const top = 222 + (rnd() < 0.4 ? LS : 0), bot = 502 + OFF - (rnd() < 0.4 ? LS : 0), gates = [], ws = 1 + 0.07 * up.wide;
        for (let r = 0; r < rows; r++) {
            let y = rows === 1 ? (top + bot) / 2 : bot - r * (bot - top) / (rows - 1);
            y = 26 + LS * Math.round((y - 26) / LS);
            const mk = (cx, w, val, amp) => gates.push({ cx, x: cx, y, w, op: val[0], v: parseInt(val.slice(1), 10), amp, spd: 0.6 + rnd() * 0.8, ph: rnd() * 6.28, flash: 0, seed: rnd() * 1000 });
            const kind = plan[r];
            if (kind === 'pair') {
                const a = pick(pool); let b = pick(pool); if (b === a) b = pick(pool);
                const w = (100 + rnd() * 22) * ws, off = PW * rand2(rnd, 0.23, 0.33);
                mk(clamp(off, w / 2 + 12, PW / 2 - w / 2 - 4), w, a, 0);
                mk(clamp(PW - off, PW / 2 + w / 2 + 4, PW - w / 2 - 12), w, b, 0);
            } else if (kind === 'sync') {
                const w = 96 * Math.min(ws, 1.3), amp = (30 + rnd() * 25) * PW / 400;
                mk(PW * 0.29, w, pick(pool), amp); mk(PW * 0.71, w, pick(pool), amp);
                const g1 = gates[gates.length - 2], g2 = gates[gates.length - 1]; g2.ph = g1.ph; g2.spd = g1.spd;
            } else {
                const w = (115 + rnd() * 50) * ws, moving = n >= 3 && rnd() < 0.5;
                mk(moving ? PW / 2 : clamp(rand2(rnd, 80, PW - 80), w / 2 + 14, PW - w / 2 - 14), w, pick(pool), moving ? (50 + rnd() * 50) * PW / 400 : 0);
            }
        }
        if (!gates.some(gt => gt.op === 'x')) { gates[0].op = 'x'; gates[0].v = 2; }   // always at least one multiplier
        for (const gt of gates) if (Math.random() < 0.12 * up.gold) {
            gt.gold = true;
            if (gt.op === 'x') gt.v = Math.min(5, gt.v + 1); else gt.v = gt.v < 10 ? 10 : gt.v < 20 ? 20 : 30;
        }
        const baseHp = Math.round((1600 + 700 * (n - 1) + 110 * (n - 1) * (n - 1)) * EASE * 0.8 * 0.85);
        const hearts = 10 + 3 * up.line;
        const base = { x: Math.round(PW / 2 - 5 + rnd() * 55), y: 98, w: 150, h: 62, hp: baseHp, max: baseHp, shake: 0, flash: 0 };
        const cracks = [];
        for (let i = 0; i < 8; i++) {
            const pts = []; let x = rnd() * base.w, y = rnd() < 0.5 ? 0 : rnd() * base.h;
            pts.push([x, y]);
            for (let k = 0; k < 4; k++) { x = clamp(x + (rnd() - 0.5) * 26, 2, base.w - 2); y = clamp(y + rnd() * 16, 0, base.h); pts.push([x, y]); }
            cracks.push(pts);
        }
        const merl = [0.82, 0.64, 0.46, 0.3, 0.14].sort(() => rnd() - 0.5);
        clearDecals();
        const L = {
            n, t: 0, blues: [], reds: [], champs: [], parts: [], texts: [], slits: [], gates, base, cracks, merl,
            cx: PW / 2, tx: PW / 2, fireT: 0, recoil: 0, wheelA: 0, pslit: 0, mflash: 0,
            shells: [], booms: [], pend: [], ha: -0.35, hta: -0.35, manualT: 0, burn: 0, fires: [], wetT: 0, reason: '', outs: 0,
            soldiers: [], bullets: [], hT: 1, hrec: 0, hflash: 0, frenzy: 0, fk: 0, rot: 0, bonus: 0,
            spawnT: 2.4, giantT: 9, charge: Math.min(1, 0.35 + 0.13 * up.head),
            hp: hearts, maxHp: hearts, hurt: 0, kills: 0, over: false, overT: 0, won: false, collapse: 0, shake: 0, smokeT: 0,
            interval: Math.max(0.15, 0.6 - n * 0.035) / EASE, burst: 2 + Math.floor(Math.max(0, n - 3) / 2),
        };
        for (let i = 0; i <= up.squad; i++) L.soldiers.push({ x: PW * (0.3 + i * 0.2), y: DEF_Y - 30 - i * 8, cd: 0.5 + i * 0.3, hp: 3 + up.vest, down: 0, run: 0, aim: -Math.PI / 2, wx: PW * (0.3 + i * 0.2), wT: 0 });
        return L;
    }

    /* ================= spawning ================= */
    function addBlue(x, y, mask, big, s, spd) {
        if (G.blues.length >= MAX_BLUE) return null;
        const m = { x, y, py: y, vx: rand(-12, 12), mask, a: 1, big, hp: big ? 3 : 1, s: s == null ? 1 : s, spd: spd || 0, c: false, v: 0, sp: 0 };
        G.blues.push(m); return m;
    }
    function addRed(x, y, giant) {
        const green = !giant && Math.random() < 0.4;
        const n = G.n, slowF = (1 - 0.05 * U().slow) * 0.92, hp = giant ? 4 + n : 1, sp = (giant ? 30 : rand(48, 60)) * slowF;
        G.reds.push({ x, y, vx: rand(-12, 12), vy: sp + 40, sp, hp, max: hp, r: giant ? 14 : 6, giant, green, ph: Math.random() * 6.28, a: 1, s: 0 });
        if (green) { const r = G.reds[G.reds.length - 1]; r.sp *= 1.1; r.vy *= 1.1; }
    }
    function openSlit(x, w, q, giant) {
        G.slits.push({ x, y: SPAWN_Y, w, q, giant, open: 0, st: 0, emitT: 0, hold: 0.25 });
        rip('slit', 90, 0.07, 3000);
    }
    function part(x, y, vx, vy, life, c, type, r) {
        const q = ST().particles;
        if (q === 'off' || G.parts.length >= MAX_PART || (q === 'low' && Math.random() < 0.6)) return;
        G.parts.push({ x, y, vx, vy, life, max: life, c, type: type || 0, r: r || 2, rot: Math.random() * 6, vr: rand(-8, 8) });
    }
    function burst(x, y, color, count, speed, type) {
        for (let i = 0; i < count; i++) { const a = Math.random() * 6.283, s = rand(30, speed || 120); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.3, 0.65), color, type || 0, rand(1.2, 2.6)); }
    }
    function floatText(x, y, txt, c, size) { G.texts.push({ x, y, txt, c, life: 0.9, size: size || 22 }); }
    function shake(t) { G.shake = Math.max(G.shake, t); }

    function shoot() {
        const up = U(), count = 1 + up.multi, my = CANNON_Y - 46;
        for (let i = 0; i < count; i++) {
            const m = addBlue(G.cx + (i - (count - 1) / 2) * 12, my, 0, Math.random() < 0.04 * up.big, 0.7, 480);
            if (m) m.vx = rand(-24, 24);
        }
        G.recoil = 1; G.mflash = 0.07;
        addBurn(1.1, G.cx, CANNON_Y - 52);
        if (G.burn > 35 && Math.random() < 0.1) dScorch(G.cx + rand(-14, 14), CANNON_Y - 52 + rand(-6, 6), rand(5, 10));
        if (Math.random() < 0.45) part(G.cx + rand(-4, 4), my - 4, rand(-18, 18), rand(-45, -15), rand(0.35, 0.6), 'rgba(90,90,100,', 2, rand(2.5, 4));
        beep('b', 'shoot', 75, 520, 0.04, 'square', 0.012);
    }
    function fireShell() {
        const g = G, a = g.ha, tx = TUR_X + Math.sin(a) * 36, ty = TUR_Y - Math.cos(a) * 36;
        g.shells.push({ x: tx, y: ty, py: ty, vx: Math.sin(a) * 360, vy: -Math.cos(a) * 360, mask: 0, a: 1 });
        g.hflash = 0.1; g.hrec = 1;
        addBurn(1.6, tx, ty - 6);
        for (let i = 0; i < 4; i++) part(tx, ty, rand(-30, 30) + Math.sin(a) * 40, rand(-30, 10) - Math.cos(a) * 40, rand(0.5, 0.9), 'rgba(90,90,100,', 2, rand(3, 6));
        shake(0.08);
        beep('e', 'heavy', 0, 110, 0.25, 'sawtooth', 0.07, -60);
    }
    function shellBoom(x, y, hitTower) {
        const g = G, up = U(), R = 34 + 6 * up.hblast;
        if (hitTower) damageBase(30 + 10 * up.hpow, x, y, true);
        for (const r of g.reds) {
            if (!r.a || (r.x - x) ** 2 + (r.y - y) ** 2 > (R + r.r) ** 2) continue;
            if (r.giant) { r.hp -= 6 + 2 * up.hpow; if (r.hp <= 0) killRed(r); } else killRed(r);
        }
        g.booms.push({ x, y, R, t: 0 });
        burst(x, y, '#2a211b', 14, 200); burst(x, y, '#ff9a2e', 14, 240); burst(x, y, '#ffd23c', 8, 160);
        for (let i = 0; i < 5; i++) part(x, y, rand(-80, 80), rand(-140, -30), rand(0.6, 1), '#f6f1e2', 1, rand(2, 4));
        dScorch(x, y, R * 0.6);
        shake(0.18);
        beep('e', 'shellboom', 40, 70, 0.35, 'sawtooth', 0.09, -30);
        for (let i = 0; i < 2 * up.hcluster; i++) { const a = Math.random() * 6.283, d = rand(R * 0.9, R * 1.6); g.pend.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, t: 0.12 + i * 0.05 }); }
    }
    function miniBoom(x, y) {
        const g = G;
        for (const r of g.reds) {
            if (!r.a || (r.x - x) ** 2 + (r.y - y) ** 2 > (22 + r.r) ** 2) continue;
            if (r.giant) { r.hp -= 2; if (r.hp <= 0) killRed(r); } else killRed(r);
        }
        g.booms.push({ x, y, R: 22, t: 0 });
        burst(x, y, '#ff9a2e', 6, 150); burst(x, y, '#2a211b', 4, 120);
        dScorch(x, y, 12);
        beep('e', 'mini', 50, 140, 0.12, 'square', 0.04, -60);
    }
// fire lives in hot spots on the paper where muzzle flashes land; it grows and spreads from there
    function addBurn(v, x, y) {
        const g = G; if (g.over || g.wetT > 0) return;
        const f = 1 - 0.1 * U().fproof;
        let spot = null;
        for (const sp of g.fires) if (Math.abs(sp.x - x) < 24 && Math.abs(sp.y - y) < 20) { spot = sp; break; }
        if (!spot && g.fires.length < 18) { spot = { x: x + rand(-4, 4), y: y + rand(-4, 4), h: 0, seed: Math.random() * 100 }; g.fires.push(spot); }
        if (spot) spot.h = Math.min(100, spot.h + v * f);
        for (const sp of g.fires) if (sp !== spot) sp.h = Math.min(100, sp.h + v * 0.45 * f); // the whole page dries out
    }
    function updateFire(dt) {
        const g = G; let mx = 0;
        for (const sp of g.fires.slice()) {
            if (sp.h > 70) {
                sp.h = Math.min(100, sp.h + 2.5 * dt);                 // flames feed themselves
                if (Math.random() < dt * 0.9 && g.fires.length < 18) { // and creep sideways
                    const nx = clamp(sp.x + (Math.random() < 0.5 ? -1 : 1) * rand(24, 36), 10, PW - 10), ny = clamp(sp.y + rand(-10, 10), DEF_Y - 40, H - 6);
                    let n = g.fires.find(o => Math.abs(o.x - nx) < 22 && Math.abs(o.y - ny) < 18);
                    if (!n) { n = { x: nx, y: ny, h: 0, seed: Math.random() * 100 }; g.fires.push(n); }
                    n.h = Math.min(100, n.h + (sp.h - 60) * 0.35);
                }
            }
            if (sp.h > 40 && Math.random() < dt * (sp.h / 18)) part(sp.x + rand(-8, 8), sp.y - 4, rand(-6, 6), rand(-40, -20), rand(0.8, 1.4), 'rgba(70,60,55,', 2, rand(3, 6));
            if (sp.h > 62 && Math.random() < dt * (sp.h / 12)) part(sp.x + rand(-10, 10), sp.y - 6, rand(-20, 20), rand(-90, -40), rand(0.3, 0.6), Math.random() < 0.5 ? '#ffb02e' : '#ff6a1e', 0, rand(1, 1.8));
            if (sp.h > 85 && Math.random() < dt * 1.5) dScorch(sp.x + rand(-8, 8), sp.y + rand(-4, 4), rand(8, 14));
            mx = Math.max(mx, sp.h);
        }
        g.burn = mx;
    }
    function douse() {
        const g = G; if (!g || g.over || g.burn < 3) return;
        g.burn = 0; g.wetT = 3 + 2 * U().bucket; g.outs++;
        if (DMG()) { dctx.globalAlpha = 0.2; dctx.fillStyle = '#7fb8f0'; for (const sp of g.fires) if (sp.h > 20) { dctx.beginPath(); dctx.arc(sp.x, sp.y, 10 + sp.h * 0.18, 0, 6.283); dctx.fill(); } dctx.globalAlpha = 1; }
        for (const sp of g.fires) for (let i = 0; i < 6; i++) part(sp.x, sp.y, rand(-50, 50), rand(-120, -30), rand(0.4, 0.8), '#5aa9ff', 0, rand(1.5, 3));
        g.fires = [];
        for (let i = 0; i < 40; i++) part(rand(20, PW - 20), rand(DEF_Y - 10, H), rand(-40, 40), rand(-160, -40), rand(0.4, 0.9), '#5aa9ff', 0, rand(1.5, 3.2));
        if (DMG()) { dctx.globalAlpha = 0.18; dctx.fillStyle = '#7fb8f0'; for (let i = 0; i < 6; i++) { dctx.beginPath(); dctx.arc(rand(40, PW - 40), rand(DEF_Y + 10, H - 10), rand(10, 26), 0, 6.283); dctx.fill(); } dctx.globalAlpha = 1; }
        floatText(PW / 2, DEF_Y - 20, 'Splash! Page saved', '#1f6fd0', 24);
        rip('splash', 0, 0.18, 700);
        buzz(15);
    }
    function infect(r) {
        const g = G, up = U();
        r.a = 0; g.kills++;
        const c = addBlue(r.x, r.y, 0, false, 0.4, 0);
        if (c) { c.c = true; c.v = up.spread ? 1 + up.spread : 0; }
        burst(r.x, r.y, '#9b4de0', 6, 110);
        if (Math.random() < 0.3) dSplat(r.x, r.y, rand(1.5, 3), '#9b4de0', 0.35);
        beep('b', 'infect', 60, 330, 0.08, 'triangle', 0.04, 220);
    }
    function launchChampion() {
        if (!G || G.over || G.charge < 1) return;
        G.charge = 0;
        const hp = 12 + U().champ * 6;
        G.champs.push({ x: G.cx, y: CANNON_Y - 50, hp, max: hp, a: 1, s: 0.4 });
        addBurn(3, G.cx, CANNON_Y - 52);
        G.recoil = 1.5; G.mflash = 0.15;
        rip('champ', 0, 0.16, 1500);
        beep('e', 'champ2', 0, 220, 0.35, 'sawtooth', 0.06, 400);
        buzz(20);
    }
    function explode(x, y) {
        const lvl = U().splash; if (!lvl) return;
        const R = 35 + 10 * lvl;
        for (const r of G.reds) { if (r.a && (r.x - x) ** 2 + (r.y - y) ** 2 < R * R) killRed(r); }
        burst(x, y, INK, 26, 260); burst(x, y, '#111', 10, 200);
        dScorch(x, y, R * 0.7); dSplat(x, y, R * 0.3, INK, 0.5);
        shake(0.25);
        beep('e', 'boom', 0, 90, 0.4, 'sawtooth', 0.09, -40);
    }
    function killRed(r) {
        r.a = 0; G.kills++;
        const up = U();
        if (up.loot && Math.random() < 0.04 * up.loot) { G.bonus++; floatText(r.x, r.y - 6, '+1 coin', '#a46f00', 17); beep('e', 'coin', 60, 1320, 0.08, 'triangle', 0.04); }
        if (up.frenzy && ++G.fk >= 70 - 7 * up.frenzy) { G.fk = 0; G.frenzy = 4; floatText(PW / 2, 200, 'FRENZY!', '#e0a800', 34); beep('e', 'frenzy', 0, 660, 0.25, 'square', 0.06, 600); }
        if (r.giant) { burst(r.x, r.y, RED, 16, 200); dSplat(r.x, r.y, 9, RED, 0.45); beep('b', 'giant', 0, 160, 0.2, 'square', 0.06, -80); }
        else { const col = r.green ? '#46b84e' : RED; burst(r.x, r.y, col, 3, 90); if (Math.random() < 0.22) dSplat(r.x, r.y, rand(1.5, 3.2), col, 0.35); }
    }

    /* ================= update ================= */
    function damageBase(d, x, y, show) {
        const b = G.base; if (G.over) return;
        b.hp -= d; b.shake = 0.12; b.flash = 0.1;
        beep('b', 'hit', 60, 140, 0.06, 'triangle', 0.05);
        if (show) floatText(x, y, '-' + d, RED, 26);
        if (b.hp <= 0) { b.hp = 0; endLevel(true); }
    }
    function endLevel(won) {
        if (G.over) return;
        G.over = true; G.won = won; G.overT = 1.4;
        const b = G.base;
        if (won) {
            for (let i = 0; i < 40; i++) part(b.x + rand(-70, 70), b.y + rand(-30, 30), rand(-80, 80), rand(-160, -20), rand(0.6, 1.2), '#f3c6cb', 1, rand(3, 6));
            burst(b.x, b.y, RED, 50, 260); burst(b.x, b.y, '#ffd23c', 40, 220);
            dRubble(b.x, b.y + b.h / 2 - 4, b.w);
            shake(0.5); buzz(80);
            jingle([523, 659, 784, 1046]);
        } else {
            for (let x = 60; x < PW - 20; x += rand(30, 60)) dTear(x, DEF_Y + rand(-3, 3), rand(16, 30), rand(-0.3, 0.3));
            shake(0.4); buzz([60, 40, 60]);
            jingle([392, 330, 262, 196], 'sawtooth');
        }
    }

    function update(dt) {
        const g = G, b = g.base, up = U();
        g.t += dt;
        b.shake = Math.max(0, b.shake - dt); b.flash = Math.max(0, b.flash - dt);
        g.hurt = Math.max(0, g.hurt - dt); g.shake = Math.max(0, g.shake - dt);
        g.recoil = Math.max(0, g.recoil - dt * 8); g.mflash = Math.max(0, g.mflash - dt);
        g.hrec = Math.max(0, g.hrec - dt * 4); g.hflash = Math.max(0, g.hflash - dt); g.frenzy = Math.max(0, g.frenzy - dt);
        if (keys.q) g.hta -= 1.6 * dt;
        if (keys.e) g.hta += 1.6 * dt;
        g.hta = clamp(g.hta, -1.15, 1.15);
        g.ha += (g.hta - g.ha) * Math.min(1, dt * 14);
        if (g.won) g.collapse = Math.min(1, g.collapse + dt * 1.1);

        if (keys.left) g.tx -= 300 * dt;
        if (keys.right) g.tx += 300 * dt;
        g.tx = clamp(g.tx, CMIN, CMAX);
        const ox0 = g.cx;
        g.cx += (g.tx - g.cx) * Math.min(1, dt * 18);
        g.wheelA += (g.cx - ox0) / 8;

        for (const gt of g.gates) {
            if (gt.amp) gt.x = clamp(gt.cx + Math.sin(g.t * gt.spd + gt.ph) * gt.amp, gt.w / 2 + 12, PW - gt.w / 2 - 12);
            gt.flash = Math.max(0, gt.flash - dt * 4);
        }

        const firing = !g.over && state === 'play' && (ptrs.size > 0 || keys.fire || ST().autofire);
        g.pslit += ((firing ? 1 : 0) - Math.min(1, g.pslit)) * Math.min(1, dt * 10);
        if (g.pslit > 1) g.pslit = Math.max(1, g.pslit - dt * 2);

        if (!g.over) {
            const rate = (3.6 + up.rate * 0.7) * (g.frenzy > 0 ? 2 : 1);
            g.hT -= dt * (g.frenzy > 0 ? 2 : 1);
            g.wetT = Math.max(0, g.wetT - dt);
            updateFire(dt);
            if (g.burn >= 100) { g.reason = 'fire'; endLevel(false); }
            if (g.burn > 70 && Math.random() < dt * 3) rip('crackle', 250, 0.05, 900);
            // heavy cannon brain: manual touch always wins for 2s
            if ([...ptrs.values()].some(p => p.mode === 'turret')) g.manualT = 2;
            g.manualT = Math.max(0, g.manualT - dt);
            let target = null;
            if (up.hai >= 2 && g.manualT <= 0) {
                let best = -1e9;
                for (const r of g.reds) {
                    if (!r.a || r.y < SPAWN_Y + 20) continue;
                    const score = r.y + (up.hai >= 3 && r.giant ? 400 : 0);
                    if (score > best) { best = score; target = r; }
                }
                if (target) {
                    let ty = target.y;
                    if (up.hai >= 3) ty += target.vy * Math.hypot(target.x - TUR_X, target.y - TUR_Y) / 360;
                    const want = clamp(Math.atan2(target.x - TUR_X, TUR_Y - ty), -1.15, 1.15), spd = up.hai >= 3 ? 1.8 : 0.9;
                    g.hta = clamp(g.ha + clamp(want - g.ha, -spd * dt, spd * dt), -1.15, 1.15);
                }
            }
            const autoFire = up.hai === 1 || (up.hai >= 2 && target && Math.abs(g.hta - g.ha) < 0.15);
            if ((firing || autoFire) && g.hT <= 0) { g.hT = Math.max(0.6, 1.8 - 0.12 * up.hrel); fireShell(); }
            if (up.rot && g.rot > 0.1) {
                b.hp -= g.rot * 0.04 * up.rot * dt; g.rot *= Math.pow(0.85, dt);
                if (b.hp <= 0) { b.hp = 0; endLevel(true); }
            }
            if (firing) { g.fireT -= dt; while (g.fireT <= 0) { g.fireT += 1 / rate; shoot(); } }
            else g.fireT = Math.max(0, g.fireT - dt);
            g.charge = Math.min(1, g.charge + dt / Math.max(4, 10 - up.charge));

            const ramp = Math.max(0.75, 1 - g.t / 200);
            g.spawnT -= dt;
            if (g.spawnT <= 0) {
                g.spawnT = g.interval * ramp * (1 + (g.burst - 2) * 0.15);
                const side = g.n >= 2 && Math.random() < Math.min(0.45, 0.2 + g.n * 0.03);
                openSlit(side ? (Math.random() < 0.5 ? rand(48, 95) : rand(PW - 95, PW - 48)) : b.x + rand(-55, 55), 30 + g.burst * 5, g.burst, false);
            }
            if (g.n >= 4) { g.giantT -= dt; if (g.giantT <= 0) { g.giantT = Math.max(5, 11 - g.n * 0.35) / EASE; openSlit(b.x + rand(-50, 50), 50, 1, true); } }
            if (b.hp / b.max < 0.5) { g.smokeT -= dt; if (g.smokeT <= 0) { g.smokeT = 0.18; part(b.x + rand(-60, 60), b.y - b.h / 2 - 8, rand(-8, 8), rand(-30, -15), rand(1, 1.6), 'rgba(80,80,90,', 2, rand(4, 7)); } }
        }

        for (const s of g.slits) {
            if (s.st === 0) { s.open += dt * 5; if (s.open >= 1) { s.open = 1; s.st = 1; } }
            else if (s.st === 1) {
                s.emitT -= dt;
                if (s.q > 0 && s.emitT <= 0 && !g.over) { s.emitT = 0.07; s.q--; addRed(s.x + rand(-s.w / 3, s.w / 3), s.y + 2, s.giant); }
                if (s.q <= 0 || g.over) { s.hold -= dt; if (s.hold <= 0) s.st = 2; }
            } else { s.open -= dt * 3.5; if (s.open <= 0) { s.dead = true; dScar(s.x, s.y, s.w * 0.8); } }
        }

        const lo = b.x - b.w / 2 + 12, hi = b.x + b.w / 2 - 12, baseBottom = b.y + b.h / 2;
        const bspeed = 150 * (1 + 0.06 * up.speed);

        for (const m of g.blues) {
            if (!m.a) continue;
            m.s = Math.min(1, m.s + dt * 6);
            m.spd = m.spd > bspeed ? Math.max(bspeed, m.spd - 1100 * dt) : bspeed;
            m.py = m.y; m.y -= m.spd * dt; m.x += m.vx * dt; m.vx *= Math.pow(0.5, dt);
            if (!m.sp && m.y < DEF_Y - 160) {
                m.sp = 1;
                if (up.mitosis && Math.random() < 0.06 * up.mitosis) {
                    const c2 = addBlue(m.x + rand(-7, 7), m.y + 5, m.mask, false, 0.3, 0);
                    if (c2) { c2.sp = 1; c2.c = m.c; c2.v = m.v; burst(m.x, m.y, m.c ? '#9b4de0' : INK, 3, 60); }
                }
            }
            if (m.x < 14 || m.x > PW - 14) { m.vx = -m.vx; m.x = clamp(m.x, 14, PW - 14); }
            if (m.y < 250) { const t = clamp(m.x, lo, hi); m.x += (t - m.x) * Math.min(1, dt * 3); }
            for (let i = 0; i < g.gates.length; i++) {
                const gt = g.gates[i], bit = 1 << i;
                if ((m.mask & bit) || m.py <= gt.y || m.y > gt.y || Math.abs(m.x - gt.x) > gt.w / 2) continue;
                m.mask |= bit;
                let extra = gt.op === 'x' ? gt.v - 1 : gt.v;
                if (Math.random() < 0.07 * up.bonus) extra++;
                if (up.dbl && Math.random() < 0.04 * up.dbl) { extra = extra * 2 + 1; if (sndOk('dbltxt', 400)) floatText(gt.x, gt.y - 22, 'DOUBLE!', '#1f8a3a', 22); }
                for (let k = 0; k < extra; k++) {
                    const c = addBlue(clamp(gt.x + rand(-gt.w / 2 + 6, gt.w / 2 - 6), 14, PW - 14), gt.y - rand(2, 14), m.mask, false, 0.3);
                    if (c && m.c) { c.c = true; c.v = m.v; }
                }
                gt.flash = 1;
                beep('b', 'gate', 45, 600 + Math.random() * 300, 0.05, 'triangle', 0.03);
            }
            if (!g.over && m.y < baseBottom && Math.abs(m.x - b.x) < b.w / 2) {
                m.a = 0;
                const crit = Math.random() < 0.08 * up.crit, d = (m.big ? 3 : 1) * (crit ? 2 : 1);
                damageBase(d, m.x, m.y, m.big && crit);
                if (up.rot) g.rot = Math.min(150, g.rot + 1);
                burst(m.x, m.y, INK, 2, 80);
                if (Math.random() < 0.06) dSplat(m.x + rand(-6, 6), baseBottom + rand(2, 14), rand(1.5, 3), INK, 0.35);
            } else if (m.y < 30) m.a = 0;
        }

        for (const c of g.champs) {
            if (!c.a) continue;
            c.s = Math.min(1, c.s + dt * 4);
            c.y -= 78 * dt;
            if (c.y < 260) c.x += (clamp(c.x, lo, hi) - c.x) * Math.min(1, dt * 2.5);
            if (Math.random() < dt * 20) part(c.x + rand(-8, 8), c.y + 14, 0, 20, 0.4, INK, 0, 1.5);
            if (!g.over && c.y < baseBottom + 8) {
                c.a = 0;
                damageBase(25 + up.champ * 8, c.x, c.y, true);
                burst(c.x, c.y, '#ffd23c', 30, 220); burst(c.x, c.y, INK, 20, 180);
                dScorch(c.x, baseBottom + 8, 26); dSplat(c.x, baseBottom + 8, 7, INK, 0.45);
                shake(0.3); buzz(30);
                beep('e', 'boom', 0, 90, 0.4, 'sawtooth', 0.09, -40);
                explode(c.x, c.y);
            }
        }

        for (const r of g.reds) {
            if (!r.a) continue;
            r.s = Math.min(1, r.s + dt * 5);
            r.vy += (r.sp - r.vy) * Math.min(1, dt * 3);
            r.y += r.vy * dt; r.x += r.vx * dt;
            if (r.green) r.x += Math.cos(g.t * 4 + r.ph) * 46 * dt;
            if (r.x < 16 || r.x > PW - 16) { r.vx = -r.vx; r.x = clamp(r.x, 16, PW - 16); }
            if (r.y >= DEF_Y) {
                r.a = 0;
                if (!g.over) {
                    g.hp -= r.giant ? 2 : 1; g.hurt = 0.3;
                    dTear(r.x, DEF_Y + rand(-2, 2), r.giant ? rand(30, 42) : rand(12, 22), rand(-0.35, 0.35));
                    dSplat(r.x, DEF_Y + rand(4, 12), r.giant ? 7 : 3, RED, 0.4);
                    if (r.giant) { dScorch(r.x, DEF_Y, 22); shake(0.25); }
                    for (let i = 0; i < 5; i++) part(r.x, DEF_Y, rand(-60, 60), rand(-80, -10), rand(0.5, 0.9), '#f6f1e2', 1, rand(2, 4));
                    rip('tear', 70, 0.13, 1800);
                    buzz(25);
                    if (g.hp <= 0) { g.hp = 0; endLevel(false); }
                }
            }
        }

        const CELL = 24, cols = Math.ceil(PW / CELL) + 2, grid = new Map();
        for (const r of g.reds) { if (!r.a) continue; const k = Math.floor(r.y / CELL) * cols + Math.floor(r.x / CELL); let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(r); }
        for (const m of g.blues) {
            if (!m.a) continue;
            const gx = Math.floor(m.x / CELL), gy = Math.floor(m.y / CELL), mr = m.big ? 9 : 6;
            outer: for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const l = grid.get((gy + dy) * cols + gx + dx); if (!l) continue;
                for (const r of l) {
                    if (!r.a) continue;
                    const ex = r.x - m.x, ey = r.y - m.y, rr = mr + r.r;
                    if (ex * ex + ey * ey < rr * rr) {
                        if (!r.giant && m.c && m.v > 0 && Math.random() < 0.25 + 0.1 * up.spread) { infect(r); m.v--; break outer; }
                        if (!r.giant && !m.c && up.virus && Math.random() < 0.04 * up.virus) { infect(r); break outer; }
                        r.hp--; if (r.hp <= 0) killRed(r);
                        if (m.big) { m.hp--; if (m.hp <= 0) m.a = 0; }
                        else if (Math.random() >= 0.05 * up.armor) m.a = 0;
                        if (!m.a) { burst(m.x, m.y, INK, 2, 70); if (Math.random() < 0.12) dSplat(m.x, m.y, rand(1.2, 2.6), INK, 0.3); }
                        else m.y += 6;
                        break outer;
                    }
                }
            }
        }
        for (const c of g.champs) {
            if (!c.a) continue;
            const gx = Math.floor(c.x / CELL), gy = Math.floor(c.y / CELL);
            for (let dy = -2; dy <= 2 && c.a; dy++) for (let dx = -2; dx <= 2 && c.a; dx++) {
                const l = grid.get((gy + dy) * cols + gx + dx); if (!l) continue;
                for (const r of l) {
                    if (!r.a) continue;
                    const ex = r.x - c.x, ey = r.y - c.y, rr = 17 + r.r;
                    if (ex * ex + ey * ey < rr * rr) {
                        c.hp -= r.giant ? 4 : 1; killRed(r);
                        if (c.hp <= 0) { c.a = 0; burst(c.x, c.y, INK, 20, 160); dSplat(c.x, c.y, 6, INK, 0.4); explode(c.x, c.y); break; }
                    }
                }
            }
        }

        // soldiers: guard your half, shoot reds, get knocked down if mobbed
        const reach = 150 + 22 * up.reach, sspd = 85;
        for (const so of g.soldiers) {
            if (so.down > 0) { so.down -= dt; if (so.down <= 0) { so.hp = 3 + up.vest; floatText(so.x, so.y - 20, 'back up!', INK_D, 16); } continue; }
            let tgt = null, bd = 1e9;
            for (const r of g.reds) {
                if (!r.a || r.y < DEF_Y - 330) continue;
                const d = Math.hypot(r.x - so.x, r.y - so.y);
                if (d < reach && d - r.y * 0.3 < bd) { bd = d - r.y * 0.3; tgt = r; }
            }
            const yTop = (SPAWN_Y + DEF_Y) / 2 + 10, yBot = DEF_Y - 22;
            if (tgt) {
                // close in to a comfortable distance, staying on our half
                const ang = Math.atan2(so.y - tgt.y, so.x - tgt.x), keep = Math.min(reach * 0.6, 100);
                so.wx = clamp(tgt.x + Math.cos(ang) * keep, 20, PW - 20); so.wy = clamp(tgt.y + Math.sin(ang) * keep, yTop, yBot);
            } else { so.wT -= dt; if (so.wT <= 0 || so.wy == null) { so.wT = rand(1.5, 3.5); so.wx = rand(30, PW - 30); so.wy = rand(yTop, yBot); } }
            const dx = so.wx - so.x, dy2 = so.wy - so.y, dist = Math.hypot(dx, dy2), st = Math.min(dist, sspd * dt);
            if (dist > 1) { so.x += dx / dist * st; so.y += dy2 / dist * st; }
            so.run += st * 0.25;
            so.cd -= dt;
            if (tgt) {
                so.aim = Math.atan2(tgt.y - so.y, tgt.x - so.x);
                if (so.cd <= 0 && !g.over) {
                    so.cd = Math.max(0.35, 1.0 - 0.08 * up.trig);
                    g.bullets.push({ x: so.x + Math.cos(so.aim) * 10, y: so.y - 4 + Math.sin(so.aim) * 10, vx: Math.cos(so.aim) * 430, vy: Math.sin(so.aim) * 430, left: 1 + up.pierce, life: reach / 430 + 0.1, hit: [] });
                    beep('b', 'pew', 80, 900, 0.03, 'square', 0.02, -300);
                }
            } else so.aim += (-Math.PI / 2 - so.aim) * Math.min(1, dt * 4);
            for (const r of g.reds) {
                if (!r.a || (r.x - so.x) ** 2 + (r.y - so.y) ** 2 > (10 + r.r) ** 2) continue;
                if (r.giant) { so.hp -= 2; r.hp -= 1; if (r.hp <= 0) killRed(r); } else { so.hp -= 1; killRed(r); }
                if (so.hp <= 0) { so.down = 6 - 0.7 * up.vest; burst(so.x, so.y, '#888', 8, 90); floatText(so.x, so.y - 18, 'ouch!', RED, 16); break; }
            }
        }
        for (const bl of g.bullets) {
            bl.life -= dt; bl.x += bl.vx * dt; bl.y += bl.vy * dt;
            if (bl.life <= 0 || bl.x < 0 || bl.x > PW || bl.y < 0) { bl.dead = true; continue; }
            for (const r of g.reds) {
                if (!r.a || bl.hit.includes(r) || (r.x - bl.x) ** 2 + (r.y - bl.y) ** 2 > (r.r + 3) ** 2) continue;
                bl.hit.push(r); r.hp--; if (r.hp <= 0) killRed(r);
                if (--bl.left <= 0) { bl.dead = true; break; }
            }
        }
        g.bullets = g.bullets.filter(bl => !bl.dead);

        // heavy shells
        for (const sh of g.shells) {
            if (!sh.a) continue;
            sh.py = sh.y; sh.x += sh.vx * dt; sh.y += sh.vy * dt;
            if (sh.x < 10 || sh.x > PW - 10) { sh.vx = -sh.vx; sh.x = clamp(sh.x, 10, PW - 10); }
            if (Math.random() < dt * 40) part(sh.x, sh.y, rand(-10, 10), rand(-10, 10), 0.35, 'rgba(70,70,80,', 2, 2.5);
            if (up.hgate) for (let i = 0; i < g.gates.length; i++) {
                const gt = g.gates[i], bit = 1 << i;
                if ((sh.mask & bit) || sh.py <= gt.y || sh.y > gt.y || Math.abs(sh.x - gt.x) > gt.w / 2) continue;
                sh.mask |= bit; gt.flash = 1;
                const n = (gt.op === 'x' ? gt.v * 2 : gt.v) * up.hgate;
                for (let k = 0; k < n; k++) addBlue(clamp(gt.x + rand(-gt.w / 2 + 6, gt.w / 2 - 6), 14, PW - 14), gt.y - rand(2, 16), bit, false, 0.3);
            }
            if (!g.over && sh.y < baseBottom && Math.abs(sh.x - b.x) < b.w / 2) { sh.a = 0; shellBoom(sh.x, baseBottom - 4, true); continue; }
            if (sh.y < 24) { sh.a = 0; shellBoom(sh.x, sh.y, false); continue; }
            const gx = Math.floor(sh.x / CELL), gy = Math.floor(sh.y / CELL);
            hit: for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const l = grid.get((gy + dy) * cols + gx + dx); if (!l) continue;
                for (const r of l) if (r.a && (r.x - sh.x) ** 2 + (r.y - sh.y) ** 2 < (8 + r.r) ** 2) { sh.a = 0; shellBoom(sh.x, sh.y, false); break hit; }
            }
        }
        for (const pb of g.pend) { pb.t -= dt; if (pb.t <= 0 && !pb.done) { pb.done = true; miniBoom(pb.x, pb.y); } }
        for (const bm of g.booms) bm.t += dt;

        for (const p of g.parts) {
            p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
            if (p.type === 1) { p.vy += 260 * dt; p.vx *= Math.pow(0.16, dt); }
            else if (p.type === 2) { p.r += dt * 6; }
            else { const f = Math.pow(0.013, dt); p.vx *= f; p.vy *= f; }
        }
        for (const t of g.texts) { t.life -= dt; t.y -= 40 * dt; }

        g.blues = g.blues.filter(m => m.a);
        g.reds = g.reds.filter(r => r.a);
        g.champs = g.champs.filter(c => c.a);
        g.slits = g.slits.filter(s => !s.dead);
        g.shells = g.shells.filter(s => s.a);
        g.pend = g.pend.filter(p => !p.done);
        g.booms = g.booms.filter(bm => bm.t < 0.35);
        g.parts = g.parts.filter(p => p.life > 0);
        g.texts = g.texts.filter(t => t.life > 0);

        if (g.over) { g.overT -= dt; if (g.overT <= 0 && state === 'play') showResult(); }
    }

    /* ================= drawing ================= */
    function drawSlit(x, y, w, open, color) {
        if (open <= 0.01) return;
        const h = Math.min(1, open) * (w * 0.32), l = x - w / 2, r = x + w / 2;
        const g = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
        g.addColorStop(0, color); g.addColorStop(0.55, '#1a120d'); g.addColorStop(1, '#2a211b');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(l, y); ctx.quadraticCurveTo(x, y - h * 1.15, r, y); ctx.quadraticCurveTo(x, y + h, l, y); ctx.fill();
        ctx.fillStyle = 'rgba(253,250,240,.95)';
        ctx.beginPath(); ctx.moveTo(l - 2, y); ctx.quadraticCurveTo(x, y - h * 1.15, r + 2, y); ctx.quadraticCurveTo(x, y - h * 1.15 - 3, l - 2, y); ctx.fill();
        ctx.beginPath(); ctx.moveTo(l - 2, y); ctx.quadraticCurveTo(x, y + h, r + 2, y); ctx.quadraticCurveTo(x, y + h + 3, l - 2, y); ctx.fill();
        ctx.strokeStyle = 'rgba(105,155,220,.95)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(l - 6, y); ctx.lineTo(l, y); ctx.quadraticCurveTo(x, y - h * 1.15 - 2, r, y); ctx.lineTo(r + 6, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(l, y); ctx.quadraticCurveTo(x, y + h + 2, r, y); ctx.stroke();
        ctx.strokeStyle = 'rgba(60,40,25,.35)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(l, y); ctx.quadraticCurveTo(x, y + h + 3.5, r, y); ctx.stroke();
    }

    function drawTower(g) {
        const b = g.base, frac = b.hp / b.max, col = g.collapse;
        if (col >= 1) return;
        const sh = b.shake > 0 && SHAKE();
        const ox1 = sh ? rand(-3, 3) : 0, oy1 = sh ? rand(-2, 2) : 0;
        ctx.save();
        ctx.globalAlpha = 1 - col;
        ctx.translate(ox1 + (col && SHAKE() ? rand(-2, 2) : 0), oy1 + col * 22);
        const x0 = b.x - b.w / 2, y0 = b.y - b.h / 2;
        ctx.fillStyle = 'rgba(60,40,30,.13)'; ctx.beginPath(); ctx.ellipse(b.x, y0 + b.h + 3, b.w * 0.56, 7, 0, 0, 6.283); ctx.fill();

        const fx = b.x, fy = y0 - 12, tilt = frac < 0.2 ? 0.7 : 0;
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(tilt);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); stroke(PENCIL, 2);
        const wv = Math.sin(performance.now() / 180) * 3;
        ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(10, -24 + wv, 22, -20 + wv * 0.6); ctx.quadraticCurveTo(10, -16 - wv * 0.4, 0, -14);
        ctx.fillStyle = RED; ctx.fill(); stroke(RED_D, 1.3);
        ctx.restore();

        for (let i = 0; i < 5; i++) {
            const mx = x0 + 4 + i * (b.w - 22) / 4, broken = frac < g.merl[i];
            const mh = broken ? 5 : 14;
            sketchRect(mx, y0 - mh + 1, 14, mh, 0.8, 200 + i * 7);
            ctx.fillStyle = '#ffe1e4'; ctx.fill(); stroke(RED_D, 2);
            if (broken) { ctx.beginPath(); ctx.moveTo(mx, y0 - 4); ctx.lineTo(mx + 4, y0 - 7); ctx.lineTo(mx + 8, y0 - 3); ctx.lineTo(mx + 14, y0 - 6); stroke(RED_D, 1.2); }
        }
        sketchRect(x0, y0, b.w, b.h, 1.1, 11);
        ctx.fillStyle = b.flash > 0 ? '#fff4f5' : '#ffe1e4'; ctx.fill();
        ctx.save(); ctx.clip();
        hatch(x0, y0, b.w, b.h, 7, 'rgba(226,56,75,.28)', 1.1);
        ctx.strokeStyle = 'rgba(143,20,36,.25)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let ry = 0, row = 0; ry < b.h; ry += 13, row++) {
            ctx.moveTo(x0, y0 + ry); ctx.lineTo(x0 + b.w, y0 + ry);
            for (let rx = (row % 2) * 13; rx < b.w; rx += 26) { ctx.moveTo(x0 + rx, y0 + ry); ctx.lineTo(x0 + rx, y0 + ry + 13); }
        }
        ctx.stroke();
        const nc = Math.floor((1 - frac) * 9);
        for (let i = 0; i < Math.min(nc, g.cracks.length); i++) {
            const c = g.cracks[i]; ctx.beginPath(); c.forEach((p, k) => k ? ctx.lineTo(x0 + p[0], y0 + p[1]) : ctx.moveTo(x0 + p[0], y0 + p[1])); stroke('#4a0a14', 1.6);
        }
        ctx.restore();
        sketchRect(x0, y0, b.w, b.h, 1.1, 11); stroke(RED_D, 2.6);
        if (ST().shading) { sketchRect(x0, y0, b.w, b.h, 1.6, 47); stroke(RED_D, 1, 0.5); }

        const look = clamp((g.cx - b.x) / 70, -1, 1) * 2.5;
        for (const sx of [-1, 1]) {
            const ex = b.x + sx * 40, ey = y0 + 22;
            if (b.shake > 0) { ctx.beginPath(); ctx.moveTo(ex - 8, ey); ctx.lineTo(ex + 8, ey); stroke(NAVY, 2.4); continue; }
            sketchCircle(ex, ey, 9, 0.6, 300 + sx * 13, 12); ctx.fillStyle = '#fff'; ctx.fill(); stroke(RED_D, 2);
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex + look, ey + 3, 3.6, 0, 6.283); ctx.fill();
            ctx.beginPath();
            if (frac > 0.3) { ctx.moveTo(ex - sx * 12, ey - 14); ctx.lineTo(ex + sx * 9, ey - 7); }
            else { ctx.moveTo(ex - sx * 11, ey - 7); ctx.lineTo(ex + sx * 9, ey - 14); }
            stroke(NAVY, 2.6);
        }
        const mw = 34, mh = 24, mx0 = b.x - mw / 2, my0 = y0 + b.h - mh;
        ctx.beginPath(); ctx.moveTo(mx0, y0 + b.h); ctx.lineTo(mx0, my0 + 10); ctx.quadraticCurveTo(b.x, my0 - 8, mx0 + mw, my0 + 10); ctx.lineTo(mx0 + mw, y0 + b.h); ctx.closePath();
        ctx.fillStyle = '#4a0a14'; ctx.fill(); stroke(RED_D, 2);
        if (g.rot > 2) {
            ctx.globalAlpha = Math.min(0.85, g.rot / 40);
            ctx.fillStyle = '#5fbf3a';
            for (let i = 0; i < 9; i++) { const ox2 = x0 + 8 + i * (b.w - 16) / 8, len = 6 + ((i * 37) % 11) + Math.sin(performance.now() / 300 + i) * 3; ctx.beginPath(); ctx.ellipse(ox2, y0 + b.h + len / 2 - 2, 3, len / 2 + 2, 0, 0, 6.283); ctx.fill(); }
            ctx.fillRect(x0 + 2, y0 + b.h - 5, b.w - 4, 5);
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 4; i++) { const tx = mx0 + 4 + i * 8, up = (i === 1 || i === 2) ? 3 : 0; ctx.beginPath(); ctx.moveTo(tx, my0 + 6 - up); ctx.lineTo(tx + 6, my0 + 6 - up); ctx.lineTo(tx + 3, my0 + 12); ctx.fill(); }
        ctx.restore();
    }

    function drawGates(g) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const gt of g.gates) {
            const x = gt.x - gt.w / 2, y = gt.y - 13, a = 0.5 + gt.flash * 0.35;
            ctx.fillStyle = gt.op === 'x' ? `rgba(110,235,110,${a})` : `rgba(255,228,40,${a})`;
            ctx.beginPath();
            ctx.moveTo(x + wob(gt.seed) * 2, y + 1); ctx.lineTo(x + gt.w + wob(gt.seed + 1) * 2, y);
            ctx.lineTo(x + gt.w + 2 + wob(gt.seed + 2) * 2, y + 26); ctx.lineTo(x - 1 + wob(gt.seed + 3) * 2, y + 27); ctx.closePath(); ctx.fill();
            if (ST().shading) {
                ctx.fillStyle = gt.op === 'x' ? 'rgba(80,200,80,.25)' : 'rgba(240,200,0,.25)';
                ctx.fillRect(x + 3, y + 4, gt.w - 6, 4); ctx.fillRect(x + 6, y + 18, gt.w - 10, 3);
            }
            for (const px of [x - 1, x + gt.w + 1]) {
                ctx.beginPath(); ctx.moveTo(px + wob(px) * 0.8, y - 7); ctx.lineTo(px + wob(px + 4) * 0.8, y + 33); stroke(PENCIL, 2.6);
                sketchCircle(px, y - 9, 3.5, 0.4, px, 8); ctx.fillStyle = '#fff'; ctx.fill(); stroke(PENCIL, 1.5);
            }
            if (gt.amp) { ctx.font = `14px ${FONT}`; ctx.fillStyle = 'rgba(85,85,94,.7)'; ctx.fillText('↔', x + 12, y + 13); ctx.fillText('↔', x + gt.w - 12, y + 13); }
            const label = (gt.op === 'x' ? '×' : '+') + gt.v;
            ctx.font = `${Math.round(28 + gt.flash * 8)}px ${FONT}`;
            if (gt.gold) {
                ctx.setLineDash([4, 3]); sketchRect(x - 2, y - 2, gt.w + 4, 31, 0.6, gt.seed + 20); stroke('#d4a017', 2.2); ctx.setLineDash([]);
                star(x + 10, y + 13, 6, 2.5, '#ffd23c', '#a46f00'); star(x + gt.w - 10, y + 13, 6, 2.5, '#ffd23c', '#a46f00');
            }
            ctx.fillStyle = gt.gold ? '#8a6200' : NAVY; ctx.fillText(label, gt.x + wob(gt.seed + 9) * 0.6, gt.y + 1);
        }
    }

    function drawCannon(g) {
        const cx = g.cx, cy = CANNON_Y, rec = Math.min(1.5, g.recoil) * 4, up = U();
        ctx.fillStyle = 'rgba(40,40,60,.15)'; ctx.beginPath(); ctx.ellipse(cx, cy + 27, 36, 6, 0, 0, 6.283); ctx.fill();
        const barrels = up.multi === 0 ? [0] : up.multi === 1 ? [-7, 7] : [-12, 0, 12];
        const bw = up.multi === 0 ? 18 : up.multi === 1 ? 13 : 11;
        for (const off of barrels) {
            sketchRect(cx + off - bw / 2, cy - 42 + rec, bw, 36, 0.7, 31 + off);
            ctx.fillStyle = '#d6e4ff'; ctx.fill();
            ctx.save(); ctx.clip(); hatch(cx + off - bw / 2, cy - 42 + rec, bw, 36, 5, 'rgba(31,79,184,.35)', 1); ctx.restore();
            sketchRect(cx + off - bw / 2, cy - 42 + rec, bw, 36, 0.7, 31 + off); stroke(INK_D, 2.2);
            ctx.beginPath(); ctx.ellipse(cx + off, cy - 42 + rec, bw / 2 + 2, 3.5, 0, 0, 6.283); ctx.fillStyle = '#2a211b'; ctx.fill(); stroke(INK_D, 1.8);
            ctx.beginPath(); ctx.moveTo(cx + off - bw / 2, cy - 30 + rec); ctx.lineTo(cx + off + bw / 2, cy - 30 + rec); stroke(INK_D, 1.5);
        }
        if (g.mflash > 0) { ctx.globalAlpha = Math.min(1, g.mflash / 0.07); for (const off of barrels) star(cx + off, cy - 50 + rec, 11, 4.5, '#fff6b0', '#ffb02e'); ctx.globalAlpha = 1; }
        sketchRect(cx - 30, cy - 12, 60, 26, 0.9, 61);
        ctx.fillStyle = '#a9c4ff'; ctx.fill();
        ctx.save(); ctx.clip(); hatch(cx - 30, cy - 12, 60, 26, 5, 'rgba(23,58,138,.35)', 1.1); ctx.restore();
        sketchRect(cx - 30, cy - 12, 60, 26, 0.9, 61); stroke(INK_D, 2.4);
        star(cx, cy + 1, 6, 2.6, '#ffd23c', INK_D);
        for (const wx of [-19, 19]) {
            const x = cx + wx, y = cy + 17;
            sketchCircle(x, y, 9, 0.5, 70 + wx, 12); ctx.fillStyle = '#fffdf3'; ctx.fill(); stroke(INK_D, 2.2);
            ctx.beginPath();
            for (let k = 0; k < 3; k++) { const a = g.wheelA + k * Math.PI / 3; ctx.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); ctx.lineTo(x - Math.cos(a) * 8, y - Math.sin(a) * 8); }
            stroke(INK_D, 1.4);
        }
    }

    function drawSoldier(so) {
        const x = so.x, y = so.y;
        if (so.down > 0) {
            ctx.save(); ctx.translate(x, y + 8); ctx.rotate(Math.PI / 2 * 0.95);
            ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 6); stroke('#777', 2);
            ctx.beginPath(); ctx.arc(0, -12, 4.5, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); stroke('#777', 1.6);
            ctx.restore();
            ctx.font = `14px ${FONT}`; ctx.fillStyle = 'rgba(85,85,94,.8)'; ctx.textAlign = 'center'; ctx.fillText('z z', x + 8, y - 8 - Math.sin(performance.now() / 300) * 2);
            ctx.fillStyle = '#e2384b'; ctx.fillRect(x - 2, y + 2, 4, 9); ctx.fillRect(x - 4.5, y + 4.5, 9, 4);
            return;
        }
        const leg = Math.sin(so.run) * 5;
        ctx.fillStyle = 'rgba(30,30,60,.15)'; ctx.beginPath(); ctx.ellipse(x, y + 15, 8, 2.5, 0, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x - 3 + leg, y + 14); ctx.moveTo(x, y + 4); ctx.lineTo(x + 3 - leg, y + 14); stroke(NAVY, 2);
        ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 4); stroke(NAVY, 2.4);
        const gx = x + Math.cos(so.aim) * 12, gy = y - 2 + Math.sin(so.aim) * 12;
        ctx.beginPath(); ctx.moveTo(x, y - 2); ctx.lineTo(gx, gy); stroke('#2a211b', 3.2);
        ctx.beginPath(); ctx.moveTo(x - 4, y - 1); ctx.lineTo(x + Math.cos(so.aim) * 6, y - 2 + Math.sin(so.aim) * 6); stroke(NAVY, 1.6);
        ctx.beginPath(); ctx.arc(x, y - 10, 5, 0, 6.283); ctx.fillStyle = '#fff'; ctx.fill(); stroke(NAVY, 1.6);
        ctx.beginPath(); ctx.arc(x, y - 11, 6, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#3d7bf0'; ctx.fill(); stroke(INK_D, 1.4);
        ctx.fillStyle = '#111'; ctx.fillRect(x - 2.5, y - 10, 1.4, 1.6); ctx.fillRect(x + 1.2, y - 10, 1.4, 1.6);
        const mx = 3 + U().vest;
        if (so.hp < mx) { ctx.fillStyle = RED; for (let i = 0; i < so.hp; i++) ctx.fillRect(x - mx * 2.5 + i * 5, y - 22, 4, 3); }
    }
    function drawBurn(g) {
        const t = performance.now() / 1000;
        let hottest = null;
        for (const sp of g.fires) {
            const h = sp.h; if (h < 6) continue;
            const k = h / 100, x = sp.x, y = sp.y, sd = sp.seed;
            if (!hottest || h > hottest.h) hottest = sp;
            // heat glow + brown scorch soaking into the paper
            const R = 10 + 26 * k;
            const gl = ctx.createRadialGradient(x, y, 1, x, y, R * 1.8);
            gl.addColorStop(0, `rgba(255,150,40,${0.28 * k})`); gl.addColorStop(1, 'rgba(255,150,40,0)');
            ctx.fillStyle = gl; ctx.fillRect(x - R * 1.8, y - R * 1.8, R * 3.6, R * 3.6);
            const sc = ctx.createRadialGradient(x, y, 0, x, y, R);
            sc.addColorStop(0, `rgba(70,35,10,${Math.min(0.75, k * 0.9)})`); sc.addColorStop(0.7, `rgba(120,70,20,${0.35 * k})`); sc.addColorStop(1, 'rgba(120,70,20,0)');
            ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.7, 0, 0, 6.283); ctx.fill();
            // glowing ember rim where the paper is eating away
            if (h > 40) {
                ctx.setLineDash([3, 3]); ctx.beginPath();
                for (let i = 0; i <= 14; i++) { const a = i / 14 * 6.283, rr = R * 0.62 * (0.85 + 0.15 * hsh(sd + i)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7); }
                ctx.closePath(); stroke(`rgb(255,${120 + Math.round(Math.sin(t * 8 + sd) * 40)},30)`, 1.8, Math.min(1, (h - 40) / 30)); ctx.setLineDash([]);
            }
            // burnt-through hole
            if (h > 80) {
                const hr = (h - 80) / 20 * R * 0.35;
                ctx.fillStyle = '#2a211b'; ctx.beginPath();
                for (let i = 0; i <= 10; i++) { const a = i / 10 * 6.283, rr = hr * (0.7 + 0.3 * hsh(sd + 40 + i)); i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7); }
                ctx.fill();
            }
            // flames rising off the spot
            if (h > 58) {
                const n = h > 85 ? 4 : h > 70 ? 3 : 2, fk = (h - 58) / 42;
                for (let i = 0; i < n; i++) {
                    const fx = x + (i - (n - 1) / 2) * 7 + Math.sin(t * 5 + sd + i) * 1.5, fh = (10 + 34 * fk) * (0.65 + 0.35 * Math.sin(t * 11 + sd * 3 + i * 2.1)), fw = 5 + 4 * fk;
                    ctx.beginPath(); ctx.moveTo(fx - fw, y + 2); ctx.quadraticCurveTo(fx - fw * 0.7, y - fh * 0.55, fx + Math.sin(t * 7 + i + sd) * 3, y - fh);
                    ctx.quadraticCurveTo(fx + fw * 0.7, y - fh * 0.55, fx + fw, y + 2); ctx.closePath();
                    ctx.fillStyle = 'rgba(255,128,30,.9)'; ctx.fill(); stroke('#c4400a', 1.3);
                    ctx.beginPath(); ctx.moveTo(fx - fw * 0.45, y + 2); ctx.quadraticCurveTo(fx, y - fh * 0.5, fx + fw * 0.45, y + 2); ctx.fillStyle = '#ffd23c'; ctx.fill();
                }
            }
        }
        if (hottest && hottest.h > 72) {
            ctx.textAlign = 'center'; ctx.font = `${22 + Math.sin(t * 10) * 2}px ${FONT}`;
            ctx.lineWidth = 4; ctx.strokeStyle = '#fffdf3'; ctx.fillStyle = '#d4300a';
            const ty = clamp(hottest.y - 58, DEF_Y - 120, H - 30), tx = clamp(hottest.x, 110, PW - 110);
            ctx.strokeText('Fire! Tap 💧', tx, ty); ctx.fillText('Fire! Tap 💧', tx, ty);
        }
    }
    function drawAimLine(g) {
        const a = g.ha, aiming = [...ptrs.values()].some(p => p.mode === 'turret');
        let x = TUR_X + Math.sin(a) * 40, y = TUR_Y - Math.cos(a) * 40, vx = Math.sin(a), vy = -Math.cos(a);
        const b = g.base, baseBottom = b.y + b.h / 2;
        const dots = []; let travelled = 0, off = (performance.now() / 40) % 14;
        for (let step = 0; step < 900 && travelled < 820; step++) {
            x += vx * 4; y += vy * 4; travelled += 4;
            if (x < 10 || x > PW - 10) { vx = -vx; x = clamp(x, 10, PW - 10); }
            if (y < 24 || (y < baseBottom && Math.abs(x - b.x) < b.w / 2)) break;
            if ((travelled + off) % 14 < 4) dots.push(x, y);
        }
        ctx.fillStyle = aiming ? 'rgba(31,111,224,.85)' : 'rgba(31,111,224,.45)';
        for (let i = 0; i < dots.length; i += 2) { const fade = 1 - i / dots.length * 0.6; ctx.globalAlpha = fade; ctx.beginPath(); ctx.arc(dots[i], dots[i + 1], 2.1, 0, 6.283); ctx.fill(); }
        ctx.globalAlpha = 1;
        if (dots.length) { ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.283); stroke('#1f6fe0', 1.8, aiming ? 0.8 : 0.45); }
    }
    function drawTurret(g) {
        const TX = TUR_X, TY = TUR_Y, a = g.ha, rec = g.hrec * 6, up = U();
        ctx.save(); ctx.translate(TX, TY); ctx.rotate(a);
        sketchRect(-10, -44 + rec, 20, 40, 0.7, 401); ctx.fillStyle = '#c9cde0'; ctx.fill();
        ctx.save(); ctx.clip(); hatch(-10, -44 + rec, 20, 40, 4, 'rgba(30,35,60,.45)', 1.1); ctx.restore();
        sketchRect(-10, -44 + rec, 20, 40, 0.7, 401); stroke('#2b3150', 2.4);
        ctx.beginPath(); ctx.moveTo(-11, -32 + rec); ctx.lineTo(11, -32 + rec); ctx.moveTo(-11, -20 + rec); ctx.lineTo(11, -20 + rec); stroke('#2b3150', 1.8);
        ctx.beginPath(); ctx.ellipse(0, -44 + rec, 12, 4, 0, 0, 6.283); ctx.fillStyle = '#15120f'; ctx.fill(); stroke('#2b3150', 2);
        if (g.hflash > 0) { ctx.globalAlpha = g.hflash / 0.1; star(0, -54 + rec, 15, 6, '#ffd23c', '#e0700a'); ctx.globalAlpha = 1; }
        ctx.restore();
        // bunker dome
        const dome = () => {
            ctx.beginPath(); ctx.moveTo(TX - 30, TY + 10); ctx.lineTo(TX - 30, TY);
            for (let i = 0; i <= 12; i++) { const t = Math.PI + i / 12 * Math.PI; ctx.lineTo(TX + Math.cos(t) * 30 + wob(i + 420) * 0.7, TY + Math.sin(t) * 24 + wob(i + 440) * 0.7); }
            ctx.lineTo(TX + 30, TY + 10); ctx.closePath();
        };
        dome(); ctx.fillStyle = '#8f98b8'; ctx.fill();
        ctx.save(); dome(); ctx.clip(); hatch(TX - 30, TY - 24, 60, 34, 5, 'rgba(20,25,50,.35)', 1.1); ctx.restore();
        dome(); stroke('#2b3150', 2.6);
        ctx.fillStyle = '#2b3150'; for (const bx of [-18, 0, 18]) { ctx.beginPath(); ctx.arc(TX + bx, TY - (bx ? 9 : 15), 2, 0, 6.283); ctx.fill(); }
        const reload = Math.max(0.6, 1.8 - 0.12 * up.hrel), ready = 1 - clamp(g.hT / reload, 0, 1);
        ctx.beginPath(); ctx.arc(TX, TY, 34, Math.PI, Math.PI + Math.PI * ready); stroke(ready >= 1 ? '#e0a800' : '#55555e', 3, ready >= 1 ? 0.9 : 0.5);
    }
    function drawChampion(c) {
        const s = c.s, r = 16 * s;
        ctx.fillStyle = 'rgba(30,30,60,.15)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + r + 3, r, 4, 0, 0, 6.283); ctx.fill();
        sketchCircle(c.x, c.y, r, 0.8, 500, 16); ctx.fillStyle = '#3d7bf0'; ctx.fill();
        ctx.save(); ctx.clip(); hatch(c.x - r, c.y - r, r * 2, r * 2, 4, 'rgba(0,0,0,.15)', 1); ctx.restore();
        sketchCircle(c.x, c.y, r, 0.8, 500, 16); stroke(INK_D, 2.4);
        ctx.beginPath(); const cy = c.y - r + 1;
        ctx.moveTo(c.x - 11 * s, cy); ctx.lineTo(c.x - 12 * s, cy - 11 * s); ctx.lineTo(c.x - 5 * s, cy - 5 * s); ctx.lineTo(c.x, cy - 13 * s);
        ctx.lineTo(c.x + 5 * s, cy - 5 * s); ctx.lineTo(c.x + 12 * s, cy - 11 * s); ctx.lineTo(c.x + 11 * s, cy); ctx.closePath();
        ctx.fillStyle = '#ffd23c'; ctx.fill(); stroke('#a46f00', 1.6);
        for (const sx of [-1, 1]) {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x + sx * 6 * s, c.y - 1, 4.2 * s, 0, 6.283); ctx.fill();
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(c.x + sx * 6 * s, c.y - 2.5, 2.2 * s, 0, 6.283); ctx.fill();
            ctx.beginPath(); ctx.moveTo(c.x + sx * 10 * s, c.y - 7 * s); ctx.lineTo(c.x + sx * 2 * s, c.y - 5 * s); stroke('#0f2c6e', 1.8);
        }
        ctx.beginPath(); ctx.arc(c.x, c.y + 6 * s, 4 * s, 0.2, Math.PI - 0.2); stroke('#0f2c6e', 1.6);
        ctx.beginPath(); ctx.arc(c.x, c.y, r + 5, -Math.PI / 2, -Math.PI / 2 + 6.283 * c.hp / c.max); stroke('#e0a800', 2.4);
    }

    function drawHUD(g) {
        const b = g.base, invisRight = (PFY < 64) && !GW && (SW - (PFX + PW) < 50);
        // HP bar (leaves room for the button column when it sits on the page)
        const bx = Math.round(PW / 2 - 68), by = 10, bw = invisRight ? 150 : 166, bh = 17, frac = b.hp / b.max;
        sketchRect(bx, by, bw, bh, 0.8, 800); ctx.fillStyle = 'rgba(255,253,243,.95)'; ctx.fill();
        ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw * frac, bh); ctx.clip();
        ctx.fillStyle = 'rgba(226,56,75,.35)'; ctx.fillRect(bx, by, bw, bh);
        ctx.beginPath(); for (let x = bx - bh; x < bx + bw; x += 4) { ctx.moveTo(x, by + bh); ctx.lineTo(x + bh, by); } stroke(RED, 2.2, 0.85);
        ctx.restore();
        sketchRect(bx, by, bw, bh, 0.8, 800); stroke(NAVY, 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `17px ${FONT}`; ctx.fillStyle = NAVY;
        ctx.fillText(Math.ceil(b.hp) + ' / ' + b.max, bx + bw / 2, by + bh / 2 + 1);

        ctx.textAlign = 'left';
        ctx.font = `22px ${FONT}`; ctx.fillStyle = INK_D; ctx.fillText('Lv ' + g.n, 56, 20);
        sketchCircle(64, 46, 8, 0.5, 820, 12); ctx.fillStyle = '#ffd23c'; ctx.fill(); stroke('#a46f00', 1.6);
        ctx.font = `12px ${FONT}`; ctx.fillStyle = '#a46f00'; ctx.textAlign = 'center'; ctx.fillText('$', 64, 47);
        ctx.textAlign = 'left'; ctx.font = `20px ${FONT}`; ctx.fillStyle = '#a46f00'; ctx.fillText(S.coins, 77, 47);
        const hurt = g.hurt > 0;
        heart(64, 74, 9 * (hurt ? 1.25 : 1), hurt ? '#ff2d45' : RED);
        ctx.fillStyle = hurt ? RED : NAVY; ctx.font = `20px ${FONT}`; ctx.fillText('× ' + g.hp, 77, 73);
        ctx.font = `15px ${FONT}`; ctx.fillStyle = 'rgba(31,79,184,.75)'; ctx.fillText('mob: ' + g.blues.length, 56, 98);
        if (ST().showFps) { ctx.fillStyle = 'rgba(29,42,77,.8)'; ctx.fillText(fpsShown + ' fps', 56, 120); }
        if (g.frenzy > 0) {
            ctx.textAlign = 'center'; ctx.font = `${24 + Math.sin(performance.now() / 90) * 3}px ${FONT}`;
            ctx.fillStyle = '#e0a800'; ctx.strokeStyle = '#fffdf3'; ctx.lineWidth = 4;
            ctx.strokeText('FRENZY ×2', bx + bw / 2, by + bh + 16); ctx.fillText('FRENZY ×2', bx + bw / 2, by + bh + 16);
        }
    }

    function drawWaterBtn(g) {
        const k = g.burn / 100, hot = k > 0.6, pulse = hot ? 1 + Math.sin(performance.now() / 110) * 0.08 : 1;
        sketchCircle(FB.x, FB.y, FB.r * pulse, 0.8, 880, 14);
        ctx.fillStyle = g.wetT > 0 ? 'rgba(170,215,255,.95)' : 'rgba(255,253,243,.95)'; ctx.fill();
        if (k > 0) {
            ctx.save(); ctx.beginPath(); ctx.moveTo(FB.x, FB.y); ctx.arc(FB.x, FB.y, FB.r, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); ctx.closePath(); ctx.clip();
            ctx.fillStyle = k > 0.75 ? 'rgba(230,70,20,.55)' : k > 0.5 ? 'rgba(255,140,30,.45)' : 'rgba(255,190,60,.35)'; ctx.fillRect(FB.x - FB.r, FB.y - FB.r, FB.r * 2, FB.r * 2);
            ctx.restore();
        }
        sketchCircle(FB.x, FB.y, FB.r * pulse, 0.8, 880, 14); stroke(hot ? '#c4400a' : '#1f6fd0', 2.4);
        ctx.beginPath(); ctx.moveTo(FB.x, FB.y - 12); ctx.quadraticCurveTo(FB.x + 10, FB.y + 2, FB.x, FB.y + 9); ctx.quadraticCurveTo(FB.x - 10, FB.y + 2, FB.x, FB.y - 12);
        ctx.fillStyle = '#4a9cf5'; ctx.fill(); stroke('#1f4fb8', 1.6);
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(FB.x - 3, FB.y + 1, 2, 0, 6.283); ctx.fill();
        if (g.wetT > 0) { ctx.textAlign = 'center'; ctx.font = `12px ${FONT}`; ctx.fillStyle = '#1f6fd0'; ctx.fillText('wet ' + Math.ceil(g.wetT) + 's', FB.x, FB.y - FB.r - 7); }
    }
    function drawChampBtn(g) {
        const ready = g.charge >= 1, pulse = ready ? 1 + Math.sin(performance.now() / 150) * 0.07 : 1;
        sketchCircle(CB.x, CB.y, CB.r * pulse, 0.9, 900, 16);
        ctx.fillStyle = ready ? 'rgba(255,228,40,.9)' : 'rgba(255,253,243,.9)'; ctx.fill();
        if (!ready) {
            ctx.save(); ctx.beginPath(); ctx.moveTo(CB.x, CB.y); ctx.arc(CB.x, CB.y, CB.r, -Math.PI / 2, -Math.PI / 2 + 6.283 * g.charge); ctx.closePath(); ctx.clip();
            ctx.beginPath(); for (let x = CB.x - CB.r * 2; x < CB.x + CB.r; x += 3.5) { ctx.moveTo(x, CB.y + CB.r); ctx.lineTo(x + CB.r * 2, CB.y - CB.r); } stroke(INK, 1.6, 0.6);
            ctx.restore();
        }
        sketchCircle(CB.x, CB.y, CB.r * pulse, 0.9, 900, 16); stroke(ready ? '#a46f00' : INK_D, 2.4);
        star(CB.x, CB.y - (ready ? 3 : 0), 13 * pulse, 5.5 * pulse, ready ? '#fff' : 'rgba(255,210,60,.9)', ready ? '#a46f00' : INK_D);
        if (ready) { ctx.textAlign = 'center'; ctx.font = `14px ${FONT}`; ctx.fillStyle = NAVY; ctx.fillText('GO!', CB.x, CB.y + 16); }
    }

// two slider lanes at the screen edges: one drives the cannon, the other aims the heavy cannon
    function drawLanes(g) {
        if (!GW) return;
        const cannonRight = ST().side === 'right';
        drawLane(g, SW - GW, true, cannonRight ? 'cannon' : 'turret');
        drawLane(g, 0, false, cannonRight ? 'turret' : 'cannon');
    }
    function drawLane(g, gx, right, role) {
        const top = -sy0 / scale, bot = (innerHeight - sy0) / scale;
        ctx.fillStyle = role === 'turret' ? '#eceae3' : '#f3eedd'; ctx.fillRect(gx, top, GW, bot - top);
        ctx.strokeStyle = 'rgba(105,155,220,.45)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let k = Math.floor((top - PFY - LINE0) / LS); PFY + lineY(k) < bot; k++) { const y = PFY + lineY(k) + 0.5; ctx.moveTo(gx, y); ctx.lineTo(gx + GW, y); }
        ctx.stroke();
        const ex = right ? gx + 0.5 : gx + GW - 0.5;
        ctx.strokeStyle = 'rgba(80,60,40,.45)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(ex, top); ctx.lineTo(ex, bot); ctx.stroke(); ctx.setLineDash([]);
        const sh = ctx.createLinearGradient(ex, 0, ex + (right ? 8 : -8), 0);
        sh.addColorStop(0, 'rgba(0,0,0,.12)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh; ctx.fillRect(right ? ex : ex - 8, top, 8, bot - top);

        const rx = gx + GW / 2, y1 = 175, y2 = SH - 42, flip = ST().flip;
        const active = [...ptrs.values()].some(p => p.mode === (role === 'cannon' ? 'slide' : 'turret'));
        if (active) { ctx.fillStyle = 'rgba(31,79,184,.07)'; ctx.fillRect(gx, 150, GW, SH - 150); }
        ctx.beginPath(); ctx.moveTo(rx - 4 + wob(1) * 0.5, y1); ctx.lineTo(rx - 4 + wob(2) * 0.5, y2);
        ctx.moveTo(rx + 4 + wob(3) * 0.5, y1); ctx.lineTo(rx + 4 + wob(4) * 0.5, y2); stroke(PENCIL, 1.6, 0.8);
        ctx.beginPath(); for (let y = y1 + 15; y < y2; y += 31) { ctx.moveTo(rx - 9, y); ctx.lineTo(rx - 5, y); ctx.moveTo(rx + 5, y); ctx.lineTo(rx + 9, y); } stroke(PENCIL, 1.2, 0.6);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `22px ${FONT}`; ctx.fillStyle = role === 'cannon' ? 'rgba(31,79,184,.8)' : 'rgba(43,49,80,.8)';
        const upSym = role === 'cannon' ? (flip ? '◀' : '▶') : (flip ? '↺' : '↻'), dnSym = role === 'cannon' ? (flip ? '▶' : '◀') : (flip ? '↻' : '↺');
        ctx.fillText(upSym, rx, y1 - 16); ctx.fillText(dnSym, rx, y2 + 20);
        const frac = role === 'cannon' ? (g.cx - CMIN) / (CMAX - CMIN) : (g.ha + 1.15) / 2.3;
        const ky = flip ? y1 + frac * (y2 - y1) : y2 - frac * (y2 - y1);
        const fillOn = role === 'cannon' ? 'rgba(61,123,240,.95)' : 'rgba(80,90,130,.95)';
        sketchCircle(rx, ky, 16, 0.7, role === 'cannon' ? 950 : 970, 14); ctx.fillStyle = active ? fillOn : 'rgba(255,253,243,.95)'; ctx.fill(); stroke(role === 'cannon' ? INK_D : '#2b3150', 2.4);
        if (role === 'cannon') { ctx.beginPath(); for (const d of [-5, 0, 5]) { ctx.moveTo(rx - 6, ky + d); ctx.lineTo(rx + 6, ky + d); } stroke(active ? '#fff' : INK_D, 1.6); }
        else { ctx.beginPath(); ctx.arc(rx, ky, 7, 0, 6.283); ctx.moveTo(rx - 11, ky); ctx.lineTo(rx + 11, ky); ctx.moveTo(rx, ky - 11); ctx.lineTo(rx, ky + 11); stroke(active ? '#fff' : '#2b3150', 1.6); }
        if (g.t < 6 && state === 'play') {
            ctx.save(); ctx.translate(rx + (right ? -19 : 19), (y1 + y2) / 2); ctx.rotate(right ? -Math.PI / 2 : Math.PI / 2);
            ctx.font = `14px ${FONT}`; ctx.fillStyle = 'rgba(31,79,184,.7)'; ctx.fillText(role === 'cannon' ? 'move cannon' : 'aim heavy cannon', 0, 0); ctx.restore();
        }
    }

    function draw() {
        const g = G;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(page, 0, 0, cv.width, cv.height);
        ctx.setTransform(scale * rdpr, 0, 0, scale * rdpr, sx0 * rdpr, sy0 * rdpr);
        drawLanes(g);
        ctx.save();
        ctx.translate(PFX, PFY);
        ctx.beginPath(); ctx.rect(0, 0, PW, H); ctx.clip();

        ctx.save();
        if (g.shake > 0 && SHAKE()) ctx.translate(rand(-4, 4) * g.shake * 3, rand(-4, 4) * g.shake * 3);
        if (DMG()) ctx.drawImage(dec, 0, 0, PW * DS, H * DS, 0, 0, PW, H);
        const dpts = []; for (let x = 52; x <= PW - 6; x += 38) dpts.push([x, DEF_Y]);
        sketchPoly(dpts, false, 1, 700); stroke(g.hurt > 0 ? '#ff2d45' : RED, 2.4, 0.9);
        sketchPoly(dpts.map(p => [p[0], p[1] + 4]), false, 1, 760); stroke(RED, 1.2, 0.6);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `15px ${FONT}`; ctx.fillStyle = 'rgba(226,56,75,.75)';
        ctx.fillText('↑ don\'t let them cross! ↑', PW / 2 - 25, DEF_Y + 15);

        for (const s of g.slits) drawSlit(s.x, s.y, s.w, s.open, s.giant ? '#b0142a' : '#7a0a18');
        drawGates(g);
        drawTower(g);

        for (const r of g.reds) if (!r.giant) spr(r.green ? SPR.green : SPR.red, r.x, r.y, r.s);
        for (const r of g.reds) {
            if (!r.giant) continue;
            spr(SPR.giant, r.x, r.y, r.s);
            const w = 28, y = r.y - r.r - 9;
            ctx.fillStyle = 'rgba(255,253,243,.9)'; ctx.fillRect(r.x - w / 2, y, w, 5);
            ctx.fillStyle = RED; ctx.fillRect(r.x - w / 2, y, w * r.hp / r.max, 5);
            ctx.strokeStyle = NAVY; ctx.lineWidth = 1; ctx.strokeRect(r.x - w / 2, y, w, 5);
        }

        drawBurn(g);
        drawAimLine(g);
        for (const m of g.blues) spr(m.c ? SPR.vir : m.big ? SPR.big : SPR.blue, m.x, m.y, m.s);
        for (const c of g.champs) drawChampion(c);
        for (const so of g.soldiers) drawSoldier(so);
        ctx.fillStyle = '#2a211b';
        for (const bl of g.bullets) { ctx.beginPath(); ctx.moveTo(bl.x, bl.y); ctx.lineTo(bl.x - bl.vx * 0.02, bl.y - bl.vy * 0.02); stroke('#2a211b', 2.2); }
        drawTurret(g);
        drawCannon(g);
        for (const sh of g.shells) {
            ctx.fillStyle = 'rgba(30,25,20,.18)'; ctx.beginPath(); ctx.ellipse(sh.x + 3, sh.y + 5, 6, 3, 0, 0, 6.283); ctx.fill();
            sketchCircle(sh.x, sh.y, 6.5, 0.4, 610, 10); ctx.fillStyle = '#2b3150'; ctx.fill(); stroke('#111', 1.6);
            ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(sh.x - 2, sh.y - 2, 1.8, 0, 6.283); ctx.fill();
            star(sh.x, sh.y + 8, 3.5, 1.5, '#ffb02e');
        }
        for (const bm of g.booms) {
            const k = bm.t / 0.35;
            ctx.beginPath(); ctx.arc(bm.x, bm.y, bm.R * (0.4 + k * 0.7), 0, 6.283); stroke('#ff9a2e', 4 * (1 - k) + 1, 1 - k);
            if (k < 0.4) { ctx.globalAlpha = 1 - k / 0.4; star(bm.x, bm.y, bm.R * 0.55, bm.R * 0.25, '#ffd23c', '#e0700a'); ctx.globalAlpha = 1; }
        }

        for (const p of g.parts) {
            const a = Math.min(1, p.life / p.max * 1.6);
            if (p.type === 2) { ctx.fillStyle = p.c + (0.25 * a).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); continue; }
            ctx.globalAlpha = a;
            if (p.type === 1) {
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r * 0.7, p.r * 2, p.r * 1.4);
                ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 0.6; ctx.strokeRect(-p.r, -p.r * 0.7, p.r * 2, p.r * 1.4);
                ctx.restore();
            } else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
        }
        ctx.globalAlpha = 1;

        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const t of g.texts) {
            ctx.globalAlpha = Math.min(1, t.life * 2); ctx.font = `${t.size}px ${FONT}`;
            ctx.lineWidth = 4; ctx.strokeStyle = '#fffdf3'; ctx.strokeText(t.txt, t.x, t.y); ctx.fillStyle = t.c; ctx.fillText(t.txt, t.x, t.y);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        drawHUD(g);
        drawChampBtn(g);
        drawWaterBtn(g);

        const low = g.hp / g.maxHp;
        if (g.hurt > 0 || (low <= 0.3 && !g.over && state === 'play')) {
            const a = g.hurt > 0 ? 0.35 : 0.12 + Math.sin(performance.now() / 200) * 0.08;
            const gr = ctx.createLinearGradient(0, H, 0, H - 200);
            gr.addColorStop(0, `rgba(226,56,75,${a})`); gr.addColorStop(1, 'rgba(226,56,75,0)');
            ctx.fillStyle = gr; ctx.fillRect(0, H - 200, PW, 200);
        }
        if (state === 'play' && g.t < 3 && ptrs.size === 0 && g.blues.length === 0 && !ST().autofire) {
            ctx.textAlign = 'center'; ctx.font = `26px ${FONT}`;
            ctx.globalAlpha = 0.6 + Math.sin(performance.now() / 200) * 0.3; ctx.fillStyle = INK_D;
            ctx.fillText(GW ? 'Hold & slide to fire!' : 'Hold to fire!', PW / 2, DEF_Y - 32); ctx.globalAlpha = 1;
        }
        ctx.restore();
    }

    /* ================= layout (fits every screen, re-runs on fold/rotate) ================= */
    const RES = { low: 1, med: 1.5, high: 2 };
    function safeRect() {
        const r = $('safe').getBoundingClientRect();
        if (r.width > 50 && r.height > 50) return { x: r.left, y: r.top, w: r.width, h: r.height };
        return { x: 0, y: 0, w: innerWidth, h: innerHeight };
    }
    function maxRes() { return Math.min(window.devicePixelRatio || 1, 3); }
    function layout() {
        const st = ST();
        GW = st.sliderVis ? GUT : 0;
        TW = PW + GW * 2;
        CB.x = st.side === 'left' ? PW - 46 : 46; FB.x = CB.x;
        const sr = safeRect();
        sx0 = sr.x; sy0 = sr.y;
        // scale so the game + lane always fit, then spread spare room as extra paper so the WHOLE screen is used
        scale = Math.min(sr.w / TW, sr.h / H);
        SW = sr.w / scale; SH = sr.h / scale;
        PFX = GW + (SW - 2 * GW - PW) / 2;
        PFY = SH - H;
        const dev = window.devicePixelRatio || 1;
        rdpr = st.res === 'native' ? maxRes() : st.res === 'auto' ? Math.min(autoR, maxRes()) : Math.min(dev, RES[st.res] || 2);
        rdpr = Math.max(0.75, rdpr);
        cv.width = Math.max(1, Math.round(innerWidth * rdpr)); cv.height = Math.max(1, Math.round(innerHeight * rdpr));
        const stg = $('stage');
        stg.style.left = sr.x + 'px'; stg.style.top = sr.y + 'px'; stg.style.width = sr.w + 'px'; stg.style.height = sr.h + 'px';
        stg.style.fontSize = clamp(17 * Math.min(scale, sr.w / 420), 11, 26) + 'px';
        const top = $('top');
        const colX = GW ? SW - GW / 2 : SW - 24;
        top.style.left = (colX * scale) + 'px'; top.style.transform = 'translateX(-50%)'; top.style.top = ((PFY > 64 ? PFY : 0) + 6) * scale + 'px';
        buildSprites();
        buildPage();
    }
    let layoutQueued = false;
    function queueLayout() { if (layoutQueued) return; layoutQueued = true; requestAnimationFrame(() => { layoutQueued = false; layout(); }); }
    addEventListener('resize', queueLayout);
    addEventListener('orientationchange', () => setTimeout(layout, 150));
    if (window.visualViewport) visualViewport.addEventListener('resize', queueLayout);
    try { new ResizeObserver(queueLayout).observe(document.documentElement); } catch (e) {}
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());

    /* ================= input ================= */
    const keys = { left: false, right: false, fire: false, q: false, e: false };
    const ptrs = new Map();
    function pagePos(e) { return { x: (e.clientX - sx0) / scale - PFX, y: (e.clientY - sy0) / scale - PFY }; }
    function laneAt(p) {
        const st = ST(), sx = p.x + PFX, sy = p.y + PFY;
        let side = null;
        if (st.sliderVis) { if (sy > 150) { if (sx >= PFX + PW - 1) side = 'right'; else if (sx <= PFX + 1) side = 'left'; } }
        else if (p.y > INV_ZONE_Y) { if (sx > PFX + PW - INV_ZONE) side = 'right'; else if (sx < PFX + INV_ZONE) side = 'left'; }
        if (!side) return null;
        return side === st.side ? 'slide' : 'turret';
    }
    cv.addEventListener('pointerdown', e => {
        audio();
        if (state !== 'play' || !G || G.over) return;
        e.preventDefault();
        const p = pagePos(e);
        if (Math.hypot(p.x - CB.x, p.y - CB.y) < CB.r + 8) { launchChampion(); return; }
        if (Math.hypot(p.x - FB.x, p.y - FB.y) < FB.r + 8) { douse(); return; }
        const lane = laneAt(p);
        if (lane) ptrs.set(e.pointerId, { mode: lane, lastY: p.y });
        else { ptrs.set(e.pointerId, { mode: 'aim' }); G.tx = clamp(p.x, CMIN, CMAX); }
        try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    });
    cv.addEventListener('pointermove', e => {
        const o = ptrs.get(e.pointerId); if (!o || !G) return;
        const p = pagePos(e);
        if (o.mode === 'slide') {
            const dy = p.y - o.lastY; o.lastY = p.y;
            G.tx = clamp(G.tx + (ST().flip ? dy : -dy) * (CMAX - CMIN) / 300 * ST().sens / 100, CMIN, CMAX);
        } else if (o.mode === 'turret') {
            const dy = p.y - o.lastY; o.lastY = p.y;
            G.hta = clamp(G.hta + (ST().flip ? dy : -dy) * 0.0078 * ST().sens / 100, -1.15, 1.15);
        } else G.tx = clamp(p.x, CMIN, CMAX);
    });
    const release = e => ptrs.delete(e.pointerId);
    cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release); cv.addEventListener('lostpointercapture', release);
    addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
        else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        else if (e.key === ' ') { keys.fire = true; e.preventDefault(); }
        else if (e.key === 'q') keys.q = true;
        else if (e.key === 'w' && state === 'play') douse();
        else if (e.key === 'e') keys.e = true;
        else if ((e.key === 'c' || e.key === 'Enter') && state === 'play') launchChampion();
        else if ((e.key === 'p' || e.key === 'Escape') && (state === 'play' || state === 'paused')) togglePause();
    });
    addEventListener('keyup', e => {
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
        else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
        else if (e.key === ' ') keys.fire = false;
        else if (e.key === 'q') keys.q = false;
        else if (e.key === 'e') keys.e = false;
    });

    /* ================= screens ================= */
    const screens = ['menu', 'shop', 'result', 'paused', 'settings'];
    function show(id) { screens.forEach(s => $(s).classList.toggle('hidden', s !== id)); }
    function refreshMenu() {
        $('menuCoins').textContent = '🪙 ' + S.coins + ' coins';
        $('playBtn').textContent = 'Play Level ' + S.level;
        $('menuCoins').innerHTML = '🪙 ' + S.coins + ' coins' + (S.best > 1 ? '<br><span class="small">Best: Level ' + S.best + '</span>' : '');
        $('muteBtn').textContent = ST().muted ? '🔇' : '🔊';
    }
    function startLevel() { ptrs.clear(); G = makeLevel(S.level); state = 'play'; show(null); }
    function showResult() {
        state = 'result';
        const n = G.n, mult = 1 + 0.1 * U().coin;
        let reward;
        if (G.won) {
            reward = Math.round((40 + n * 15 + Math.floor(G.kills / 5)) * mult);
            S.level = n + 1; S.best = Math.max(S.best, S.level);
            $('resTitle').textContent = 'Tower Wrecked! 🎉';
            $('resNext').textContent = 'Next: Level ' + S.level;
        } else {
            reward = Math.round((5 + Math.floor(G.kills / 6)) * mult);
            S.level = 1;
            $('resTitle').textContent = G.reason === 'fire' ? 'The page burned! 🔥' : 'Line got torn!';
            $('resNext').textContent = 'Start Over: Level 1';
        }
        const bonus = G.bonus || 0;
        reward += bonus;
        S.coins += reward; save();
        $('resText').innerHTML = `Reds squashed: <b>${G.kills}</b><br>Coins earned: <b>🪙 ${reward}</b>` + (bonus ? ` <span class="small">(${bonus} lucky)</span>` : '') +
            (G.won ? `<br><span class="small">Fires put out: ${G.outs}</span>` : (G.reason === 'fire' ? '<br>Tap the 💧 button before the flames spread!' : '') + `<br>Tower had <b>${Math.ceil(G.base.hp)}</b> left.<br>Back to Level 1. Your coins &amp; upgrades stay!`);
        // level is over: wipe the board behind the result card so the next start is fresh
        G = makeLevel(S.level); ptrs.clear();
        show('result');
    }
    let shopTab = 0;
    function renderShop() {
        $('shopCoins').textContent = '🪙 ' + S.coins + ' coins';
        const cats = UP.filter(u => u.cat);
        const tabs = $('shopTabs'); tabs.innerHTML = '';
        cats.forEach((c, i) => {
            const b = document.createElement('button'); b.textContent = c.tab; if (i === shopTab) b.className = 'on';
            b.onclick = () => { shopTab = i; renderShop(); $('shop').querySelector('.card').scrollTop = 0; };
            tabs.appendChild(b);
        });
        const list = $('upList'); list.innerHTML = '';
        let ci = -1;
        for (const u of UP) {
            if (u.cat) { ci++; if (ci === shopTab) { const h = document.createElement('div'); h.className = 'cat'; h.textContent = u.cat; list.appendChild(h); } continue; }
            if (ci !== shopTab) continue;
            const l = S.up[u.k], maxed = l >= u.max, cost = u.cost(l);
            const row = document.createElement('div'); row.className = 'up';
            row.innerHTML = `<div class="info"><b>${u.name}</b><small>${u.desc}</small><span class="now">Now: ${u.fx(l)}</span>` +
                (maxed ? '' : `<span class="small"> → ${u.fx(l + 1)}</span>`) +
                `<div class="pips">${'●'.repeat(l)}${'○'.repeat(u.max - l)}</div></div>`;
            const btn = document.createElement('button');
            btn.textContent = maxed ? 'MAX' : '🪙 ' + cost;
            btn.disabled = maxed || S.coins < cost;
            btn.onclick = () => {
                if (S.up[u.k] >= u.max || S.coins < cost) return;
                S.coins -= cost; S.up[u.k]++; save();
                beep('e', 'buy', 0, 880, 0.12, 'triangle', 0.06, 400);
                const card = $('shop').querySelector('.card'), sc = card.scrollTop; renderShop(); card.scrollTop = sc;
            };
            row.appendChild(btn); list.appendChild(row);
        }
    }
    let shopFrom = 'menu';
    function openShop(from) { shopFrom = from || 'menu'; state = 'shop'; renderShop(); show('shop'); }
    function togglePause() {
        if (state === 'play') { state = 'paused'; ptrs.clear(); show('paused'); }
        else if (state === 'paused') { state = 'play'; show(null); resetClock(); }
    }
    function toMenu() { G = makeLevel(S.level); refreshMenu(); state = 'menu'; show('menu'); }

    /* ================= settings ================= */
    const PRESETS = {
        low:    { res: 'low',    particles: 'off',  damage: false, wobble: 'still', shading: false, shake: false },
        medium: { res: 'auto',    particles: 'low',  damage: true,  wobble: 'still', shading: true,  shake: true },
        high:   { res: 'auto',   particles: 'high', damage: true,  wobble: 'anim',  shading: true,  shake: true },
        ultra:  { res: 'native', particles: 'high', damage: true,  wobble: 'anim',  shading: true,  shake: true, fps: 'max' },
    };
    function currentPreset() {
        for (const k in PRESETS) { const p = PRESETS[k]; if (Object.keys(p).every(key => key === 'fps' || ST()[key] === p[key])) { if (k !== 'ultra' || ST().fps === 'max') return k; } }
        return 'custom';
    }
    let setTab = 'graphics', setFrom = 'menu';
    function openSettings(from) { setFrom = from; state = 'settings'; renderSettings(); show('settings'); }
    function closeSettings() {
        save();
        if (setFrom === 'paused') { state = 'paused'; show('paused'); }
        else toMenu();
    }
    function applySetting(key) {
        if (key === 'res') { autoR = Math.min(maxRes(), 2); slowSecs = fastSecs = 0; }
        if (key === 'res' || key === 'side' || key === 'sliderVis' || key === 'shading') layout();
        if (key === 'master' || key === 'muted') { applyVolume(); $('muteBtn').textContent = ST().muted ? '🔇' : '🔊'; }
        if (key === 'wobble' && ST().wobble === 'still') boil = 0;
        if (key === 'sliderVis' && state === 'menu') G = makeLevel(S.level);
        save();
    }
    function seg(label, key, opts, note) {
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = `<div class="lbl"><span>${label}</span></div>` + (note ? `<div class="note">${note}</div>` : '');
        const box = document.createElement('div'); box.className = 'seg';
        for (const [val, txt] of opts) {
            const b = document.createElement('button'); b.textContent = txt;
            if (ST()[key] === val) b.className = 'on';
            b.onclick = () => { ST()[key] = val; applySetting(key); renderSettings(); };
            box.appendChild(b);
        }
        row.insertBefore(box, row.children[1] || null);
        return row;
    }
    function range(label, key, min, max, step, fmt, onInput) {
        const row = document.createElement('div'); row.className = 'row';
        row.innerHTML = `<div class="lbl"><span>${label}</span><em>${fmt(ST()[key])}</em></div>`;
        const inp = document.createElement('input'); inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = ST()[key];
        inp.oninput = () => { ST()[key] = +inp.value; row.querySelector('em').textContent = fmt(+inp.value); applySetting(key); if (onInput) onInput(); };
        row.appendChild(inp);
        return row;
    }
    const onOff = [[true, 'On'], [false, 'Off']];
    function renderSettings() {
        document.querySelectorAll('#settings .tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === setTab));
        const body = $('setBody'); body.innerHTML = '';
        const add = el => body.appendChild(el);
        if (setTab === 'sound') {
            add(seg('Sound', 'muted', [[false, 'On'], [true, 'Muted']]));
            add(range('Master volume', 'master', 0, 100, 5, v => v + '%'));
            add(range('Battle sounds', 'battle', 0, 100, 5, v => v + '%', () => beep('b', 'test', 120, 600, 0.05, 'triangle', 0.05)));
            add(range('Big moments', 'events', 0, 100, 5, v => v + '%', () => beep('e', 'test2', 150, 300, 0.12, 'triangle', 0.07)));
            const n = document.createElement('div'); n.className = 'row note'; n.textContent = 'Battle = shots, gates, hits. Big moments = rips, tears, champions, explosions, win & lose.'; add(n);
        } else if (setTab === 'graphics') {
            const pr = document.createElement('div'); pr.className = 'row';
            pr.innerHTML = `<div class="lbl"><span>Quality preset</span><em>${currentPreset()}</em></div>`;
            const box = document.createElement('div'); box.className = 'seg';
            for (const k of ['low', 'medium', 'high', 'ultra']) {
                const b = document.createElement('button'); b.textContent = k[0].toUpperCase() + k.slice(1);
                if (currentPreset() === k) b.className = 'on';
                b.onclick = () => { Object.assign(ST(), PRESETS[k]); boil = 0; layout(); save(); renderSettings(); };
                box.appendChild(b);
            }
            pr.appendChild(box); add(pr);
            add(seg('Frame rate', 'fps', [[30, '30'], [60, '60'], [90, '90'], [120, '120'], ['max', 'Max']],
                `Your screen refreshes at about <b>${displayHz} Hz</b>, so the game can't draw faster than that here. 120 fps needs a 120 Hz screen (and on iPhone, Low Power Mode off).`));
            add(seg('Resolution', 'res', [['auto', 'Auto'], ['low', 'Low'], ['med', 'Med'], ['high', 'High'], ['native', 'Native']],
                `Auto changes sharpness on the fly to keep your frame rate smooth (now ${rdpr.toFixed(2)}x). This screen: ${(window.devicePixelRatio || 1).toFixed(1)}x.`));
            add(seg('Particles', 'particles', [['off', 'Off'], ['low', 'Low'], ['high', 'High']], 'Ink drops, paper scraps and smoke.'));
            add(seg('Map damage', 'damage', onOff, 'Rips, ink splats, burn marks and taped scars.'));
            add(seg('Hand-drawn lines', 'wobble', [['anim', 'Wiggly'], ['still', 'Still']], 'Wiggly redraws lines a few times a second like a flip-book.'));
            add(seg('Shading', 'shading', onOff, 'Pencil hatching on the tower, cannon, mobs and gates.'));
            add(seg('Screen shake', 'shake', onOff));
            add(seg('Show FPS', 'showFps', onOff));
        } else {
            add(seg('Slider lane', 'sliderVis', [[true, 'Visible'], [false, 'Invisible']],
                ST().sliderVis ? 'Two strips at the screen edges. The game never plays under them.' : 'Hidden, but they still work: slide along the bottom edges of the page.'));
            add(seg('Cannon slider side', 'side', [['right', 'Right'], ['left', 'Left']], 'The heavy cannon gets the other side.'));
            add(seg('Thumb up moves / turns', 'flip', [[false, 'Right ▶'], [true, '◀ Left']]));
            add(range('Slider speed', 'sens', 50, 200, 10, v => v + '%'));
            add(seg('Auto-fire', 'autofire', onOff, 'Keeps shooting without touching. You only steer.'));
            add(seg('Vibration', 'vibrate', onOff, 'Buzzes when your line gets hit (on phones that allow it).'));
        }
    }
    document.querySelectorAll('#settings .tabs button').forEach(b => b.onclick = () => { setTab = b.dataset.tab; renderSettings(); $('settings').querySelector('.card').scrollTop = 0; });

    $('playBtn').onclick = () => { audio(); startLevel(); };
    $('shopBtn').onclick = () => openShop('menu');
    $('shopBack').onclick = toMenu;
    $('resNext').onclick = startLevel;
    $('resShop').onclick = () => openShop('result');
    $('resMenu').onclick = toMenu;
    $('pauseBtn').onclick = () => { if (state === 'play' || state === 'paused') togglePause(); };
    $('gearBtn').onclick = () => {
        if (state === 'play') { togglePause(); openSettings('paused'); }
        else if (state === 'paused') openSettings('paused');
        else if (state === 'menu') openSettings('menu');
    };
    $('menuSetBtn').onclick = () => openSettings('menu');
    $('pauseSetBtn').onclick = () => openSettings('paused');
    $('setBack').onclick = closeSettings;
    $('resumeBtn').onclick = togglePause;
    $('restartBtn').onclick = startLevel;
    $('quitBtn').onclick = () => { S.level = 1; save(); toMenu(); };
    $('muteBtn').onclick = () => { ST().muted = !ST().muted; applySetting('muted'); if (state === 'settings') renderSettings(); };
// leaving the app throws away the level in progress; you come back to a fresh level
    function leaveReset() {
        S.level = 1; save();
        ptrs.clear(); keys.left = keys.right = keys.fire = false;
        if (state === 'play' || state === 'paused' || state === 'result' || (state === 'settings' && setFrom === 'paused')) toMenu();
        else if (state === 'shop' || state === 'settings') G = makeLevel(S.level);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) leaveReset(); resetClock(); });
    addEventListener('pagehide', leaveReset);

    /* ================= loop with real frame-rate cap ================= */
    let lastT = performance.now(), acc = 0, lastRaf = performance.now();
    let displayHz = 60; const rafGaps = [];
    let fpsCount = 0, fpsT = performance.now(), fpsShown = 0;
    function adaptRes() {
        if (ST().res !== 'auto' || state !== 'play') { slowSecs = fastSecs = 0; return; }
        if (skipSecs > 0) { skipSecs--; return; }
        const cap = ST().fps === 'max' ? 0 : ST().fps, target = cap ? Math.min(cap, displayHz) : displayHz, top = Math.min(maxRes(), 2);
        if (fpsShown < target * 0.88) {
            fastSecs = 0;
            if (++slowSecs >= 2 && autoR > 0.75) { autoR = Math.max(0.75, autoR - 0.25); slowSecs = 0; skipSecs = 2; layout(); }
        } else if (fpsShown >= target * 0.97) {
            slowSecs = 0;
            if (++fastSecs >= 6 && autoR < top) { autoR = Math.min(top, autoR + 0.25); fastSecs = 0; skipSecs = 2; layout(); }
        } else slowSecs = fastSecs = 0;
    }
    function resetClock() { lastT = performance.now(); acc = 0; }
    function frame(now) {
        requestAnimationFrame(frame);
        // measure the screen's real refresh rate
        const gap = now - lastRaf; lastRaf = now;
        if (gap > 2 && gap < 100) { rafGaps.push(gap); if (rafGaps.length > 90) rafGaps.shift(); }
        // frame cap: accumulate time and only render when a capped frame is due
        const cap = ST().fps === 'max' ? 0 : ST().fps;
        if (cap) {
            acc += gap;
            const step = 1000 / cap;
            if (acc < step - 1) return;
            acc = acc % step; if (acc > step) acc = 0;
        }
        const dt = Math.min(0.033, (now - lastT) / 1000); lastT = now;
        if (ST().wobble === 'anim') boil = Math.floor(now / 130);
        if (state === 'play') update(dt);
        if (G) draw();
        fpsCount++;
        if (now - fpsT >= 1000) {
            fpsShown = Math.round(fpsCount * 1000 / (now - fpsT)); fpsCount = 0; fpsT = now;
            if (rafGaps.length >= 30) { const srt = rafGaps.slice().sort((x, y) => x - y); displayHz = Math.round(1000 / srt[srt.length >> 1] / 5) * 5 || 60; }
            adaptRes();
        }
    }
    layout();
    G = makeLevel(S.level);
    try { document.fonts && document.fonts.ready.then(() => buildPage()); } catch (e) {}
    refreshMenu(); show('menu');
    requestAnimationFrame(frame);
})();