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
    return dia, mes, anio, era


def index(request):
    hoy = date.today()
    return render(
        request,
        "calculadora/index.html",
        {
            "hoy_dia": hoy.day,
            "hoy_mes": hoy.month,
            "hoy_anio": hoy.year,
        },
    )


def postal_jpg(request):
    dia, mes, anio, era = _leer_parametros_fecha(request)
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="jpg")
    resp = HttpResponse(datos, content_type="image/jpeg")
    if request.GET.get("descargar") == "1":
        resp["Content-Disposition"] = f'attachment; filename="postal-maya-{slug}.jpg"'
    else:
        resp["Content-Disposition"] = f'inline; filename="postal-maya-{slug}.jpg"'
    return resp


def postal_pdf(request):
    dia, mes, anio, era = _leer_parametros_fecha(request)
    datos, slug = generar_postal_bytes(dia, mes, anio, era, formato="pdf")
    resp = HttpResponse(datos, content_type="application/pdf")
    resp["Content-Disposition"] = f'attachment; filename="postal-maya-{slug}.pdf"'
    return resp

