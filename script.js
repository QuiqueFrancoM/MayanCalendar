// --- Elementos del DOM ---
const selectDia = document.getElementById('selectDia');
const selectMes = document.getElementById('selectMes');
const inputAnio = document.getElementById('inputAnio');
const selectEra = document.getElementById('selectEra');
const fechaInput = document.getElementById('fechaGregoriana');

const btnPrevDia = document.getElementById('btnPrevDia');
const btnHoy = document.getElementById('btnHoy');
const btnNextDia = document.getElementById('btnNextDia');

const btnDescargarJpg = document.getElementById('btnDescargarJpg');
const btnDescargarPdf = document.getElementById('btnDescargarPdf');

const longCountGlyphs = document.getElementById('long-count-glyphs');
const longCountText = document.getElementById('long-count-text');

const tzolkinGlyphs = document.getElementById('tzolkin-glyphs');
const tzolkinText = document.getElementById('tzolkin-text');

const haabGlyphs = document.getElementById('haab-glyphs');
const haabText = document.getElementById('haab-text');

// --- URLs de los Glifos ---
const GLYPH_URLS = {
    tzolkin: [
        "imagenes/tzolkin/MAYA-g-log-cal-D01-Imix.svg", "imagenes/tzolkin/MAYA-g-log-cal-D02-Ik.svg", "imagenes/tzolkin/MAYA-g-log-cal-D03-Akbal.svg", "imagenes/tzolkin/MAYA-g-log-cal-D04-Kan.svg", "imagenes/tzolkin/MAYA-g-log-cal-D05-Chikchan.svg", "imagenes/tzolkin/MAYA-g-log-cal-D06-Kimi.svg", "imagenes/tzolkin/MAYA-g-log-cal-D07-Manik.svg", "imagenes/tzolkin/MAYA-g-log-cal-D08-Lamat.svg", "imagenes/tzolkin/MAYA-g-log-cal-D09-Muluk.svg", "imagenes/tzolkin/MAYA-g-log-cal-D10-Ok.svg", "imagenes/tzolkin/MAYA-g-log-cal-D11-Chuwen.svg", "imagenes/tzolkin/MAYA-g-log-cal-D12-Eb.svg", "imagenes/tzolkin/MAYA-g-log-cal-D13-Ben.svg", "imagenes/tzolkin/MAYA-g-log-cal-D14-Ix.svg", "imagenes/tzolkin/MAYA-g-log-cal-D15-Men.svg", "imagenes/tzolkin/MAYA-g-log-cal-D16-Kib.svg", "imagenes/tzolkin/MAYA-g-log-cal-D17-Kaban.svg", "imagenes/tzolkin/MAYA-g-log-cal-D18-Etznab.svg", "imagenes/tzolkin/MAYA-g-log-cal-D19-Kawak.svg", "imagenes/tzolkin/MAYA-g-log-cal-D20-Ajaw.svg"
    ],
    haab: [
        "imagenes/haab/Maya_months_-_0_-_Pop.svg",
        "imagenes/haab/Maya_months_-_1_-_Wo.svg",
        "imagenes/haab/Maya_months_-_2_-_Sip.svg",
        "imagenes/haab/Maya-months-03-sotz.svg",
        "imagenes/haab/Maya_months_-_4_-_Sek.svg",
        "imagenes/haab/Maya-months-05-xul.svg",
        "imagenes/haab/Maya_months_-_6_-_Yaxkin.svg",
        "imagenes/haab/Maya_months_-_7_-_Mol.svg",
        "imagenes/haab/Maya-months-08-chen.svg",
        "imagenes/haab/Maya-months-09-yax.svg",
        "imagenes/haab/Maya-months-10-sak.svg",
        "imagenes/haab/Maya-months-11-kej.svg",
        "imagenes/haab/Maya-months-12-mak.svg",
        "imagenes/haab/Maya-months-13-kankin.svg",
        "imagenes/haab/Maya-months-14-muwan.svg",
        "imagenes/haab/Maya-months-15-pax.svg",
        "imagenes/haab/Maya-months-16-kayab.svg",
        "imagenes/haab/Maya-months-17-kumku.svg",
        "imagenes/haab/Maya-months-18-wayeb.svg",
    ]
};

const diasTzolkinNombres = ["Imix'", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw"];
const mesesHaabNombres = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan'", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
const mesesGregorianoNombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const diasSemanaNombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const JDN_EPOCH = 584283;

let estadoActual = null;

// --- Utilidades de fecha gregoriana (año astronómico: 1 a. C. = 0, 2 a. C. = -1) ---

function obtenerAnioAstronomico() {
    const anio = Math.max(1, parseInt(inputAnio.value, 10) || 1);
    return selectEra.value === 'ac' ? 1 - anio : anio;
}

function esBisiesto(anioAstro) {
    return (anioAstro % 4 === 0 && anioAstro % 100 !== 0) || (anioAstro % 400 === 0);
}

function diasEnMes(mes, anioAstro) {
    const dias = [31, esBisiesto(anioAstro) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dias[mes - 1] || 31;
}

function actualizarOpcionesDia() {
    const mes = parseInt(selectMes.value, 10) || 1;
    const anioAstro = obtenerAnioAstronomico();
    const maxDias = diasEnMes(mes, anioAstro);
    const diaPrevio = parseInt(selectDia.value, 10) || 1;

    selectDia.innerHTML = '';
    for (let d = 1; d <= maxDias; d++) {
        const opt = document.createElement('option');
        opt.value = String(d);
        opt.textContent = String(d);
        selectDia.appendChild(opt);
    }
    selectDia.value = String(Math.min(diaPrevio, maxDias));
}

function sincronizarInputDate() {
    const anioAstro = obtenerAnioAstronomico();
    const mes = parseInt(selectMes.value, 10);
    const dia = parseInt(selectDia.value, 10);
    if (anioAstro >= 100 && anioAstro <= 9999) {
        fechaInput.value = `${String(anioAstro).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    } else {
        fechaInput.value = '';
    }
}

function establecerFecha(dia, mes, anioAstro) {
    if (anioAstro <= 0) {
        selectEra.value = 'ac';
        inputAnio.value = String(1 - anioAstro);
    } else {
        selectEra.value = 'dc';
        inputAnio.value = String(anioAstro);
    }
    selectMes.value = String(mes);
    actualizarOpcionesDia();
    selectDia.value = String(Math.min(dia, diasEnMes(mes, anioAstro)));
    sincronizarInputDate();
    mostrarResultados();
}

function calcularJDNDesdeYMD(anioAstro, mes, dia) {
    const a = Math.floor((14 - mes) / 12);
    const y = anioAstro + 4800 - a;
    const m = mes + 12 * a - 3;
    return dia + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function jdnAYMD(jdn) {
    const a = jdn + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    const dia = e - Math.floor((153 * m + 2) / 5) + 1;
    const mes = m + 3 - 12 * Math.floor(m / 10);
    const anioAstro = 100 * b + d - 4800 + Math.floor(m / 10);
    return { dia, mes, anioAstro };
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function formatearFechaGregoriana(dia, mes, anioAstro, jdn) {
    const diaSemana = diasSemanaNombres[mod(jdn + 1, 7)];
    const nombreMes = mesesGregorianoNombres[mes - 1];
    const anioTexto = anioAstro <= 0 ? `${1 - anioAstro} a. C.` : `${anioAstro}`;
    return `${diaSemana}, ${dia} de ${nombreMes} de ${anioTexto} (calendario gregoriano)`;
}

// --- Eventos del selector ---

selectMes.addEventListener('change', () => {
    actualizarOpcionesDia();
    sincronizarInputDate();
    mostrarResultados();
});

selectDia.addEventListener('change', () => {
    sincronizarInputDate();
    mostrarResultados();
});

inputAnio.addEventListener('input', () => {
    actualizarOpcionesDia();
    sincronizarInputDate();
    mostrarResultados();
});

selectEra.addEventListener('change', () => {
    actualizarOpcionesDia();
    sincronizarInputDate();
    mostrarResultados();
});

fechaInput.addEventListener('click', () => {
    if (typeof fechaInput.showPicker === 'function') {
        try { fechaInput.showPicker(); } catch (_) {}
    }
});

fechaInput.addEventListener('change', () => {
    if (!fechaInput.value) return;
    const [y, m, d] = fechaInput.value.split('-').map(Number);
    if (y && m && d) establecerFecha(d, m, y);
});

btnHoy.addEventListener('click', () => {
    const hoy = new Date();
    establecerFecha(hoy.getDate(), hoy.getMonth() + 1, hoy.getFullYear());
});

btnPrevDia.addEventListener('click', () => {
    const jdn = calcularJDNDesdeYMD(obtenerAnioAstronomico(), parseInt(selectMes.value, 10), parseInt(selectDia.value, 10));
    const { dia, mes, anioAstro } = jdnAYMD(jdn - 1);
    establecerFecha(dia, mes, anioAstro);
});

btnNextDia.addEventListener('click', () => {
    const jdn = calcularJDNDesdeYMD(obtenerAnioAstronomico(), parseInt(selectMes.value, 10), parseInt(selectDia.value, 10));
    const { dia, mes, anioAstro } = jdnAYMD(jdn + 1);
    establecerFecha(dia, mes, anioAstro);
});

btnDescargarJpg.addEventListener('click', () => descargarPostal('jpg'));
btnDescargarPdf.addEventListener('click', () => descargarPostal('pdf'));

window.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    establecerFecha(hoy.getDate(), hoy.getMonth() + 1, hoy.getFullYear());
});

// --- Creación de glifos y números ---

function crearNumeroMaya(numero) {
    const span = document.createElement('span');
    span.className = 'numero-maya';
    span.textContent = String.fromCodePoint(0x1D2E0 + mod(numero, 20));
    return span;
}

function crearGlifo(url, altText) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = altText;
    img.className = 'glifo-img';
    return img;
}

// --- Cálculo y actualización ---

function mostrarResultados() {
    const dia = parseInt(selectDia.value, 10) || 1;
    const mes = parseInt(selectMes.value, 10) || 1;
    const anioAstro = obtenerAnioAstronomico();

    const jdn = calcularJDNDesdeYMD(anioAstro, mes, dia);
    const diasTotales = jdn - JDN_EPOCH;

    longCountGlyphs.innerHTML = '';
    tzolkinGlyphs.innerHTML = '';
    haabGlyphs.innerHTML = '';

    // 1. Cuenta Larga
    let diasRestantes = mod(diasTotales, 2880000);
    const baktun = Math.floor(diasRestantes / 144000); diasRestantes %= 144000;
    const katun = Math.floor(diasRestantes / 7200); diasRestantes %= 7200;
    const tun = Math.floor(diasRestantes / 360); diasRestantes %= 360;
    const winal = Math.floor(diasRestantes / 20);
    const kin = diasRestantes % 20;

    [baktun, katun, tun, winal, kin].forEach(val => {
        longCountGlyphs.appendChild(crearNumeroMaya(val));
    });
    longCountText.textContent = `${baktun}.${katun}.${tun}.${winal}.${kin}`;

    // 2. Tzolk'in
    const numTzolkinIndex = mod(diasTotales + 19, 20);
    const coefTzolkin = mod(diasTotales + 3, 13) + 1;
    tzolkinGlyphs.appendChild(crearNumeroMaya(coefTzolkin));
    tzolkinGlyphs.appendChild(crearGlifo(GLYPH_URLS.tzolkin[numTzolkinIndex], diasTzolkinNombres[numTzolkinIndex]));
    tzolkinText.textContent = `${coefTzolkin} ${diasTzolkinNombres[numTzolkinIndex]}`;

    // 3. Haab'
    const diaHaabTotal = mod(diasTotales + 348, 365);
    const numMesHaabIndex = Math.floor(diaHaabTotal / 20);
    const diaDelMesHaab = diaHaabTotal % 20;
    haabGlyphs.appendChild(crearNumeroMaya(diaDelMesHaab));
    haabGlyphs.appendChild(crearGlifo(GLYPH_URLS.haab[numMesHaabIndex], mesesHaabNombres[numMesHaabIndex]));
    haabText.textContent = `${diaDelMesHaab} ${mesesHaabNombres[numMesHaabIndex]}`;

    const textoGregoriano = formatearFechaGregoriana(dia, mes, anioAstro, jdn);

    estadoActual = {
        cuentaLarga: [baktun, katun, tun, winal, kin],
        coefTzolkin, numTzolkinIndex,
        diaDelMesHaab, numMesHaabIndex,
        textoGregoriano,
        slugFecha: `${anioAstro <= 0 ? (1 - anioAstro) + 'aC' : anioAstro}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    };

    // 4. Estela con la inscripción completa
    dibujarEstela(estadoActual);
}

// --- ESTELA ---

const PERIODOS = [
    { nombre: "B'ak'tun", img: 'imagenes/encabezados/long0.png' },
    { nombre: "K'atun",   img: 'imagenes/encabezados/long1.png' },
    { nombre: 'Tun',      img: 'imagenes/encabezados/long2.png' },
    { nombre: 'Winal',    img: 'imagenes/encabezados/long3.png' },
    { nombre: "K'in",     img: 'imagenes/encabezados/long4.png' },
];

function crearBloque(numero, url, nombre) {
    const bloque = document.createElement('div');
    bloque.className = 'bloque';
    bloque.title = `${numero} ${nombre}`;

    const coef = document.createElement('span');
    coef.className = 'bloque-coef';
    const num = document.createElement('span');
    num.textContent = String.fromCodePoint(0x1D2E0 + mod(numero, 20));
    coef.appendChild(num);

    const img = document.createElement('img');
    img.className = 'bloque-glifo';
    img.src = url;
    img.alt = nombre;

    bloque.append(coef, img);
    return bloque;
}

function dibujarMarco() {
    const marco = document.getElementById('estela-marco');
    if (marco.childElementCount) return;
    const lados = { arriba: 5, derecha: 9, abajo: 5, izquierda: 9 };
    let i = 0;
    for (const [lado, cantidad] of Object.entries(lados)) {
        const tira = document.createElement('div');
        tira.className = `marco-tira marco-${lado}`;
        for (let n = 0; n < cantidad; n++) {
            const img = document.createElement('img');
            img.src = GLYPH_URLS.tzolkin[i % 20];
            img.alt = '';
            tira.appendChild(img);
            i++;
        }
        marco.appendChild(tira);
    }
}

function dibujarEstela({ cuentaLarga, coefTzolkin, numTzolkinIndex, diaDelMesHaab, numMesHaabIndex, textoGregoriano }) {
    dibujarMarco();
    const bloques = document.getElementById('estela-bloques');
    bloques.innerHTML = '';

    cuentaLarga.forEach((valor, i) => {
        bloques.appendChild(crearBloque(valor, PERIODOS[i].img, PERIODOS[i].nombre));
    });
    bloques.appendChild(crearBloque(coefTzolkin, GLYPH_URLS.tzolkin[numTzolkinIndex], diasTzolkinNombres[numTzolkinIndex]));
    const haab = crearBloque(diaDelMesHaab, GLYPH_URLS.haab[numMesHaabIndex], mesesHaabNombres[numMesHaabIndex]);
    haab.classList.add('bloque-final');
    bloques.appendChild(haab);

    document.getElementById('estela-pie').textContent =
        `${cuentaLarga.join('.')} · ${coefTzolkin} ${diasTzolkinNombres[numTzolkinIndex]} · ${diaDelMesHaab} ${mesesHaabNombres[numMesHaabIndex]}`;
    document.getElementById('fecha-gregoriana-texto').textContent = textoGregoriano;
    document.getElementById('estela-container').hidden = false;
}

// --- GENERACIÓN DE POSTAL (JPG / PDF) ---

const cacheImagenes = new Map();
function cargarImagen(src) {
    if (cacheImagenes.has(src)) return cacheImagenes.get(src);
    const fuente = (window.GLIFOS_DATA_URLS && window.GLIFOS_DATA_URLS[src]) || src;
    const promesa = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = fuente;
    });
    cacheImagenes.set(src, promesa);
    return promesa;
}

function rectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function dibujarImagenTallada(ctx, img, x, y, w, h, opacidad = 0.85, esCapstone = false) {
    const ratio = Math.min(w / img.width, h / img.height);
    const dw = img.width * ratio;
    const dh = img.height * ratio;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = opacidad;
    ctx.filter = esCapstone
        ? 'grayscale(1) sepia(0.35) brightness(1.22) contrast(1.18) drop-shadow(1px 1px 0px rgba(255,255,255,0.6)) drop-shadow(-1px -1px 0px rgba(60,45,30,0.45))'
        : 'grayscale(1) invert(0.32) sepia(0.5) contrast(1.15) drop-shadow(1px 1px 0px rgba(255,255,255,0.6)) drop-shadow(-1px -1px 0px rgba(60,45,30,0.45))';
    if (esCapstone) {
        ctx.beginPath();
        ctx.rect(dx + 4, dy + 4, dw - 8, dh - 8);
        ctx.clip();
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
}

function crearPatronPiedra(ctx) {
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 180;
    pCanvas.height = 180;
    const pCtx = pCanvas.getContext('2d');
    const imgData = pCtx.createImageData(180, 180);
    const d = imgData.data;
    let seed = 1337;
    for (let i = 0; i < d.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const v = (seed & 0xff) - 128;
        d[i]     = Math.min(255, Math.max(0, 217 + (v * 0.08)));
        d[i + 1] = Math.min(255, Math.max(0, 209 + (v * 0.08)));
        d[i + 2] = Math.min(255, Math.max(0, 192 + (v * 0.08)));
        d[i + 3] = 255;
    }
    pCtx.putImageData(imgData, 0, 0);
    return ctx.createPattern(pCanvas, 'repeat');
}

async function renderizarPostalCanvas(estado) {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }

    const W = 960;
    const H = 1520;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Fondo crema tipo tarjeta postal
    ctx.fillStyle = '#f8f5ee';
    ctx.fillRect(0, 0, W, H);

    // Borde sutil de la postal
    ctx.strokeStyle = '#dcd3c0';
    ctx.lineWidth = 3;
    rectRedondeado(ctx, 22, 22, W - 44, H - 44, 16);
    ctx.stroke();

    // Dimensiones de la estela dentro de la postal
    const estX = 70;
    const estY = 58;
    const estW = W - 140; // 820
    const estH = 1280;
    const marco = 82;

    // Sombra exterior de la estela
    ctx.save();
    ctx.shadowColor = 'rgba(40, 30, 18, 0.35)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    rectRedondeado(ctx, estX, estY, estW, estH, 12);
    ctx.fillStyle = '#d9d1c0';
    ctx.fill();
    ctx.restore();

    // Textura de piedra caliza
    ctx.save();
    rectRedondeado(ctx, estX, estY, estW, estH, 12);
    ctx.clip();
    ctx.fillStyle = crearPatronPiedra(ctx);
    ctx.fillRect(estX, estY, estW, estH);

    const gradPiedra = ctx.createLinearGradient(estX, estY, estX + estW, estY + estH);
    gradPiedra.addColorStop(0, 'rgba(255,255,255,0.22)');
    gradPiedra.addColorStop(0.5, 'rgba(255,255,255,0)');
    gradPiedra.addColorStop(1, 'rgba(60,45,30,0.16)');
    ctx.fillStyle = gradPiedra;
    ctx.fillRect(estX, estY, estW, estH);
    ctx.restore();

    // Marco con los 20 glifos del Tzolk'in
    const imgsMarco = await Promise.all(GLYPH_URLS.tzolkin.map(cargarImagen));
    const gTam = 52;
    let idx = 0;

    // Arriba (5)
    for (let n = 0; n < 5; n++) {
        const gx = estX + marco + ((estW - 2 * marco) / 5) * (n + 0.5) - gTam / 2;
        const gy = estY + (marco - gTam) / 2;
        dibujarImagenTallada(ctx, imgsMarco[idx++ % 20], gx, gy, gTam, gTam, 0.65);
    }
    // Derecha (9)
    for (let n = 0; n < 9; n++) {
        const gx = estX + estW - marco + (marco - gTam) / 2;
        const gy = estY + (estH / 9) * (n + 0.5) - gTam / 2;
        dibujarImagenTallada(ctx, imgsMarco[idx++ % 20], gx, gy, gTam, gTam, 0.65);
    }
    // Abajo (5)
    for (let n = 0; n < 5; n++) {
        const gx = estX + marco + ((estW - 2 * marco) / 5) * (n + 0.5) - gTam / 2;
        const gy = estY + estH - marco + (marco - gTam) / 2;
        dibujarImagenTallada(ctx, imgsMarco[idx++ % 20], gx, gy, gTam, gTam, 0.65);
    }
    // Izquierda (9)
    for (let n = 0; n < 9; n++) {
        const gx = estX + (marco - gTam) / 2;
        const gy = estY + (estH / 9) * (n + 0.5) - gTam / 2;
        dibujarImagenTallada(ctx, imgsMarco[idx++ % 20], gx, gy, gTam, gTam, 0.65);
    }

    // Campo central rebajado
    const campoX = estX + marco;
    const campoY = estY + marco;
    const campoW = estW - 2 * marco; // 656
    const campoH = estH - 2 * marco; // 1116

    rectRedondeado(ctx, campoX, campoY, campoW, campoH, 8);
    ctx.fillStyle = 'rgba(90, 75, 55, 0.09)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 45, 30, 0.35)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // ISIG (encabezado)
    const imgIsig = await cargarImagen('imagenes/encabezados/calendar-capstone.png');
    const isigH = 260;
    dibujarImagenTallada(ctx, imgIsig, campoX + 40, campoY + 18, campoW - 80, isigH, 0.75, true);

    // Bloques glíficos (4 filas: 3 de 2 columnas + 1 centrada)
    const items = [
        ...estado.cuentaLarga.map((val, i) => ({ numero: val, url: PERIODOS[i].img })),
        { numero: estado.coefTzolkin, url: GLYPH_URLS.tzolkin[estado.numTzolkinIndex] },
        { numero: estado.diaDelMesHaab, url: GLYPH_URLS.haab[estado.numMesHaabIndex] }
    ];

    const padX = 24;
    const gap = 18;
    const gridY = campoY + isigH + 34;
    const dispH = campoH - isigH - 54;
    const bW = (campoW - padX * 2 - gap) / 2;
    const bH = (dispH - gap * 3) / 4;

    for (let i = 0; i < items.length; i++) {
        const fila = Math.floor(i / 2);
        const esFinal = i === items.length - 1;
        const col = i % 2;
        const bx = esFinal
            ? campoX + (campoW - bW) / 2
            : campoX + padX + col * (bW + gap);
        const by = gridY + fila * (bH + gap);

        // Cartucho en relieve
        ctx.save();
        ctx.shadowColor = 'rgba(60, 45, 30, 0.35)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 4;
        rectRedondeado(ctx, bx, by, bW, bH, 22);
        const gradBloque = ctx.createLinearGradient(bx, by, bx + bW, by + bH);
        gradBloque.addColorStop(0, 'rgba(255,255,255,0.34)');
        gradBloque.addColorStop(1, 'rgba(0,0,0,0.06)');
        ctx.fillStyle = gradBloque;
        ctx.fill();
        ctx.restore();

        rectRedondeado(ctx, bx, by, bW, bH, 22);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Coeficiente numérico rotado -90°
        const charMaya = String.fromCodePoint(0x1D2E0 + mod(items[i].numero, 20));
        const coefCX = bx + bW * 0.19;
        const coefCY = by + bH * 0.5;
        ctx.save();
        ctx.translate(coefCX, coefCY);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '135px "Noto Sans Mayan", "Noto Sans Mayan Numerals", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const met = ctx.measureText(charMaya);
        const dyCentro = ((met.actualBoundingBoxAscent || 95) - (met.actualBoundingBoxDescent || 0)) / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(charMaya, 1.5, dyCentro + 1.5);
        ctx.fillStyle = '#5e5242';
        ctx.fillText(charMaya, 0, dyCentro);
        ctx.restore();

        // Glifo principal
        const imgGlifo = await cargarImagen(items[i].url);
        dibujarImagenTallada(
            ctx,
            imgGlifo,
            bx + bW * 0.31,
            by + 12,
            bW * 0.65,
            bH - 24,
            0.88
        );
    }

    // Pie de la postal: lectura maya y fecha gregoriana en letras chiquitas
    const textoMaya = `${estado.cuentaLarga.join('.')} · ${estado.coefTzolkin} ${diasTzolkinNombres[estado.numTzolkinIndex]} · ${estado.diaDelMesHaab} ${mesesHaabNombres[estado.numMesHaabIndex]}`;
    ctx.fillStyle = '#5e4f3c';
    ctx.font = 'italic 30px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(textoMaya, W / 2, estY + estH + 62);

    ctx.fillStyle = '#8b7d6b';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(estado.textoGregoriano, W / 2, estY + estH + 102);

    return canvas;
}

// Empaqueta un JPEG (dataURL) dentro de un archivo PDF válido de 1 página sin dependencias externas
function crearPdfDesdeJpegDataUrl(dataUrl, widthPx, heightPx) {
    const base64 = dataUrl.split(',')[1];
    const binStr = atob(base64);
    const jpegBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) jpegBytes[i] = binStr.charCodeAt(i);

    // Escala a puntos PDF (72 pt/pulgada, ~4x6.3 pulgadas tipo postal)
    const pdfW = 360;
    const pdfH = Math.round((heightPx / widthPx) * pdfW);

    const enc = new TextEncoder();
    const partes = [];
    const offsets = [];
    let longitud = 0;

    function agregarTexto(str) {
        const bytes = enc.encode(str);
        partes.push(bytes);
        longitud += bytes.length;
    }
    function agregarBytes(bytes) {
        partes.push(bytes);
        longitud += bytes.length;
    }
    function iniciarObjeto() {
        offsets.push(longitud);
    }

    agregarTexto('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

    iniciarObjeto(); // 1: Catalog
    agregarTexto('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    iniciarObjeto(); // 2: Pages
    agregarTexto('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    iniciarObjeto(); // 3: Page
    agregarTexto(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfW} ${pdfH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

    iniciarObjeto(); // 4: Image XObject
    agregarTexto(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    agregarBytes(jpegBytes);
    agregarTexto('\nendstream\nendobj\n');

    const contenido = `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im0 Do\nQ\n`;
    iniciarObjeto(); // 5: Content stream
    agregarTexto(`5 0 obj\n<< /Length ${contenido.length} >>\nstream\n${contenido}endstream\nendobj\n`);

    const xrefOffset = longitud;
    agregarTexto(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);
    for (const off of offsets) {
        agregarTexto(`${String(off).padStart(10, '0')} 00000 n \n`);
    }
    agregarTexto(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob(partes, { type: 'application/pdf' });
}

async function descargarPostal(formato) {
    if (!estadoActual) return;
    const botonActivo = formato === 'pdf' ? btnDescargarPdf : btnDescargarJpg;
    const textoOriginal = botonActivo.textContent;
    botonActivo.disabled = true;
    botonActivo.textContent = 'Generando postal...';

    try {
        const canvas = await renderizarPostalCanvas(estadoActual);
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.94);
        const a = document.createElement('a');

        if (formato === 'pdf') {
            const pdfBlob = crearPdfDesdeJpegDataUrl(jpegUrl, canvas.width, canvas.height);
            const blobUrl = URL.createObjectURL(pdfBlob);
            a.href = blobUrl;
            a.download = `postal-maya-${estadoActual.slugFecha}.pdf`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        } else {
            a.href = jpegUrl;
            a.download = `postal-maya-${estadoActual.slugFecha}.jpg`;
            a.click();
        }
    } catch (err) {
        console.error('Error al generar la postal:', err);
        alert('No se pudo generar la postal.');
    } finally {
        botonActivo.disabled = false;
        botonActivo.textContent = textoOriginal;
    }
}
