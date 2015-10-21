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
          height: 300,
          type: 'bar'
      },
      credits: { 
        enabled: false 
      },
      tooltip: {
            shared: true
        },
      series: dataseries,
      legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
        }
    });
}