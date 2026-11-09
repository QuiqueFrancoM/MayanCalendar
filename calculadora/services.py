from functools import lru_cache
from io import BytesIO
from pathlib import Path
from django.conf import settings
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps

JDN_EPOCH = 584283

TZOLKIN_FILES = [
    "tzolkin/MAYA-g-log-cal-D01-Imix.png",
    "tzolkin/MAYA-g-log-cal-D02-Ik.png",
    "tzolkin/MAYA-g-log-cal-D03-Akbal.png",
    "tzolkin/MAYA-g-log-cal-D04-Kan.png",
    "tzolkin/MAYA-g-log-cal-D05-Chikchan.png",
    "tzolkin/MAYA-g-log-cal-D06-Kimi.png",
    "tzolkin/MAYA-g-log-cal-D07-Manik.png",
    "tzolkin/MAYA-g-log-cal-D08-Lamat.png",
    "tzolkin/MAYA-g-log-cal-D09-Muluk.png",
    "tzolkin/MAYA-g-log-cal-D10-Ok.png",
    "tzolkin/MAYA-g-log-cal-D11-Chuwen.png",
    "tzolkin/MAYA-g-log-cal-D12-Eb.png",
    "tzolkin/MAYA-g-log-cal-D13-Ben.png",
    "tzolkin/MAYA-g-log-cal-D14-Ix.png",
    "tzolkin/MAYA-g-log-cal-D15-Men.png",
    "tzolkin/MAYA-g-log-cal-D16-Kib.png",
    "tzolkin/MAYA-g-log-cal-D17-Kaban.png",
    "tzolkin/MAYA-g-log-cal-D18-Etznab.png",
    "tzolkin/MAYA-g-log-cal-D19-Kawak.png",
    "tzolkin/MAYA-g-log-cal-D20-Ajaw.png",
]

HAAB_FILES = [
    "haab/Maya_months_-_0_-_Pop.png",
    "haab/Maya_months_-_1_-_Wo.png",
    "haab/Maya_months_-_2_-_Sip.png",
    "haab/Maya-months-03-sotz.png",
    "haab/Maya_months_-_4_-_Sek.png",
    "haab/Maya-months-05-xul.png",
    "haab/Maya_months_-_6_-_Yaxkin.png",
    "haab/Maya_months_-_7_-_Mol.png",
    "haab/Maya-months-08-chen.png",
    "haab/Maya-months-09-yax.png",
    "haab/Maya-months-10-sak.png",
    "haab/Maya-months-11-kej.png",
    "haab/Maya-months-12-mak.png",
    "haab/Maya-months-13-kankin.png",
    "haab/Maya-months-14-muwan.png",
    "haab/Maya-months-15-pax.png",
    "haab/Maya-months-16-kayab.png",
    "haab/Maya-months-17-kumku.png",
    "haab/Maya-months-18-wayeb.png",
]

PERIODOS_FILES = [
    "encabezados/long0.png",
    "encabezados/long1.png",
    "encabezados/long2.png",
    "encabezados/long3.png",
    "encabezados/long4.png",
]

DIAS_TZOLKIN_NOMBRES = [
    "Imix'", "Ik'", "Ak'b'al", "K'an", "Chikchan",
    "Kimi", "Manik'", "Lamat", "Muluk", "Ok",
    "Chuwen", "Eb'", "B'en", "Ix", "Men",
    "K'ib'", "Kaban", "Etz'nab'", "Kawak", "Ajaw",
]

MESES_HAAB_NOMBRES = [
    "Pop", "Wo'", "Sip", "Sotz'", "Sek",
    "Xul", "Yaxk'in", "Mol", "Ch'en", "Yax",
    "Sak'", "Keh", "Mak", "K'ank'in", "Muwan'",
    "Pax", "K'ayab", "Kumk'u", "Wayeb'",
]

MESES_GREGORIANO_NOMBRES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

DIAS_SEMANA_NOMBRES = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
]


def es_bisiesto(anio_astro: int) -> bool:
    return (anio_astro % 4 == 0 and anio_astro % 100 != 0) or (anio_astro % 400 == 0)


def dias_en_mes(mes: int, anio_astro: int) -> int:
    tabla = [31, 29 if es_bisiesto(anio_astro) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return tabla[max(0, min(11, mes - 1))]


def calcular_jdn(anio_astro: int, mes: int, dia: int) -> int:
    a = (14 - mes) // 12
    y = anio_astro + 4800 - a
    m = mes + 12 * a - 3
    return (
        dia
        + (153 * m + 2) // 5
        + 365 * y
        + y // 4
        - y // 100
        + y // 400
        - 32045
    )


def jdn_a_ymd(jdn: int) -> tuple[int, int, int]:
    a = jdn + 32044
    b = (4 * a + 3) // 146097
    c = a - (146097 * b) // 4
    d = (4 * c + 3) // 1461
    e = c - (1461 * d) // 4
    m = (5 * e + 2) // 153
    dia = e - (153 * m + 2) // 5 + 1
    mes = m + 3 - 12 * (m // 10)
    anio_astro = 100 * b + d - 4800 + (m // 10)
    return dia, mes, anio_astro


def calcular_fecha_maya(dia: int, mes: int, anio: int, era: str = 'dc') -> dict:
    anio = max(1, min(9999, anio))
    mes = max(1, min(12, mes))
    anio_astro = (1 - anio) if era == 'ac' else anio
    dia = max(1, min(dias_en_mes(mes, anio_astro), dia))

    jdn = calcular_jdn(anio_astro, mes, dia)
    dias_totales = jdn - JDN_EPOCH

    # 1. Cuenta Larga
    dias_restantes = dias_totales % 2880000
    baktun, dias_restantes = divmod(dias_restantes, 144000)
    katun, dias_restantes = divmod(dias_restantes, 7200)
    tun, dias_restantes = divmod(dias_restantes, 360)
    winal, kin = divmod(dias_restantes, 20)

    # 2. Tzolk'in
    num_tzolkin_idx = (dias_totales + 19) % 20
    coef_tzolkin = (dias_totales + 3) % 13 + 1

    # 3. Haab'
    dia_haab_total = (dias_totales + 348) % 365
    num_mes_haab_idx, dia_del_mes_haab = divmod(dia_haab_total, 20)

    dia_semana = DIAS_SEMANA_NOMBRES[(jdn + 1) % 7]
    nombre_mes = MESES_GREGORIANO_NOMBRES[mes - 1]
    anio_texto = f"{1 - anio_astro} a. C." if anio_astro <= 0 else str(anio_astro)
    texto_gregoriano = f"{dia_semana}, {dia} de {nombre_texto(nombre_mes)} de {anio_texto} (calendario gregoriano)"
    texto_maya = (
        f"{baktun}.{katun}.{tun}.{winal}.{kin} · "
        f"{coef_tzolkin} {DIAS_TZOLKIN_NOMBRES[num_tzolkin_idx]} · "
        f"{dia_del_mes_haab} {MESES_HAAB_NOMBRES[num_mes_haab_idx]}"
    )
    slug = f"{(1 - anio_astro) if anio_astro <= 0 else anio_astro}{'aC' if anio_astro <= 0 else ''}-{mes:02d}-{dia:02d}"

    return {
        "dia": dia,
        "mes": mes,
        "anio": anio,
        "era": era,
        "anio_astro": anio_astro,
        "jdn": jdn,
        "cuenta_larga": [baktun, katun, tun, winal, kin],
        "coef_tzolkin": coef_tzolkin,
        "num_tzolkin_idx": num_tzolkin_idx,
        "dia_del_mes_haab": dia_del_mes_haab,
        "num_mes_haab_idx": num_mes_haab_idx,
        "texto_maya": texto_maya,
        "texto_gregoriano": texto_gregoriano,
        "slug": slug,
    }


def nombre_texto(s: str) -> str:
    return s


# --- Renderizado de la estela en el servidor con Pillow ---

@lru_cache(maxsize=64)
def _cargar_asset_rgba(rel_path: str) -> Image.Image:
    ruta = Path(settings.PRIVATE_ASSETS_DIR) / rel_path
    return Image.open(ruta).convert("RGBA")


@lru_cache(maxsize=8)
def _cargar_fuente_maya(tam: int) -> ImageFont.FreeTypeFont:
    ruta = Path(settings.PRIVATE_ASSETS_DIR) / "fonts" / "NotoSansMayanNumerals-Regular.ttf"
    return ImageFont.truetype(str(ruta), tam)


@lru_cache(maxsize=16)
def _cargar_fuente_texto(tam: int, cursiva: bool = False) -> ImageFont.FreeTypeFont:
    ruta_fonts = Path(settings.PRIVATE_ASSETS_DIR) / "fonts"
    candidatos = (
        [
            str(ruta_fonts / "NotoSerif-Italic.ttf"),
            "georgiai.ttf",
            "timesi.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        ]
        if cursiva
        else [
            str(ruta_fonts / "NotoSans-Regular.ttf"),
            "segoeui.ttf",
            "arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        ]
    )
    for nombre in candidatos:
        try:
            return ImageFont.truetype(nombre, tam)
        except OSError:
            continue
    return ImageFont.load_default(size=tam)


@lru_cache(maxsize=1)
def _generar_textura_piedra(w: int, h: int) -> Image.Image:
    # Genera una textura orgánica de piedra caliza con ruido Gaussiano en varias escalas
    ruido_fino = Image.effect_noise((w, h), 14).convert("L")
    ruido_medio = Image.effect_noise((w // 6, h // 6), 22).resize((w, h), Image.Resampling.BICUBIC)
    ruido_manchas = Image.effect_noise((w // 28, h // 28), 32).resize((w, h), Image.Resampling.BICUBIC)

    mezcla = Image.blend(ruido_fino, ruido_medio, 0.45)
    mezcla = Image.blend(mezcla, ruido_manchas, 0.35)

    # Colorea en gama de piedra caliza (#c2b7a1 a #e4dccb)
    piedra = ImageOps.colorize(mezcla, black=(186, 175, 154), mid=(217, 209, 192), white=(234, 227, 213))
    return piedra.convert("RGBA")


def _preparar_glifo_tallado(rel_path: str, max_w: int, max_h: int, opacidad: float = 0.85, es_capstone: bool = False) -> Image.Image:
    orig = _cargar_asset_rgba(rel_path)
    if es_capstone:
        # Recorta 4px del borde para limpiar el marco del PNG original
        orig = orig.crop((4, 4, orig.width - 4, orig.height - 4))

    ratio = min(max_w / orig.width, max_h / orig.height)
    nw = max(1, int(round(orig.width * ratio)))
    nh = max(1, int(round(orig.height * ratio)))
    img = orig.resize((nw, nh), Image.Resampling.LANCZOS)

    r, g, b, a = img.split()
    lum = ImageOps.grayscale(img)

    if es_capstone:
        # En calendar-capstone.png el fondo es crema claro (~235) y los trazos son oscuros/color
        # Convertimos la oscuridad en canal alfa para que se funda con la piedra
        inv = ImageOps.invert(lum)
        mascara = inv.point(lambda p: 0 if p < 28 else min(255, int((p - 28) * 1.45 * opacidad)))
    else:
        # En los glifos de línea/relleno con fondo blanco o transparente:
        # combinamos oscuridad y alfa original para obtener la máscara del trazo tallado
        inv = ImageOps.invert(lum)
        # Si el pixel es transparente (a=0), no dibuja; si es blanco opaco en PNG (long0..4), usa inv
        mascara_blanca = ImageChops.multiply(inv, a)
        # En SVGs rasterizados con fondo transparente y relleno negro, 'a' ya tiene la silueta
        mascara = ImageChops.lighter(mascara_blanca, a.point(lambda p: int(p * 0.85)))
        mascara = mascara.point(lambda p: int(p * opacidad))

    # Relieve: luz abajo-derecha y sombra arriba-izquierda + color de talla (#594d3d)
    lienzo = Image.new("RGBA", (nw + 4, nh + 4), (0, 0, 0, 0))

    luz = Image.new("RGBA", (nw, nh), (255, 255, 255, 0))
    luz.putalpha(mascara.point(lambda p: int(p * 0.55)))
    lienzo.alpha_composite(luz, (3, 3))

    sombra = Image.new("RGBA", (nw, nh), (45, 35, 22, 0))
    sombra.putalpha(mascara.point(lambda p: int(p * 0.45)))
    lienzo.alpha_composite(sombra, (1, 1))

    talla = Image.new("RGBA", (nw, nh), (88, 75, 58, 0))
    talla.putalpha(mascara)
    lienzo.alpha_composite(talla, (2, 2))

    return lienzo


def _dibujar_numero_maya_rotado(destino: Image.Image, numero: int, cx: int, cy: int):
    char_maya = chr(0x1D2E0 + (numero % 20))
    fuente = _cargar_fuente_maya(132)

    tmp = Image.new("RGBA", (220, 220), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    bbox = d.textbbox((0, 0), char_maya, font=fuente)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (220 - tw) // 2 - bbox[0]
    ty = (220 - th) // 2 - bbox[1]

    # Luz y talla antes de rotar 90° en sentido antihorario
    d.text((tx + 2, ty + 2), char_maya, font=fuente, fill=(255, 255, 255, 145))
    d.text((tx - 1, ty - 1), char_maya, font=fuente, fill=(45, 35, 22, 95))
    d.text((tx, ty), char_maya, font=fuente, fill=(94, 82, 66, 225))

    rotado = tmp.rotate(90, expand=True, resample=Image.Resampling.BICUBIC)
    destino.alpha_composite(rotado, (int(cx - rotado.width // 2), int(cy - rotado.height // 2)))


def renderizar_postal_imagen(estado: dict) -> Image.Image:
    W, H = 960, 1520
    postal = Image.new("RGBA", (W, H), (248, 245, 238, 255))
    draw = ImageDraw.Draw(postal)

    # Borde exterior de la postal
    draw.rounded_rectangle((22, 22, W - 22, H - 22), radius=16, outline=(220, 211, 192, 255), width=3)

    est_x, est_y = 70, 58
    est_w, est_h = W - 140, 1280
    marco = 82

    # Sombra suave de la estela
    sombra_estela = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sombra_estela)
    s_draw.rounded_rectangle(
        (est_x + 4, est_y + 12, est_x + est_w + 4, est_y + est_h + 12),
        radius=14,
        fill=(40, 30, 18, 95),
    )
    sombra_estela = sombra_estela.filter(ImageFilter.GaussianBlur(14))
    postal.alpha_composite(sombra_estela)

    # Bloque de piedra caliza con esquinas redondeadas
    piedra_tex = _generar_textura_piedra(est_w, est_h).copy()
    mascara_estela = Image.new("L", (est_w, est_h), 0)
    ImageDraw.Draw(mascara_estela).rounded_rectangle((0, 0, est_w - 1, est_h - 1), radius=12, fill=255)

    # Viñeta interna sutil en los bordes de la estela
    borde_sombra = Image.new("RGBA", (est_w, est_h), (0, 0, 0, 0))
    ImageDraw.Draw(borde_sombra).rounded_rectangle(
        (2, 2, est_w - 3, est_h - 3), radius=12, outline=(70, 55, 35, 85), width=6
    )
    borde_sombra = borde_sombra.filter(ImageFilter.GaussianBlur(6))
    piedra_tex.alpha_composite(borde_sombra)

    postal.paste(piedra_tex, (est_x, est_y), mascara_estela)

    # Marco con los 20 glifos del Tzolk'in
    g_tam = 50
    idx = 0
    # Arriba (5)
    for n in range(5):
        gx = int(est_x + marco + ((est_w - 2 * marco) / 5) * (n + 0.5) - g_tam / 2)
        gy = int(est_y + (marco - g_tam) / 2)
        glifo = _preparar_glifo_tallado(TZOLKIN_FILES[idx % 20], g_tam, g_tam, 0.62)
        postal.alpha_composite(glifo, (gx, gy))
        idx += 1
    # Derecha (9)
    for n in range(9):
        gx = int(est_x + est_w - marco + (marco - g_tam) / 2)
        gy = int(est_y + (est_h / 9) * (n + 0.5) - g_tam / 2)
        glifo = _preparar_glifo_tallado(TZOLKIN_FILES[idx % 20], g_tam, g_tam, 0.62)
        postal.alpha_composite(glifo, (gx, gy))
        idx += 1
    # Abajo (5)
    for n in range(5):
        gx = int(est_x + marco + ((est_w - 2 * marco) / 5) * (n + 0.5) - g_tam / 2)
        gy = int(est_y + est_h - marco + (marco - g_tam) / 2)
        glifo = _preparar_glifo_tallado(TZOLKIN_FILES[idx % 20], g_tam, g_tam, 0.62)
        postal.alpha_composite(glifo, (gx, gy))
        idx += 1
    # Izquierda (9)
    for n in range(9):
        gx = int(est_x + (marco - g_tam) / 2)
        gy = int(est_y + (est_h / 9) * (n + 0.5) - g_tam / 2)
        glifo = _preparar_glifo_tallado(TZOLKIN_FILES[idx % 20], g_tam, g_tam, 0.62)
        postal.alpha_composite(glifo, (gx, gy))
        idx += 1

    # Campo central rebajado
    campo_x = est_x + marco
    campo_y = est_y + marco
    campo_w = est_w - 2 * marco
    campo_h = est_h - 2 * marco

    capa_campo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(capa_campo)
    c_draw.rounded_rectangle(
        (campo_x, campo_y, campo_x + campo_w, campo_y + campo_h),
        radius=8,
        fill=(85, 70, 50, 24),
        outline=(60, 45, 30, 95),
        width=3,
    )
    postal.alpha_composite(capa_campo)

    # ISIG (encabezado de Serie Inicial)
    isig_h = 255
    img_isig = _preparar_glifo_tallado(
        "encabezados/calendar-capstone.png", campo_w - 76, isig_h, opacidad=0.82, es_capstone=True
    )
    isig_x = campo_x + (campo_w - img_isig.width) // 2
    isig_y = campo_y + 18 + (isig_h - img_isig.height) // 2
    postal.alpha_composite(img_isig, (isig_x, isig_y))

    # 7 bloques glíficos (5 Cuenta Larga + Tzolk'in + Haab' centrado)
    bloques = [
        (estado["cuenta_larga"][i], PERIODOS_FILES[i]) for i in range(5)
    ] + [
        (estado["coef_tzolkin"], TZOLKIN_FILES[estado["num_tzolkin_idx"]]),
        (estado["dia_del_mes_haab"], HAAB_FILES[estado["num_mes_haab_idx"]]),
    ]

    pad_x = 24
    gap = 18
    grid_y = campo_y + isig_h + 34
    disp_h = campo_h - isig_h - 54
    b_w = (campo_w - pad_x * 2 - gap) // 2
    b_h = (disp_h - gap * 3) // 4

    for i, (numero, rel_file) in enumerate(bloques):
        fila = i // 2
        es_final = i == len(bloques) - 1
        col = i % 2
        bx = campo_x + (campo_w - b_w) // 2 if es_final else campo_x + pad_x + col * (b_w + gap)
        by = grid_y + fila * (b_h + gap)

        # Cartucho en relieve
        capa_bloque = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(capa_bloque)
        bd.rounded_rectangle(
            (bx + 3, by + 4, bx + b_w + 3, by + b_h + 4),
            radius=22,
            fill=(55, 42, 28, 70),
        )
        capa_bloque = capa_bloque.filter(ImageFilter.GaussianBlur(3))
        bd = ImageDraw.Draw(capa_bloque)
        bd.rounded_rectangle(
            (bx, by, bx + b_w, by + b_h),
            radius=22,
            fill=(242, 236, 224, 68),
            outline=(255, 255, 255, 115),
            width=2,
        )
        postal.alpha_composite(capa_bloque)

        # Coeficiente numérico rotado
        _dibujar_numero_maya_rotado(postal, numero, int(bx + b_w * 0.19), int(by + b_h * 0.5))

        # Glifo principal
        glifo_max_w = int(b_w * 0.64)
        glifo_max_h = int(b_h - 24)
        glifo_img = _preparar_glifo_tallado(rel_file, glifo_max_w, glifo_max_h, opacidad=0.88)
        gx = int(bx + b_w * 0.32 + (glifo_max_w - glifo_img.width) / 2)
        gy = int(by + 12 + (glifo_max_h - glifo_img.height) / 2)
        postal.alpha_composite(glifo_img, (gx, gy))

    # Pie de la postal: lectura maya, fecha gregoriana en letras chiquitas y copyright
    draw = ImageDraw.Draw(postal)
    fuente_maya_pie = _cargar_fuente_texto(30, cursiva=True)
    fuente_greg_pie = _cargar_fuente_texto(20, cursiva=False)
    fuente_copy = _cargar_fuente_texto(15, cursiva=False)

    draw.text(
        (W // 2, est_y + est_h + 52),
        estado["texto_maya"],
        font=fuente_maya_pie,
        fill=(94, 79, 60, 255),
        anchor="mm",
    )
    draw.text(
        (W // 2, est_y + est_h + 94),
        estado["texto_gregoriano"],
        font=fuente_greg_pie,
        fill=(139, 125, 107, 255),
        anchor="mm",
    )
    draw.text(
        (W - 42, H - 36),
        "Copyright EFM 2026",
        font=fuente_copy,
        fill=(158, 146, 128, 255),
        anchor="rb",
    )

    return postal.convert("RGB")


def generar_postal_bytes(dia: int, mes: int, anio: int, era: str = 'dc', formato: str = 'jpg') -> tuple[bytes, str]:
    estado = calcular_fecha_maya(dia, mes, anio, era)
    img_rgb = renderizar_postal_imagen(estado)
    buf = BytesIO()
    if formato == 'pdf':
        img_rgb.save(buf, format="PDF", resolution=150.0, quality=94)
    else:
        img_rgb.save(buf, format="JPEG", quality=94, optimize=True)
    return buf.getvalue(), estado["slug"]

