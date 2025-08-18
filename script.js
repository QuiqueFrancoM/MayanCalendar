// --- Elementos del DOM ---
const fechaInput = document.getElementById('fechaGregoriana');
const boton = document.getElementById('botonConvertir');

const longCountGlyphs = document.getElementById('long-count-glyphs');
const longCountText = document.getElementById('long-count-text');

const tzolkinGlyphs = document.getElementById('tzolkin-glyphs');
const tzolkinText = document.getElementById('tzolkin-text');

const haabGlyphs = document.getElementById('haab-glyphs');
const haabText = document.getElementById('haab-text');

// --- URLs de los Glifos ---
// NOTA: Hemos quitado los números de aquí, ya que ahora se usarán fuentes.
const GLYPH_URLS = {
    tzolkin: [
       "/imagenes/tzolkin/MAYA-g-log-cal-D01-Imix.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D02-Ik.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D03-Akbal-cdxW.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D03-Akbal.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D04-Kan.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D05-Chikchan.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D06-Kimi.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D07-Manik.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D08-Lamat.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D09-Muluk.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D10-Ok.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D11-Chuwen.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D12-Eb.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D13-Ben.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D14-Ix.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D15-Men.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D16-Kib.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D17-Kaban.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D18-Etznab.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D19-Kawak.svg", "/imagenes/tzolkin/MAYA-g-log-cal-D20-Ajaw.svg"
    ],
    haab: [
        "/imagenes/haab/Maya_months_-_0_-_Pop.svg",
        "/imagenes/haab/Maya_months_-_1_-_Wo.svg",
        "/imagenes/haab/Maya_months_-_2_-_Sip.svg",
        "/imagenes/haab/Maya-months-03-sotz.svg",
        "/imagenes/haab/Maya_months_-_4_-_Sek.svg",
        "/imagenes/haab/Maya-months-05-xul.svg",
        "/imagenes/haab/Maya_months_-_6_-_Yaxkin.svg",
        "/imagenes/haab/Maya_months_-_7_-_Mol.svg",
        "/imagenes/haab/Maya-months-08-chen.svg",
        "/imagenes/haab/Maya-months-09-yax.svg",
        "/imagenes/haab/Maya-months-10-sak.svg",
        "/imagenes/haab/Maya-months-11-kej.svg",
        "/imagenes/haab/Maya-months-12-mak.svg",
        "/imagenes/haab/Maya-months-13-kankin.svg",
        "/imagenes/haab/Maya-months-14-muwan.svg",
        "/imagenes/haab/Maya-months-15-pax.svg",
        "/imagenes/haab/Maya-months-16-kayab.svg",
        "/imagenes/haab/Maya-months-17-kumku.svg",
        "/imagenes/haab/Maya-months-18-wayeb.svg",
    ]
};

const diasTzolkinNombres = ["Imix'", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw"];
const mesesHaabNombres = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan'", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
const JDN_EPOCH = 584283;

boton.addEventListener('click', mostrarResultados);

// --- NUEVAS FUNCIONES PARA USAR LA FUENTE ---

// Función para crear un NÚMERO maya usando la fuente
function crearNumeroMaya(numero) {
    const span = document.createElement('span');
    span.className = 'numero-maya';
    // Convierte un número (0-19) a su carácter Unicode Maya (U+1D2E0 - U+1D2F3)
    span.textContent = String.fromCodePoint(0x1D2E0 + numero);
    return span;
}

// Función para crear un GLIFO de día o mes (sigue usando imágenes)
function crearGlifo(url, altText) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = altText;
    img.className = 'glifo-img';

    return img;
}

// --- FUNCIÓN PRINCIPAL ACTUALIZADA ---

function mostrarResultados() {
    if (!fechaInput.value) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    const fecha = new Date(fechaInput.value + 'T12:00:00Z');
    const jdn = calcularJDN(fecha);
    const diasTotales = jdn - JDN_EPOCH;

    longCountGlyphs.innerHTML = '';
    tzolkinGlyphs.innerHTML = '';
    haabGlyphs.innerHTML = '';

    // 1. Cuenta Larga (usando la fuente para los números)
    let diasRestantes = diasTotales;
    const baktun = Math.floor(diasRestantes / 144000); diasRestantes %= 144000;
    const katun = Math.floor(diasRestantes / 7200); diasRestantes %= 7200;
    const tun = Math.floor(diasRestantes / 360); diasRestantes %= 360;
    const winal = Math.floor(diasRestantes / 20);
    const kin = diasRestantes % 20;
    [baktun, katun, tun, winal, kin].forEach(val => {
        longCountGlyphs.appendChild(crearNumeroMaya(val));
    });
    longCountText.textContent = `${baktun}.${katun}.${tun}.${winal}.${kin}`;

    // 2. Tzolk'in (número con fuente, glifo con imagen)
    const numTzolkinIndex = (diasTotales + 19) % 20;
    const coefTzolkin = (diasTotales + 3) % 13 + 1;
    tzolkinGlyphs.appendChild(crearNumeroMaya(coefTzolkin));
    tzolkinGlyphs.appendChild(crearGlifo(GLYPH_URLS.tzolkin[numTzolkinIndex], diasTzolkinNombres[numTzolkinIndex]));
    tzolkinText.textContent = `${coefTzolkin} ${diasTzolkinNombres[numTzolkinIndex]}`;

    // 3. Haab' (número con fuente, glifo con imagen)
    const diaHaabTotal = (diasTotales + 348) % 365;
    const numMesHaabIndex = Math.floor(diaHaabTotal / 20);
    const diaDelMesHaab = diaHaabTotal % 20;
    haabGlyphs.appendChild(crearNumeroMaya(diaDelMesHaab));
    haabGlyphs.appendChild(crearGlifo(GLYPH_URLS.haab[numMesHaabIndex], mesesHaabNombres[numMesHaabIndex]));
    haabText.textContent = `${diaDelMesHaab} ${mesesHaabNombres[numMesHaabIndex]}`;
}

function calcularJDN(fecha) {
    let a = Math.floor((14 - (fecha.getUTCMonth() + 1)) / 12);
    let y = fecha.getUTCFullYear() + 4800 - a;
    let m = (fecha.getUTCMonth() + 1) + 12 * a - 3;
    return fecha.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}