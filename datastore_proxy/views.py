from rest_framework_proxy.views import ProxyView

from django.conf import settings

class DatastoreMixin(object):

    proxy_host = settings.DATASTORE_URL

    def get_headers(self, request):
        headers = self.get_default_headers(request)

        # Translate Accept HTTP field
        accept_maps = self.proxy_settings.ACCEPT_MAPS
        for old, new in accept_maps.items():
            headers['Accept'] = headers['Accept'].replace(old, new)

        headers['Authorization'] = "Bearer {}".format(settings.DATASTORE_ACCESS_TOKEN)
        return headers


class ProjectBlockListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_blocks/"

class ProjectBlockDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_blocks/%(pk)s/"


class ProjectListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/projects/"

class ProjectDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/projects/%(pk)s/"


class MeterRunListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/meter_runs/"

class MeterRunDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/meter_runs/%(pk)s/"


class ProjectAttributeKeyListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_attribute_keys/"

class ProjectAttributeKeyDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_attribute_keys/%(pk)s/"


class ProjectAttributeListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_attributes/"

class ProjectAttributeDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/project_attributes/%(pk)s/"


class ConsumptionMetadataListProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/consumption_metadatas/"

class ConsumptionMetadataDetailProxyView(DatastoreMixin, ProxyView):
    source = "api/v1/consumption_metadatas/%(pk)s/"
