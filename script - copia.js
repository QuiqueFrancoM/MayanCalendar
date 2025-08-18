// --- Elementos del DOM ---
const fechaInput = document.getElementById('fechaGregoriana');
const boton = document.getElementById('botonConvertir');

const longCountGlyphs = document.getElementById('long-count-glyphs');
const longCountText = document.getElementById('long-count-text');

const tzolkinGlyphs = document.getElementById('tzolkin-glyphs');
const tzolkinText = document.getElementById('tzolkin-text');

const haabGlyphs = document.getElementById('haab-glyphs');
const haabText = document.getElementById('haab-text');


// --- URLs de los Glifos (CORREGIDAS) ---
// Estas son las nuevas URLs que apuntan directamente a los archivos SVG.
const GLYPH_URLS = {
    numerals: [
        "https://upload.wikimedia.org/wikipedia/commons/3/30/Maya_Numeral_0.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d4/Maya_Numeral_1.svg",
        "https://upload.wikimedia.org/wikipedia/commons/4/44/Maya_Numeral_2.svg",
        "https://upload.wikimedia.org/wikipedia/commons/7/78/Maya_Numeral_3.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f7/Maya_Numeral_4.svg",
        "https://upload.wikimedia.org/wikipedia/commons/b/b3/Maya_Numeral_5.svg",
        "https://upload.wikimedia.org/wikipedia/commons/8/81/Maya_Numeral_6.svg",
        "https://upload.wikimedia.org/wikipedia/commons/7/76/Maya_Numeral_7.svg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e5/Maya_Numeral_8.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d7/Maya_Numeral_9.svg",
        "https://upload.wikimedia.org/wikipedia/commons/6/60/Maya_Numeral_10.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/15/Maya_Numeral_11.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/23/Maya_Numeral_12.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/19/Maya_Numeral_13.svg",
        "https://upload.wikimedia.org/wikipedia/commons/7/7e/Maya_Numeral_14.svg",
        "https://upload.wikimedia.org/wikipedia/commons/8/82/Maya_Numeral_15.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a2/Maya_Numeral_16.svg",
        "https://upload.wikimedia.org/wikipedia/commons/9/9f/Maya_Numeral_17.svg",
        "https://upload.wikimedia.org/wikipedia/commons/0/09/Maya_Numeral_18.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/20/Maya_Numeral_19.svg"
    ],
    tzolkin: [
        "https://upload.wikimedia.org/wikipedia/commons/c/c5/Maya_Glyph_Imix.svg",
        "https://upload.wikimedia.org/wikipedia/commons/4/43/Maya_Glyph_Ik.svg",
        "https://upload.wikimedia.org/wikipedia/commons/9/91/Maya_Glyph_Akbal.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/20/Maya_Glyph_Kan.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1b/Maya_Glyph_Chicchan.svg",
        "https://upload.wikimedia.org/wikipedia/commons/9/99/Maya_Glyph_Cimi.svg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e8/Maya_Glyph_Manik.svg",
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Maya_Glyph_Lamat.svg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c5/Maya_Glyph_Muluc.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a8/Maya_Glyph_Oc.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1d/Maya_Glyph_Chuen.svg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c7/Maya_Glyph_Eb.svg",
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Maya_Glyph_Ben.svg",
        "https://upload.wikimedia.org/wikipedia/commons/7/78/Glifo_Maya_para_prefijo_IX.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f6/Maya_Glyph_Men.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f0/Maya_Glyph_Cib.svg",
        "https://upload.wikimedia.org/wikipedia/commons/3/30/Maya_Glyph_Caban.svg",
        "https://upload.wikimedia.org/wikipedia/commons/9/9f/Maya_Glyph_Etznab.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f2/Maya_Glyph_Cauac.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f4/Maya_Glyph_Ahau.svg"
    ],
    haab: [
        "https://upload.wikimedia.org/wikipedia/commons/c/c9/Maya_Glyph_Pop.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a8/Maya_Glyph_Uo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f9/Maya_Glyph_Zip.svg",
        "https://upload.wikimedia.org/wikipedia/commons/4/4a/Maya_Glyph_Zotz.svg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f6/Maya_Glyph_Tzec.svg",
        "https://upload.wikimedia.org/wikipedia/commons/5/52/Maya_Glyph_Xul.svg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e7/Maya_Glyph_Yaxkin.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d3/Maya_Glyph_Mol.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a4/Maya_Glyph_Chen.svg",
        "https://upload.wikimedia.org/wikipedia/commons/3/32/Maya_Glyph_Yax.svg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c8/Maya_Glyph_Zac.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d5/Maya_Glyph_Ceh.svg",
        "https://upload.wikimedia.org/wikipedia/commons/3/39/Maya_Glyph_Mac.svg",
        "https://upload.wikimedia.org/wikipedia/commons/d/dd/Maya_Glyph_Kankin.svg",
        "https://upload.wikimedia.org/wikipedia/commons/8/87/Maya_Glyph_Muan.svg",
        "https://upload.wikimedia.org/wikipedia/commons/0/07/Maya_Glyph_Pax.svg",
        "https://upload.wikimedia.org/wikipedia/commons/7/77/Maya_Glyph_Kayab.svg",
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Maya_Glyph_Cumku.svg",
        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Maya_Glyph_Uayeb.svg"
    ]
};

const diasTzolkinNombres = ["Imix'", "Ik'", "Ak'b'al", "K'an", "Chikchan", "Kimi", "Manik'", "Lamat", "Muluk", "Ok", "Chuwen", "Eb'", "B'en", "Ix", "Men", "K'ib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw"];
const mesesHaabNombres = ["Pop", "Wo'", "Sip", "Sotz'", "Sek", "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax", "Sak'", "Keh", "Mak", "K'ank'in", "Muwan'", "Pax", "K'ayab", "Kumk'u", "Wayeb'"];
const JDN_EPOCH = 584283;

boton.addEventListener('click', mostrarResultados);

// Función para crear una imagen de glifo
function crearGlifo(url, altText) {
    const img = document.createElement('img');
    img.src = url;
    img.alt = altText;
    img.className = 'glifo-img';
    return img;
}

function mostrarResultados() {
    if (!fechaInput.value) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    const fecha = new Date(fechaInput.value + 'T12:00:00Z');
    const jdn = calcularJDN(fecha);
    const diasTotales = jdn - JDN_EPOCH;

    // Limpiar resultados anteriores
    longCountGlyphs.innerHTML = '';
    tzolkinGlyphs.innerHTML = '';
    haabGlyphs.innerHTML = '';

    // 1. Cuenta Larga
    let diasRestantes = diasTotales;
    const baktun = Math.floor(diasRestantes / 144000); diasRestantes %= 144000;
    const katun = Math.floor(diasRestantes / 7200); diasRestantes %= 7200;
    const tun = Math.floor(diasRestantes / 360); diasRestantes %= 360;
    const winal = Math.floor(diasRestantes / 20);
    const kin = diasRestantes % 20;
    const lc_values = [baktun, katun, tun, winal, kin];
    lc_values.forEach(val => longCountGlyphs.appendChild(crearGlifo(GLYPH_URLS.numerals[val], val)));
    longCountText.textContent = `${baktun}.${katun}.${tun}.${winal}.${kin}`;

    // 2. Tzolk'in
    const numTzolkinIndex = (diasTotales + 19) % 20;
    const coefTzolkin = (diasTotales + 3) % 13 + 1;
    tzolkinGlyphs.appendChild(crearGlifo(GLYPH_URLS.numerals[coefTzolkin], coefTzolkin));
    tzolkinGlyphs.appendChild(crearGlifo(GLYPH_URLS.tzolkin[numTzolkinIndex], diasTzolkinNombres[numTzolkinIndex]));
    tzolkinText.textContent = `${coefTzolkin} ${diasTzolkinNombres[numTzolkinIndex]}`;

    // 3. Haab'
    const diaHaabTotal = (diasTotales + 348) % 365;
    const numMesHaabIndex = Math.floor(diaHaabTotal / 20);
    const diaDelMesHaab = diaHaabTotal % 20;
    haabGlyphs.appendChild(crearGlifo(GLYPH_URLS.numerals[diaDelMesHaab], diaDelMesHaab));
    haabGlyphs.appendChild(crearGlifo(GLYPH_URLS.haab[numMesHaabIndex], mesesHaabNombres[numMesHaabIndex]));
    haabText.textContent = `${diaDelMesHaab} ${mesesHaabNombres[numMesHaabIndex]}`;
}

function calcularJDN(fecha) {
    let a = Math.floor((14 - (fecha.getUTCMonth() + 1)) / 12);
    let y = fecha.getUTCFullYear() + 4800 - a;
    let m = (fecha.getUTCMonth() + 1) + 12 * a - 3;
    return fecha.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}