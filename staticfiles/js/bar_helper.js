var BarHelper = {};
BarHelper.create = function(element_id, usage_baseline, usage_reporting) {

  dataseries = [
                  {
                    'name' : 'baseline',
                    'data': [usage_baseline]
                  },
                  {
                    'name' : 'reporting',
                    'data': [usage_reporting]
                  }
                ]

  return new Highcharts.Chart({
      chart: {
          renderTo: element_id,
          height: 36,
          type: 'bar',
          backgroundColor: null,
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
      plotOptions:{
        bar: {
          borderWidth: 0,
          groupPadding: 0,
          pointPadding: .05
        }
      }
    });
}