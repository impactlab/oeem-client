from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse

from oeem_client import settings

class MainView(TemplateView):

    template_name = "dashboard/main.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(MainView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(MainView, self).get_context_data(**kwargs)

        context['project_block_list_url'] = reverse('datastore_proxy:project_block_list')
        context['project_list_url'] = reverse('datastore_proxy:project_list')
        context['meter_run_list_url'] = reverse('datastore_proxy:meter_run_list')
        context['project_attribute_key_list_url'] = reverse('datastore_proxy:project_attribute_key_list')
        context['project_attribute_list_url'] = reverse('datastore_proxy:project_attribute_list')
        context['consumption_metadata_list_url'] = reverse('datastore_proxy:consumption_metadata_list')
        context['logo'] = 'client_logos/'+ settings.CLIENT_SETTINGS['logo']

        return context
