from datetime import date
from io import BytesIO
from django.http import Http404, HttpResponse
from django.shortcuts import render
from .services import (
    DIAS_TZOLKIN_NOMBRES,
    HAAB_FILES,
    MESES_HAAB_NOMBRES,
    PERIODOS_FILES,
    TZOLKIN_FILES,
    _preparar_glifo_tallado,
    calcular_desde_cuenta_larga,
    calcular_fecha_maya,
    generar_postal_bytes,
)

IDIOMAS_VALIDOS = ("es", "en", "fr", "ja", "zh")
PREFIJOS_ARCHIVO = {
    "es": "postal-maya",
    "en": "mayan-postcard",
    "fr": "carte-maya",
    "ja": "mayan-postcard-ja",
    "zh": "mayan-postcard-zh",
}


def _leer_parametros_fecha(request):
    lang = request.GET.get("lang", "es")
    if lang not in IDIOMAS_VALIDOS:
        lang = "es"
    titulo = (request.GET.get("titulo") or "").strip()[:50]

    # Si se envían los 5 numerales de la Cuenta Larga (calculadora inversa)
    if any(k in request.GET for k in ("baktun", "katun", "tun", "winal", "kin")):
        try:
            baktun = int(request.GET.get("baktun", 13))
        except (TypeError, ValueError):
            baktun = 13
        try:
            katun = int(request.GET.get("katun", 0))
        except (TypeError, ValueError):
            katun = 0
        try:
            tun = int(request.GET.get("tun", 0))
        except (TypeError, ValueError):
            tun = 0
        try:
            winal = int(request.GET.get("winal", 0))
        except (TypeError, ValueError):
            winal = 0
        try:
            kin = int(request.GET.get("kin", 0))
        except (TypeError, ValueError):
            kin = 0
        info = calcular_desde_cuenta_larga(baktun, katun, tun, winal, kin, lang=lang, titulo=titulo)
        return info["dia"], info["mes"], info["anio"], info["era"], lang, titulo

    hoy = date.today()
    try:
        dia = int(request.GET.get("dia", hoy.day))
    except (TypeError, ValueError):
        dia = hoy.day
    try:
        mes = int(request.GET.get("mes", hoy.month))
    except (TypeError, ValueError):
        mes = hoy.month
    try:
        anio = int(request.GET.get("anio", hoy.year))
    except (TypeError, ValueError):
        anio = hoy.year
    era = request.GET.get("era", "dc")
    if era not in ("dc", "ac"):
        era = "dc"
    return dia, mes, anio, era, lang, titulo


def index(request):
    hoy = date.today()
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in IDIOMAS_VALIDOS:
        lang_inicial = "es"
    return render(
        request,
        "calculadora/index.html",
        {
            "hoy_dia": hoy.day,
            "hoy_mes": hoy.month,
            "hoy_anio": hoy.year,
            "lang_inicial": lang_inicial,
        },
    )


def inversa(request):
    hoy = date.today()
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in IDIOMAS_VALIDOS:
        lang_inicial = "es"
    info_hoy = calcular_fecha_maya(hoy.day, hoy.month, hoy.year, era="dc", lang=lang_inicial)
    cl_hoy = info_hoy["cuenta_larga"]
    return render(
        request,
        "calculadora/inversa.html",
        {
            "hoy_baktun": cl_hoy[0],
            "hoy_katun": cl_hoy[1],
            "hoy_tun": cl_hoy[2],
            "hoy_winal": cl_hoy[3],
            "hoy_kin": cl_hoy[4],
            "rango_20": list(range(20)),
            "rango_18": list(range(18)),
            "lang_inicial": lang_inicial,
        },
    )


def explicacion(request):
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in IDIOMAS_VALIDOS:
        lang_inicial = "es"
    return render(
        request,
        "calculadora/explicacion.html",
        {
            "lang_inicial": lang_inicial,
        },
    )


def explicacion_mas(request):
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in IDIOMAS_VALIDOS:
        lang_inicial = "es"
    tzolkin_dias = [
        {"idx": i, "nombre": nombre}
        for i, nombre in enumerate(DIAS_TZOLKIN_NOMBRES)
    ]
    haab_meses = [
        {
            "idx": i,
            "nombre": nombre,
            "num_dias": 5 if i == 18 else 20,
            "es_wayeb": i == 18,
        }
        for i, nombre in enumerate(MESES_HAAB_NOMBRES)
    ]
    return render(
        request,
        "calculadora/explicacion_mas.html",
        {
            "lang_inicial": lang_inicial,
            "tzolkin_dias": tzolkin_dias,
            "haab_meses": haab_meses,
            "rango_20": list(range(20)),
        },
    )


def explicacion_ahau(request):
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in IDIOMAS_VALIDOS:
        lang_inicial = "es"
    return render(
        request,
        "calculadora/explicacion_ahau.html",
        {
            "lang_inicial": lang_inicial,
        },
    )


def glifo_img(request, tipo: str, idx: int):
    catalogo = {
        "tzolkin": TZOLKIN_FILES,
        "haab": HAAB_FILES,
        "periodo": PERIODOS_FILES,
    }.get(tipo)
    if not catalogo or idx < 0 or idx >= len(catalogo):
        raise Http404("Glifo no encontrado")
    img = _preparar_glifo_tallado(catalogo[idx], 76, 76, opacidad=0.92)
    buf = BytesIO()
    img.save(buf, format="PNG", optimize=True)
    resp = HttpResponse(buf.getvalue(), content_type="image/png")
    resp["Cache-Control"] = "public, max-age=86400"
    return resp


def postal_jpg(request):
    dia, mes, anio, era, lang, titulo = _leer_parametros_fecha(request)
    prefijo = PREFIJOS_ARCHIVO.get(lang, "postal-maya")
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="jpg", lang=lang, titulo=titulo)
    resp = HttpResponse(datos, content_type="image/jpeg")
    if request.GET.get("descargar") == "1":
        resp["Content-Disposition"] = f'attachment; filename="{prefijo}-{slug}.jpg"'
    else:
        resp["Content-Disposition"] = f'inline; filename="{prefijo}-{slug}.jpg"'
    return resp


def postal_pdf(request):
    dia, mes, anio, era, lang, titulo = _leer_parametros_fecha(request)
    prefijo = PREFIJOS_ARCHIVO.get(lang, "postal-maya")
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="pdf", lang=lang, titulo=titulo)
    resp = HttpResponse(datos, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="{prefijo}-{slug}.pdf"'
    return resp

