from datetime import date
from django.http import HttpResponse
from django.shortcuts import render
from .services import generar_postal_bytes

IDIOMAS_VALIDOS = ("es", "en", "fr", "ja", "zh")
PREFIJOS_ARCHIVO = {
    "es": "postal-maya",
    "en": "mayan-postcard",
    "fr": "carte-maya",
    "ja": "mayan-postcard-ja",
    "zh": "mayan-postcard-zh",
}


def _leer_parametros_fecha(request):
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
    lang = request.GET.get("lang", "es")
    if lang not in IDIOMAS_VALIDOS:
        lang = "es"
    titulo = (request.GET.get("titulo") or "").strip()[:50]
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
