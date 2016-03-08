from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^project_blocks/$', views.ProjectBlockListProxyView.as_view(), name="project_block_list"),
	url(r'^project_blocks/(?P<pk>[0-9]+)/$', views.ProjectBlockDetailProxyView.as_view(), name="project_block_detail"),

	url(r'^projects/$', views.ProjectListProxyView.as_view(), name="project_list"),
	url(r'^projects/(?P<pk>[0-9]+)/$', views.ProjectDetailProxyView.as_view(), name="project_detail"),

	url(r'^meter_runs/', views.MeterRunListProxyView.as_view(), name='meter_run_list'),
	url(r'^meter_runs/(?P<pk>[0-9]+)/', views.MeterRunDetailProxyView.as_view(), name='meter_run_detail'),

	url(r'^project_attributes/', views.ProjectAttributeListProxyView.as_view(), name='project_attribute_list'),
	url(r'^project_attributes/(?P<pk>[0-9]+)/', views.ProjectAttributeDetailProxyView.as_view(), name='project_attribute_detail'),

	url(r'^project_attribute_keys/', views.ProjectAttributeKeyListProxyView.as_view(), name='project_attribute_key_list'),
	url(r'^project_attribute_keys/(?P<pk>[0-9]+)/', views.ProjectAttributeKeyDetailProxyView.as_view(), name='project_attribute_key_detail'),

	url(r'^consumption_metadatas/', views.ConsumptionMetadataListProxyView.as_view(), name='consumption_metadata_list'),
	url(r'^consumption_metadatas/(?P<pk>[0-9]+)/', views.ConsumptionMetadataDetailProxyView.as_view(), name='consumption_metadata_detail'),
]
