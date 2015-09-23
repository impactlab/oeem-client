from django.conf.urls import url
from dashboard import views

urlpatterns = [
    url(r'^$', views.ProjectBlockIndexView.as_view(), name="project_block_index"),
    url(r'^project_block/(?P<pk>[0-9]+)/', views.ProjectBlockDetailView.as_view(), name='project_block_detail'),
]
