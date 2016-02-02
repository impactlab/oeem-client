from django.views.generic import TemplateView
from django.http import Http404
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.urlresolvers import reverse

from oeem_client.settings import DATASTORE_ACCESS_TOKEN
from oeem_client.settings import DATASTORE_URL
from oeem_client.settings import CLIENT_SETTINGS

import requests
import numpy as np
from scipy.stats import norm

from collections import namedtuple
from collections import defaultdict
from calendar import monthrange
import json
import re

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
        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']

        return context


ProjectBlock = namedtuple("ProjectBlock", [
    "id",
    "name",
    "n_projects",
    "project_ids",
    "recent_summaries",
])

Project = namedtuple("Project", [
    "project_id",
    "project_pk",
    "meter_runs",
    "baseline_period_start",
    "baseline_period_end",
    "reporting_period_start",
    "reporting_period_end",
])

MeterRun = namedtuple("MeterRun", [
    "project_id",
    "project_pk",
    "fuel_type",
    "baseline_monthly_averages",
    "reporting_monthly_averages",
    "annual_usage_baseline",
    "annual_usage_reporting",
    "annual_savings",
    "gross_savings",
    "cvrmse_baseline",
    "cvrmse_reporting",
])

fuel_type_icons = {
    "E": "fa-lightbulb-o",
    "NG": "fa-fire",
}
fuel_type_names = {
    "E": "Electricity",
    "NG": "Natural Gas",
}
fuel_type_slugs = {
    "E": "electricity",
    "NG": "natural-gas",
}
fuel_type_units = {
    "E": "kWh",
    "NG": "therms",
}

def datastore_get(url, verify=False):
    auth_headers = {"Authorization":"Bearer {}".format(DATASTORE_ACCESS_TOKEN)}
    return requests.get(DATASTORE_URL + url, headers=auth_headers, verify=False)

def get_project_meter_runs(meter_run_ids, project_id, project_pk, get_timeseries=False):
    # TODO - speed this up. This is slowing down page loads a LOT.
    meter_runs = []
    for meter_run_id in meter_run_ids:
        if get_timeseries:
            response = datastore_get("/datastore/meter_run_monthly/{}/".format(meter_run_id))
        else:
            response = datastore_get("/datastore/meter_run_summary/{}/".format(meter_run_id))
        if response.status_code == 200:
            meter_run_data = response.json()
            meter_run = MeterRun(
                    project_id=project_id,
                    project_pk=project_pk,
                    fuel_type=meter_run_data["fuel_type"],
                    annual_usage_baseline=meter_run_data["annual_usage_baseline"],
                    annual_usage_reporting=meter_run_data["annual_usage_reporting"],
                    annual_savings=meter_run_data["annual_savings"],
                    gross_savings=meter_run_data["gross_savings"],
                    baseline_monthly_averages=meter_run_data.get("monthlyaverageusagebaseline_set", []),
                    reporting_monthly_averages=meter_run_data.get("monthlyaverageusagereporting_set", []),
                    cvrmse_baseline=meter_run_data['cvrmse_baseline'],
                    cvrmse_reporting=meter_run_data['cvrmse_reporting'],
                    )
            meter_runs.append(meter_run)
        else:
            pass
    return meter_runs

def get_projects(project_block_id=None, get_timeseries=False):
    if project_block_id is None:
        response = datastore_get("/datastore/project/")
    else:
        response = datastore_get("/datastore/project/?project_block={}".format(project_block_id))
    if response.status_code == 200:
        projects = []
        for project_data in response.json():
            project_id = project_data["project_id"]
            project_pk = project_data["id"]
            meter_runs = get_project_meter_runs(project_data["recent_meter_runs"], project_id, project_pk, get_timeseries)
            project = Project(
                    project_id=project_id,
                    project_pk=project_pk,
                    meter_runs=meter_runs,
                    baseline_period_start=project_data["baseline_period_start"],
                    baseline_period_end=project_data["baseline_period_end"],
                    reporting_period_start=project_data["reporting_period_start"],
                    reporting_period_end=project_data["reporting_period_end"],
                    )
            projects.append(project)
        return projects
    else:
        return []

def create_project_block(data, timeseries=False):
    if timeseries:
        project_block = ProjectBlock(
                id=data["id"],
                name=data["name"],
                n_projects=len(data["project"]),
                project_ids=data["project"],
                recent_summaries=data["recent_summaries"],
                )
    else:
        project_block = ProjectBlock(
                id=data["id"],
                name=data["name"],
                n_projects=len(data["project"]),
                project_ids=data["project"],
                recent_summaries=[],
                )
    return project_block

def aggregate_savings(all_savings_data):
    # get summary data across all savings types
    gross_s = 0
    annual_s = 0
    baseline_u = 0
    reporting_u = 0
    for s in all_savings_data:
        if s['energy_type'] == 'Electricity':
            gross_s += s['total_gross_savings']
            annual_s += s['total_annual_savings']
            if 'total_annual_usage' in s:
                baseline_u += s['total_annual_usage']['baseline']
                reporting_u += s['total_annual_usage']['reporting']
        elif s['energy_type'] == 'Natural Gas':
            gross_s += 29.3001*s['total_gross_savings']
            annual_s += 29.3001*s['total_annual_savings']
            if 'total_annual_usage' in s:
                baseline_u += 29.3001*s['total_annual_usage']['baseline']
                reporting_u += 29.3001*s['total_annual_usage']['reporting']

    if baseline_u and reporting_u:
        annual_usage = {
            'baseline': baseline_u,
            'reporting': reporting_u,
            'percent_savings': int((baseline_u-reporting_u)/baseline_u*100+.5)
        }
    else:
        annual_usage = None

    return {'gross': gross_s, 'annual': annual_s, 'annual_usage': annual_usage, 'unit': 'kWh'}


def pretty_bins(min_val, max_val):

    pretty_bin_sizes = [10000,5000,2000,1000,500,200,100,50,20,10,5,2,1]
    bin_vals = []
    for size in pretty_bin_sizes:
        # find a bin size that isn't too fat
        if (max_val-min_val) > 5*size:
            bin_vals.append(int(min_val-min_val%size))
            while bin_vals[-1] < max_val:
                bin_vals.append(bin_vals[-1]+size)
            break

    return bin_vals

class ProjectBlockIndexView(TemplateView):
    template_name = "dashboard/project_block_index.html"


    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProjectBlockIndexView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectBlockIndexView, self).get_context_data(**kwargs)
        context['project_blocks'] = self.get_project_blocks()

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']

        return context

    def get_project_blocks(self):
        response = datastore_get("/datastore/project_block/")
        project_blocks = []
        for project_block_data in response.json():
            project_block = create_project_block(project_block_data, timeseries=False)
            project_blocks.append(project_block)
        return project_blocks

class ProjectTableMixin(object):

    def get_project_table_data(self, meter_runs):

        if meter_runs is None:
            return []

        table_body = []
        for meter_run, _ in meter_runs:

            # for each cell, construct a dict w/ type & data
            project_link = {
                'cell_type':'link',
                'cell_data': {'pk': str(meter_run.project_pk), 'id': meter_run.project_id }
            }

            cvrmse_baseline = {
                'cell_type':'float_threshold',
                'cell_data':{'val': meter_run.cvrmse_baseline}
            }
            cvrmse_baseline['cell_data']['is_invalid'] = cvrmse_baseline['cell_data']['val'] > 20

            cvrmse_reporting = {
                'cell_type':'float_threshold',
                'cell_data':{'val': meter_run.cvrmse_reporting}
            }
            cvrmse_reporting['cell_data']['is_invalid'] = cvrmse_reporting['cell_data']['val'] > 20

            gross_savings = {
                'cell_type':'float',
                'cell_data':{'val': meter_run.gross_savings}
            }

            annual_savings = {
                'cell_type':'float',
                'cell_data':{'val': meter_run.annual_savings}
            }

            annual_usage_baseline = {
                'cell_type':'float',
                'cell_data':{'val': meter_run.annual_usage_baseline}
            }

            annual_usage_reporting = {
                'cell_type':'float',
                'cell_data':{'val': meter_run.annual_usage_reporting}
            }

            if meter_run.annual_usage_baseline != 0:
                percent_savings_val = meter_run.annual_savings / meter_run.annual_usage_baseline
            else:
                percent_savings_val = 0

            percent_savings = {
                'cell_type':'percent',
                'cell_data':{'val': "{:.1%}".format(percent_savings_val) }
            }

            pass_all_checks = True
            for check in [cvrmse_baseline, cvrmse_reporting]:
                if check['cell_data']['is_invalid']:
                    pass_all_checks = False

            data_quality = {
                'cell_type': 'boolean',
                'cell_data': pass_all_checks
            }

            row = [
                project_link,
                data_quality,

                annual_usage_baseline,
                cvrmse_baseline,

                annual_usage_reporting,
                cvrmse_reporting,

                gross_savings,
                annual_savings,
                percent_savings
            ]

            table_body.append(row)

        table_data = {
            'table_header': [
                ['Project ID', None],
                ['Data Quality Overview', 'center'],

                ['Annual Usage Baseline', 'center'],
                ['CVRMSE Baseline', 'center'],

                ['Annual Usage Reporting', 'center'],
                ['CVRMSE Reporting', 'center'],

                ['Gross Savings', 'center'],
                ['Annual Savings', 'center'],
                ['Percent Savings', 'center'],
            ],
            'table_body': table_body,
        }

        return table_data

class MultipleProjectMixin(object):

    def get_savings_data(self, projects, project_block_summaries=[]):

        meter_runs_by_fuel_type = defaultdict(list)
        for project in projects:
            for meter_run in project.meter_runs:
                meter_run_data = (meter_run, project.reporting_period_start)
                meter_runs_by_fuel_type[meter_run.fuel_type].append(meter_run_data)

        project_block_summaries_by_fuel_type = { s["fuel_type"]:s for s in project_block_summaries}

        data = []
        for fuel_type in ["E", "NG"]:

            meter_runs = meter_runs_by_fuel_type.get(fuel_type)
            project_block_summary = project_block_summaries_by_fuel_type.get(fuel_type)

            fuel_type_data = self.get_fuel_type_data(fuel_type, meter_runs, project_block_summary)
            data.append(fuel_type_data)
        return data

    def get_fuel_type_data(self, fuel_type, meter_runs, project_block_summary):
        name = fuel_type_names[fuel_type]
        slug = fuel_type_slugs[fuel_type]
        icon = fuel_type_icons[fuel_type]
        unit = fuel_type_units[fuel_type]

        fuel_type_data = {
            "energy_type": name,
            "energy_type_slug": slug,
            "icon": icon,
            "unit": unit,
        }
        return fuel_type_data

class SingleProjectMixin(object):

    def get_savings_data(self, project):

        meter_runs_by_fuel_type = defaultdict(list)
        for meter_run in project.meter_runs:
            meter_run_data = (meter_run, project.reporting_period_start)
            meter_runs_by_fuel_type[meter_run.fuel_type].append(meter_run_data)

        data = []
        for fuel_type in ["E", "NG"]:
            meter_runs = meter_runs_by_fuel_type[fuel_type]

            fuel_type_data = self.get_fuel_type_data(fuel_type, meter_runs)
            data.append(fuel_type_data)
        return data

    def get_usage_data(self, project):

        meter_runs_by_fuel_type = defaultdict(list)
        for meter_run in project.meter_runs:
            meter_run_data = (meter_run, project.reporting_period_start)
            meter_runs_by_fuel_type[meter_run.fuel_type].append(meter_run_data)

        data = []
        for fuel_type in ["E", "NG"]:
            meter_runs = meter_runs_by_fuel_type[fuel_type]

            fuel_type_data = self.get_fuel_type_data(fuel_type, meter_runs)
            data.append(fuel_type_data)
        return data

    def get_fuel_type_data(self, fuel_type, meter_runs):
        name = fuel_type_names[fuel_type]
        slug = fuel_type_slugs[fuel_type]
        icon = fuel_type_icons[fuel_type]
        unit = fuel_type_units[fuel_type]

        fuel_type_data = {
            "energy_type": name,
            "energy_type_slug": slug,
            "icon": icon,
            "unit": unit,
        }
        return fuel_type_data

class ProjectBlockDetailView(TemplateView, MultipleProjectMixin, ProjectTableMixin):
    template_name = "dashboard/project_block_detail.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProjectBlockDetailView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectBlockDetailView, self).get_context_data(**kwargs)

        project_block = self.get_project_block(kwargs["pk"])


        if len(project_block.recent_summaries) == 2:
            projects = get_projects(project_block.id, get_timeseries=False)
        else:
            projects = get_projects(project_block.id, get_timeseries=True)

        context["project_block"] = project_block
        context["projects"] = projects

        context["map_data"] = self.get_map_data(projects)
        context["all_savings_data"] = self.get_savings_data(projects, project_block.recent_summaries)
        context["agg_savings"] = aggregate_savings(context["all_savings_data"])

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']

        return context

    def get_project_block(self, pk):
        response = datastore_get("/datastore/project_block_monthly_timeseries/{}/".format(pk))
        if response.status_code == 200:
            project_block_data = response.json()
            project_block = create_project_block(project_block_data, timeseries=True)
            return project_block
        else:
            raise Http404("Project block does not exist")

    def get_fuel_type_data(self, fuel_type, meter_runs, project_block_summary):

        fuel_type_data = super(ProjectBlockDetailView, self).get_fuel_type_data(fuel_type, meter_runs, project_block_summary)

        if project_block_summary is None:
            usage_data = self.get_monthly_gross_usage(meter_runs)
        else:
            usage_data = self.get_project_block_usage(project_block_summary)
        total_gross_savings = self.get_total_gross_savings(meter_runs)
        total_annual_savings = self.get_total_annual_savings(meter_runs)
        gross_savings_hist_data = self.get_gross_savings_hist_data(meter_runs)
        annual_savings_hist_data = self.get_annual_savings_hist_data(meter_runs)
        project_table_data = self.get_project_table_data(meter_runs)

        fuel_type_data["usage_data"] = usage_data
        fuel_type_data["total_gross_savings"] = total_gross_savings
        fuel_type_data["total_annual_savings"] = total_annual_savings
        fuel_type_data["gross_savings_hist_data"] = gross_savings_hist_data
        fuel_type_data["annual_savings_hist_data"] = annual_savings_hist_data
        fuel_type_data["project_table_data"] = project_table_data

        return fuel_type_data

    def get_monthly_gross_usage(self, meter_runs):

        baseline_grouped_by_month = defaultdict(list)
        actual_grouped_by_month = defaultdict(list)
        n_projects_by_month = defaultdict(lambda: 0)

        if meter_runs is None:
            meter_runs = []

        for meter_run, reporting_period_start in meter_runs:

            # assumes same ordering of baseline and reporting data
            for baseline_data, reporting_data in zip(meter_run.baseline_monthly_averages, meter_run.reporting_monthly_averages):

                # always add baseline periods
                baseline_grouped_by_month[baseline_data["date"]].append(baseline_data["value"])

                # add reporting periods if in reporting period, otherwise add baseline.
                # strings, but this comparison works because they're iso
                if reporting_data["date"] > reporting_period_start:
                    actual_grouped_by_month[reporting_data["date"]].append(reporting_data["value"])
                    n_projects_by_month[reporting_data["date"]] += 1
                else:
                    actual_grouped_by_month[baseline_data["date"]].append(baseline_data["value"])

        month_labels = sorted(baseline_grouped_by_month.keys())

        x_labels = []
        series_baseline = []
        series_actual = []
        series_n_projects = []
        actual_start_ix = 0
        for i, month_label in enumerate(month_labels):

            _, n_days_per_month = monthrange(int(month_label[:4]), int(month_label[5:7]))

            # sum baseline usage and convert to month gross
            if baseline_grouped_by_month[month_label] == []:
                baseline_usage = None
            else:
                baseline_usage = np.nansum(baseline_grouped_by_month[month_label]) * n_days_per_month

            # sum reporting usage and convert to month gross
            if actual_grouped_by_month[month_label] == []:
                actual_usage = None
            else:
                actual_usage = np.nansum(actual_grouped_by_month[month_label]) * n_days_per_month

            n_projects = n_projects_by_month[month_label]

            x_labels.append(month_label[:7])
            series_baseline.append(baseline_usage)
            series_actual.append(actual_usage)
            series_n_projects.append(n_projects)

        return self.get_usage_data(x_labels, series_baseline, series_actual, series_n_projects)

    def get_usage_data(self, x_labels, series_baseline, series_actual, series_n_projects):
        usage_data = {
            "xlabels": x_labels,
            "series_baseline": {
                "errors": [],
                "values": series_baseline,
                },
            "series_actual": {
                "errors": [],
                "values": series_actual,
                },
            "series_n_projects": {
                "values": series_n_projects,
                },
            "actual_start_idx": 0,
        }
        return json.dumps(usage_data)

    def get_project_block_usage(self, project_block_summary):
        x_labels = []
        series_baseline = []
        series_actual = []
        series_n_projects = []
        for baseline, actual in zip(
                project_block_summary['monthlyusagesummarybaseline_set'],
                project_block_summary['monthlyusagesummaryactual_set']):
            x_labels.append(baseline['date'][:7])
            series_baseline.append(baseline['value'])
            series_actual.append(actual['value'])
            series_n_projects.append(actual['n_projects'])
        return self.get_usage_data(x_labels, series_baseline, series_actual, series_n_projects)

    def get_total_gross_savings(self, meter_runs):
        savings = []

        if meter_runs is None:
            meter_runs = []

        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)
        return np.nansum(savings)

    def get_total_annual_savings(self, meter_runs):
        savings = []

        if meter_runs is None:
            meter_runs = []

        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)
        return np.nansum(savings)

    def get_gross_savings_hist_data(self, meter_runs):

        savings = []
        name = '# projects'

        if meter_runs is None:
            return self.format_hist_data([], [], name)

        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)

        hist, bin_edges = np.histogram(savings, pretty_bins(min(savings), max(savings)))

        xlabels = [ "{:.0f}-{:.0f}".format(f,b) for f, b in zip(bin_edges, bin_edges[1:])]
        data = [int(v) for v in hist]

        return self.format_hist_data(xlabels, data, name)

    def get_annual_savings_hist_data(self, meter_runs):

        savings = []
        name = '# projects'

        if meter_runs is None:
            return self.format_hist_data([], [], name)

        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)

        hist, bin_edges = np.histogram(savings, pretty_bins(min(savings), max(savings)))

        xlabels = [ "{:.0f}-{:.0f}".format(f,b) for f, b in zip(bin_edges, bin_edges[1:])]
        data = [int(v) for v in hist]

        return self.format_hist_data(xlabels, data, name)

    def format_hist_data(self, xlabels, data, name):
        hist_data = {
            'xlabels': xlabels,
            'dataseries': {
                'data': data,
                'name': name,
            }
        }
        return json.dumps(hist_data)

    def get_map_data(self, projects):
        # set these dynamically
        center_lat = 40.0096836
        center_long = -82.9700032
        n_projects = len(projects)
        latlongs = [[lat, lng] for lat, lng in zip(norm.rvs(center_lat, .1, size=n_projects), norm.rvs(center_long, .1, size=n_projects))]

        map_data = {
            'center_lat': center_lat,
            'center_long': center_long,
            'zoom': 7,
            'latlongs': latlongs,
        }
        return map_data


class ProjectDetailView(TemplateView, SingleProjectMixin):
    template_name = "dashboard/project_detail.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProjectDetailView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectDetailView, self).get_context_data(**kwargs)

        project = self.get_project(kwargs['pk'])

        context['project_id'] = project[0][:8]

        context["all_savings_data"] = self.get_savings_data(project)
        context["agg_savings"] = aggregate_savings(context["all_savings_data"])

        context["map_data"] = {
            'latlong': [40.0096836, -82.9700032],
            'zoom': 10,
        }

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']

        return context

    def get_project(self, pk):
        response = datastore_get("/datastore/project/{}/".format(pk))
        if response.status_code == 200:
            project_data = response.json()
            project_id = project_data["project_id"]
            project_pk = project_data["id"]
            meter_runs = get_project_meter_runs(project_data["recent_meter_runs"], project_id, project_pk, get_timeseries=True)
            project = Project(
                    project_id=project_id,
                    project_pk=project_pk,
                    meter_runs=meter_runs,
                    baseline_period_start=project_data["baseline_period_start"],
                    baseline_period_end=project_data["baseline_period_end"],
                    reporting_period_start=project_data["reporting_period_start"],
                    reporting_period_end=project_data["reporting_period_end"],
                    )
            return project
        else:
            raise Http404("Project does not exist")

    def get_fuel_type_data(self, fuel_type, meter_runs):
        fuel_type_data = super(ProjectDetailView, self).get_fuel_type_data(fuel_type, meter_runs)

        fuel_type_data["usage_data"] = self.get_monthly_gross_usage(meter_runs)
        fuel_type_data["total_gross_savings"] = self.get_total_gross_savings(meter_runs)
        fuel_type_data["total_annual_savings"] = self.get_total_annual_savings(meter_runs)
        fuel_type_data["total_annual_usage"] = self.get_total_annual_usage(meter_runs)

        return fuel_type_data

    def get_consumptions(self, pk):
        response = datastore_get("datastore/consumption/?project_id={}".format(pk))
        if response.status_code == 200:
            consumptions = response.json()
            return consumptions
        else:
            return []

    def get_total_gross_savings(self, meter_runs):
        savings = []

        if meter_runs is None:
            meter_runs = []

        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)
        return np.nansum(savings)

    def get_total_annual_savings(self, meter_runs):
        savings = []

        if meter_runs is None:
            meter_runs = []

        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)
        return np.nansum(savings)

    def get_total_annual_usage(self, meter_runs):
        usage = {
            'baseline': [],
            'reporting': [],
        }

        if meter_runs is None:
            meter_runs = []

        for meter_run, _ in meter_runs:
            usage['baseline'].append(meter_run.annual_usage_baseline)
            usage['reporting'].append(meter_run.annual_usage_reporting)
        usage['baseline'] = np.nansum(usage['baseline'])
        usage['reporting'] = np.nansum(usage['reporting'])
        return usage

    def get_monthly_gross_usage(self, meter_runs):

        baseline_grouped_by_month = defaultdict(list)
        reporting_grouped_by_month = defaultdict(list)

        if meter_runs is None:
            meter_runs = []

        for meter_run, reporting_period_start in meter_runs:

            # assumes same ordering of baseline and reporting data
            for baseline_data, reporting_data in zip(meter_run.baseline_monthly_averages, meter_run.reporting_monthly_averages):

                # always add baseline periods
                baseline_grouped_by_month[baseline_data["date"]].append(baseline_data["value"])

                # add reporting periods if in reporting period, otherwise add baseline.
                # strings, but this comparison works because they're iso
                if reporting_data["date"] > reporting_period_start:
                    reporting_grouped_by_month[reporting_data["date"]].append(reporting_data["value"])
                else:
                    reporting_grouped_by_month[baseline_data["date"]].append(baseline_data["value"])

        month_labels = sorted(baseline_grouped_by_month.keys())

        x_labels = []
        series_baseline = []
        series_reporting = []
        actual_start_ix = 0
        for i, month_label in enumerate(month_labels):

            _, n_days_per_month = monthrange(int(month_label[:4]), int(month_label[5:7]))

            # sum baseline usage and convert to month gross
            if baseline_grouped_by_month[month_label] == []:
                baseline_usage = None
            else:
                baseline_usage = np.nansum(baseline_grouped_by_month[month_label]) * n_days_per_month

            # sum reporting usage and convert to month gross
            if reporting_grouped_by_month[month_label] == []:
                reporting_usage = None
            else:
                reporting_usage = np.nansum(reporting_grouped_by_month[month_label]) * n_days_per_month

            # only include if really necessary
            if abs(baseline_usage - reporting_usage) > 1e-6:
                x_labels.append(month_label[:7])
                series_baseline.append(baseline_usage)
                series_reporting.append(reporting_usage)

        return self.get_usage_data(x_labels, series_baseline, series_reporting)

    def get_usage_data(self, x_labels, series_baseline, series_reporting):
        usage_data = {
            "xlabels": x_labels,
            "series_baseline": {
                "errors": [],
                "values": series_baseline,
                },
            "series_actual": {
                "errors": [],
                "values": series_reporting,
                },
            "series_n_projects": {
                "values": [],
                },
            "actual_start_idx": 0,
        }
        return json.dumps(usage_data)


class ProjectListingView(TemplateView, MultipleProjectMixin, ProjectTableMixin):
    template_name = "dashboard/project_listing.html"

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(ProjectListingView, self).dispatch(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(ProjectListingView, self).get_context_data(**kwargs)

        projects = get_projects(get_timeseries=False)

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']

        context["all_savings_data"] = self.get_savings_data(projects)

        return context

    def get_fuel_type_data(self, fuel_type, meter_runs, project_block_summary):
        fuel_type_data = super(ProjectListingView, self).get_fuel_type_data(fuel_type, meter_runs, project_block_summary)

        project_table_data = self.get_project_table_data(meter_runs)
        fuel_type_data["project_table_data"] = project_table_data

        return fuel_type_data
