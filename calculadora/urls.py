from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("postal.jpg", views.postal_jpg, name="postal_jpg"),
    path("postal.pdf", views.postal_pdf, name="postal_pdf"),
]

