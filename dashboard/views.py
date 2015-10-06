from django.views.generic import TemplateView
from django.http import Http404

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

ProjectBlock = namedtuple("ProjectBlock", ["id", "name", "n_projects", "project_ids"])

Project = namedtuple("Project", [
    "project_id",
    "meter_runs",
    "baseline_period_start",
    "baseline_period_end",
    "reporting_period_start",
    "reporting_period_end",
])

MeterRun = namedtuple("MeterRun", [
    "fuel_type",
    "baseline_monthly_averages",
    "reporting_monthly_averages",
    "annual_usage_baseline",
    "annual_usage_reporting",
    "annual_savings",
    "gross_savings",
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

def get_meter_runs(meter_run_ids):
    meter_runs = []
    for meter_run_id in meter_run_ids:
        response = datastore_get("/datastore/meter_run_monthly/{}/".format(meter_run_id))
        if response.status_code == 200:
            meter_run_data = response.json()
            meter_run = MeterRun(
                    fuel_type=meter_run_data["fuel_type"],
                    annual_usage_baseline=meter_run_data["annual_usage_baseline"],
                    annual_usage_reporting=meter_run_data["annual_usage_reporting"],
                    annual_savings=meter_run_data["annual_savings"],
                    gross_savings=meter_run_data["gross_savings"],
                    baseline_monthly_averages=meter_run_data["monthlyaverageusagebaseline_set"],
                    reporting_monthly_averages=meter_run_data["monthlyaverageusagereporting_set"],
                    )
            meter_runs.append(meter_run)
        else:
            #raise Http404("MeterRun does not exist")
            pass
    return meter_runs

def create_project_block(data):
    project_block = ProjectBlock(
            id=data["id"],
            name=data["name"],
            n_projects=len(data["project"]),
            project_ids=data["project"],
            )
    return project_block

class ProjectBlockIndexView(TemplateView):
    template_name = "dashboard/project_block_index.html"

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
            project_block = create_project_block(project_block_data)
            project_blocks.append(project_block)
        return project_blocks

class ProjectBlockDetailView(TemplateView):
    template_name = "dashboard/project_block_detail.html"

    def get_context_data(self, **kwargs):
        context = super(ProjectBlockDetailView, self).get_context_data(**kwargs)

        project_block = self.get_project_block(kwargs["pk"])
        projects = self.get_projects(project_block.id)

        context["project_block"] = project_block
        context["projects"] = projects

        context["map_data"] = self.get_map_data(projects)
        context["all_savings_data"] = self.get_savings_data(projects)

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']

        return context

    def get_project_block(self, pk):
        response = datastore_get("/datastore/project_block/{}/".format(pk))
        if response.status_code == 200:
            project_block_data = response.json()
            project_block = create_project_block(project_block_data)
            return project_block
        else:
            raise Http404("Project block does not exist")

    def get_projects(self, project_block_id):
        response = datastore_get("/datastore/project/?project_block={}".format(project_block_id))
        if response.status_code == 200:
            projects = []
            for project_data in response.json():
                meter_runs = get_meter_runs(project_data["recent_meter_runs"])
                project = Project(
                        project_id=project_data["project_id"],
                        meter_runs=meter_runs,
                        baseline_period_start=project_data["baseline_period_start"],
                        baseline_period_end=project_data["baseline_period_end"],
                        reporting_period_start=project_data["reporting_period_start"],
                        reporting_period_end=project_data["reporting_period_end"],
                        )
                projects.append(project)
            return projects
        else:
            #raise Http404("No projects found")
            return []

    def get_savings_data(self, projects):

        meter_runs_by_fuel_type = defaultdict(list)
        for project in projects:
            for meter_run in project.meter_runs:
                meter_run_data = (meter_run, project.reporting_period_start)
                meter_runs_by_fuel_type[meter_run.fuel_type].append(meter_run_data)

        data = []
        for fuel_type in ["E", "NG"]:
            name = fuel_type_names[fuel_type]
            slug = fuel_type_slugs[fuel_type]
            icon = fuel_type_icons[fuel_type]
            unit = fuel_type_units[fuel_type]

            meter_runs = meter_runs_by_fuel_type[fuel_type]

            total_gross_savings = self.get_total_gross_savings(meter_runs)
            total_annual_savings = self.get_total_annual_savings(meter_runs)

            usage_data = self.get_monthly_gross_usage(meter_runs)

            gross_savings_hist_data = self.get_gross_savings_hist_data(meter_runs)
            annual_savings_hist_data = self.get_annual_savings_hist_data(meter_runs)


            energy_type_data = {
                "energy_type": name,
                "energy_type_slug": slug,
                "icon": icon,
                "unit": unit,
                "usage_data": usage_data,
                "total_gross_savings": total_gross_savings,
                "total_annual_savings": total_annual_savings,
                "gross_savings_hist_data": gross_savings_hist_data,
                "annual_savings_hist_data": annual_savings_hist_data,
            }
            data.append(energy_type_data)
        return data

    def get_monthly_gross_usage(self, meter_runs):

        baseline_grouped_by_month = defaultdict(list)
        reporting_grouped_by_month = defaultdict(list)
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
            "actual_start_idx": 0,
        }
        return json.dumps(usage_data)

    def get_total_gross_savings(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)
        return np.nansum(savings)

    def get_total_annual_savings(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)
        return np.nansum(savings)

    def get_gross_savings_hist_data(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)

        hist, bin_edges = np.histogram(savings, 10)

        xlabels = [ "{:.0f}-{:.0f}".format(f,b) for f, b in zip(bin_edges, bin_edges[1:])]
        data = [int(v) for v in hist]
        name = '# projects'
        return self.format_hist_data(xlabels, data, name)

    def get_annual_savings_hist_data(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)

        hist, bin_edges = np.histogram(savings, 10)

        xlabels = [ "{:.0f}-{:.0f}".format(f,b) for f, b in zip(bin_edges, bin_edges[1:])]
        data = [int(v) for v in hist]
        name = '# projects'

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


class ProjectDetailView(TemplateView):
    template_name = "dashboard/project_detail.html"

    def get_context_data(self, **kwargs):
        context = super(ProjectDetailView, self).get_context_data(**kwargs)

        project = self.get_project(kwargs['pk'])

        context['project_id'] = project[0][:8]

        context["all_savings_data"] = self.get_savings_data(project)

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
            meter_runs = get_meter_runs(project_data["recent_meter_runs"])
            project = Project(
                    project_id=project_data["project_id"],
                    meter_runs=meter_runs,
                    baseline_period_start=project_data["baseline_period_start"],
                    baseline_period_end=project_data["baseline_period_end"],
                    reporting_period_start=project_data["reporting_period_start"],
                    reporting_period_end=project_data["reporting_period_end"],
                    )
            return project
        else:
            raise Http404("Project does not exist")

    def get_consumptions(self, pk):
        response = datastore_get("datastore/consumption/?project_id={}".format(pk))
        if response.status_code == 200:
            consumptions = response.json()
            return consumptions
        else:
            raise Http404("Consumptions do not exist")

    def get_savings_data(self, project):

        meter_runs_by_fuel_type = defaultdict(list)
        for meter_run in project.meter_runs:
            meter_run_data = (meter_run, project.reporting_period_start)
            meter_runs_by_fuel_type[meter_run.fuel_type].append(meter_run_data)

        data = []
        for fuel_type in ["E", "NG"]:
            name = fuel_type_names[fuel_type]
            slug = fuel_type_slugs[fuel_type]
            icon = fuel_type_icons[fuel_type]
            unit = fuel_type_units[fuel_type]

            meter_runs = meter_runs_by_fuel_type[fuel_type]

            total_gross_savings = self.get_total_gross_savings(meter_runs)
            total_annual_savings = self.get_total_annual_savings(meter_runs)

            usage_data = self.get_monthly_gross_usage(meter_runs)


            energy_type_data = {
                "energy_type": name,
                "energy_type_slug": slug,
                "icon": icon,
                "unit": unit,
                "usage_data": usage_data,
                "total_gross_savings": total_gross_savings,
                "total_annual_savings": total_annual_savings,
            }
            data.append(energy_type_data)
        return data

    def get_total_gross_savings(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.gross_savings)
        return np.nansum(savings)

    def get_total_annual_savings(self, meter_runs):
        savings = []
        for meter_run, _ in meter_runs:
            savings.append(meter_run.annual_savings)
        return np.nansum(savings)

    def get_monthly_gross_usage(self, meter_runs):

        baseline_grouped_by_month = defaultdict(list)
        reporting_grouped_by_month = defaultdict(list)
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
            "actual_start_idx": 0,
        }
        return json.dumps(usage_data)


class ProjectListingView(TemplateView):
    template_name = "dashboard/project_listing.html"

    def get_context_data(self, **kwargs):
        context = super(ProjectListingView, self).get_context_data(**kwargs)

        projects_data = self.get_projects_data()
        all_tables_data = self.make_table_data(projects_data)

        context['logo'] = 'client_logos/'+CLIENT_SETTINGS['logo']
        context['client_name'] = CLIENT_SETTINGS['name']
        context['all_tables_data'] = all_tables_data

        return context

    def get_projects_data(self):
        # TEMPORARY: using a project block of 5 projects while in development. this should be all projects
        response = datastore_get("/datastore/project/?project_block=5")
        if response.status_code == 200:
            projects = []
            for project_data in response.json():

                p = {
                    'project_id': project_data["project_id"],
                    'reporting_period_start': project_data["reporting_period_start"],
                }

                for meter_run_id in project_data["recent_meter_runs"]:
                    response = datastore_get("/datastore/meter_run_summary/{}/".format(meter_run_id))
                    if response.status_code == 200:
                        meter_run_data = response.json()

                        energy_type = re.sub(r'.+_', '', meter_run_data['meter_type'])
                        p[energy_type] = {
                            'cvrmse_reporting': meter_run_data['cvrmse_reporting'],
                            'cvrmse_baseline': meter_run_data['cvrmse_baseline'],
                        }
                    else:
                        pass

                projects.append(p)

            return projects
        else:
            return []


    def make_table_data(self, projects):

        tables = []
        for fuel_type in ["E", "NG"]:

            table_data = []
            for p in projects:
                row = [p['project_id'], p[fuel_type]['cvrmse_baseline'], p[fuel_type]['cvrmse_reporting']]
                table_data.append(row)

            energy_type_data = {
                "energy_type": fuel_type_names[fuel_type],
                "energy_type_slug": fuel_type_slugs[fuel_type],
                "icon": fuel_type_icons[fuel_type],
                "unit": fuel_type_units[fuel_type],
                'table_header': ['Project ID', 'CVRMSE Baseline', 'CVRMSE Reporting'],
                'table_body': table_data,
            }
            tables.append(energy_type_data)
        return tables


