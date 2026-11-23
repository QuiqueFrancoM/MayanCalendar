from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("inversa/", views.inversa, name="inversa"),
    path("inversa", views.inversa),
    path("explicacion/", views.explicacion, name="explicacion"),
    path("explicacion/mas/", views.explicacion_mas, name="explicacion_mas"),
    path("explicacion/mas", views.explicacion_mas),
    path("explicacion/mas/ahau/", views.explicacion_ahau, name="explicacion_ahau"),
    path("explicacion/mas/ahau", views.explicacion_ahau),
    path("glifo/<str:tipo>/<int:idx>.png", views.glifo_img, name="glifo_img"),
    path("postal.jpg", views.postal_jpg, name="postal_jpg"),
    path("postal.pdf", views.postal_pdf, name="postal_pdf"),
]

