from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^project_blocks/$', views.ProjectBlockListProxyView.as_view(), name="project_block_list"),
	url(r'^project_blocks/(?P<pk>[0-9]+)/$', views.ProjectBlockDetailProxyView.as_view(), name="project_block_detail"),
	url(r'^projects/$', views.ProjectListProxyView.as_view(), name="project_list"),
	url(r'^projects/(?P<pk>[0-9]+)/$', views.ProjectDetailProxyView.as_view(), name="project_detail"),
]
