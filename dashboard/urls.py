from django.conf.urls import url
from . import views

from django.views.generic.base import RedirectView

urlpatterns = [
    url(r'^main/', views.MainView.as_view(), name="main"),
	url(r'^project_blocks/', views.ProjectBlockIndexView.as_view(), name="project_block_index"),
	url(r'^project_block/(?P<pk>[0-9]+)/', views.ProjectBlockDetailView.as_view(), name='project_block_detail'),
	url(r'^projects/', views.ProjectListingView.as_view(), name='project_list'),
	url(r'^project/(?P<pk>[0-9]+)/', views.ProjectDetailView.as_view(), name='project_detail'),
    url(r'^$', RedirectView.as_view(url='main/', permanent=False)),
]
