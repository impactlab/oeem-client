from django.conf.urls import url
from dashboard import views

urlpatterns = [
	url(r'^$', views.ProjectBlockIndexView.as_view(), name="project_block_index"),
	url(r'^project_blocks/(?P<client_slug>.+)/', views.ProjectBlockIndexView.as_view(), name="project_block_index"),
	url(r'^project_block/(?P<client_slug>.+)/(?P<pk>[0-9]+)/', views.ProjectBlockDetailView.as_view(), name='project_block_detail'),
	url(r'^project/(?P<client_slug>.+)/(?P<project_id>[0-9]+)/', views.ProjectDetailView.as_view(), name='project_detail'),
]
