from datetime import date
from django.http import HttpResponse
from django.shortcuts import render
from .services import generar_postal_bytes


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
    if lang not in ("es", "en"):
        lang = "es"
    return dia, mes, anio, era, lang


def index(request):
    hoy = date.today()
    lang_inicial = request.GET.get("lang", "es")
    if lang_inicial not in ("es", "en"):
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
    dia, mes, anio, era, lang = _leer_parametros_fecha(request)
    prefijo = "mayan-postcard" if lang == "en" else "postal-maya"
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="jpg", lang=lang)
    resp = HttpResponse(datos, content_type="image/jpeg")
    if request.GET.get("descargar") == "1":
        resp["Content-Disposition"] = f'attachment; filename="{prefijo}-{slug}.jpg"'
    else:
        resp["Content-Disposition"] = f'inline; filename="{prefijo}-{slug}.jpg"'
    return resp


def postal_pdf(request):
    dia, mes, anio, era, lang = _leer_parametros_fecha(request)
    prefijo = "mayan-postcard" if lang == "en" else "postal-maya"
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="pdf", lang=lang)
    resp = HttpResponse(datos, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="{prefijo}-{slug}.pdf"'
    return resp
