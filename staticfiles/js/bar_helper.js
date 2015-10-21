// this is a custom bar viz for showing actual vs baseline usage
// for quick stats on all energy types
var BarHelper = {};
BarHelper.create = function(element_id, usage_baseline, usage_reporting) {

  dataseries = [
                  {
                    'name' : 'Baseline',
                    'data': [usage_baseline],
                    'color': '#ccc',
                    'dataLabels': {
                      'enabled': true,
                      'color': '#F2F1EF',
                      'format': '{series.name}: {y:,.0f}',
                      'inside': true,
                      'align': 'right'
                    }
                  },
                  {
                    'name' : 'Actual',
                    'data': [usage_reporting],
                    'color': '#333', 
                    'dataLabels': {
                      'enabled': true,
                      'color': '#F2F1EF',
                      'format': '{series.name}: {y:,.0f}',
                      'inside': true,
                      'align': 'right'
                    }
                  }
                ]

  return new Highcharts.Chart({
      chart: {
          renderTo: element_id,
          height: 42,
          type: 'bar',
          backgroundColor: null,
          style: {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300
          },
          spacingBottom: 0,
          spacingTop: 6,
          spacingLeft: 0,
          spacingRight: 0,
      },
      title: {
        text: null
      },
      credits: { 
        enabled: false 
      },
      series: dataseries,
      legend: {
          enabled: false,
        },
      xAxis: {
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          enabled: false
        }
      },
      yAxis: {
        gridLineWidth: 0,
        labels: {
          enabled: false
        },
        title: {
          text: null,
        }
      },
      tooltip: {
        enabled: false
      },
      plotOptions:{
        bar: {
          borderWidth: 0,
          groupPadding: 0,
          pointPadding: .05
        }
      }
    });
}