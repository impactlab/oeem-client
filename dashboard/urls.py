from django.conf.urls import url
from dashboard import views

from django.views.generic.base import RedirectView

urlpatterns = [
    url(r'^$', RedirectView.as_view(url='project_blocks/', permanent=False)),
	url(r'^project_blocks/', views.ProjectBlockIndexView.as_view(), name="project_block_index"),
	url(r'^project_block/(?P<pk>[0-9]+)/', views.ProjectBlockDetailView.as_view(), name='project_block_detail'),
	url(r'^projects/', views.ProjectListingView.as_view(), name='project_listing'),
	url(r'^project/(?P<pk>[0-9]+)/', views.ProjectDetailView.as_view(), name='project_detail'),
]
