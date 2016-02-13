from django.conf.urls import url
from . import views

from django.views.generic.base import RedirectView

urlpatterns = [
    url(r'^main/', views.MainView.as_view(), name="main"),
    url(r'^$', RedirectView.as_view(url='main/', permanent=False)),
]
