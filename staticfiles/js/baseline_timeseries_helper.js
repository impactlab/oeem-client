var BaselineTimeseriesHelper = {};
BaselineTimeseriesHelper.create = function(element_id, title, yaxisLabel, baseline_begin_date, actual_start_idx, baseline_series, actual_series) {

  var dates = []

  start_yr = parseInt(baseline_begin_date.slice(0,4))
  start_mon = parseInt(baseline_begin_date.slice(5))

  for(var i=0; i<baseline_series.values.length; i++) {
    var month = Date.UTC(start_yr, 1*i+start_mon-1, 1);
    dates.push(month)

    baseline_series.values[i] = [month, baseline_series.values[i]]
    actual_series.values[i] = [month, actual_series.values[i]]
  };

  actual_start_date = dates[actual_start_idx]

  function pretty_num(ugly_num) {
    nStr = ugly_num += '';
    x = nStr.split('.');
    x1 = x[0];
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1;
  }

  return new Highcharts.Chart({
      chart: {
          renderTo: element_id,
          height: 300,
          backgroundColor:'transparent',
          zoomType: 'x',
          style: {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300
          },
      },
      credits: { 
        enabled: false 
      },
      title: {
            text: title,
            style: {
                    color: '#333'
                }
      },
      xAxis: {
          type: 'datetime',
          labels: {
                style: {
                    color: '#333'
                }
            },
          plotLines: [{
                color: '#333',
                width: 1,
                value: actual_start_date,
                label: {
                    text: '<i class="fa fa-long-arrow-left"></i> Baseline Period &nbsp; &nbsp; Reporting Period <i class="fa fa-long-arrow-right"></i>',
                    style: {
                        color: '#333'
                    },
                    rotation: 0,
                    textAlign: 'center',
                    verticalAlign: 'bottom',
                    y: -10,
                    useHTML: true
                }
            }]
      },
      legend: false,
      yAxis: {
          title: {
                text: yaxisLabel,
                style: {color: '#333'}
            },
          labels: {
                style: {
                    color: '#333'
                }
            },
          gridLineColor: '#8EC1E6',
          endOnTick: false
      },
      tooltip: {
            shared: true
        },
      plotOptions:{
        series:{
          marker:{
            enabled:false
          }
        }
      },
      series: [{
        name: 'Adjusted Baseline',
        color: "#4887A2",
        type: 'spline',
        data: baseline_series.values,
        dashStyle: 'dash',
        },
        {
        name: 'Actual Usage',
        color: "#0273A2",
        type: 'spline',
        data: actual_series.values,
      }],
      tooltip: {
        formatter: function() {
          year = Highcharts.dateFormat("%b %Y", this.x)
          var s = year+"<br>";
          var actual_fig = null;
          var baseline_fig;
          $.each(this.points, function(i, point) {
            s += '<span style=\"color: ' + point.series.color + '\">'+ point.series.name + ': </span>'+pretty_num(this.y)+' kWh<br>'
            if (point.series.name == 'Adjusted Baseline'){
              baseline_fig = this.y
            }
            if (point.series.name == 'Actual Usage'){
              actual_fig = this.y
            }
          });

          if (actual_fig){
            savings_fig = baseline_fig - actual_fig
            if (savings_fig > 0){
              s+= "<strong>Savings</strong>: <span style=\"color: #03B069\"> "+pretty_num(savings_fig)+" kWh</span>"
            }
            else{
              s+= "<strong>Savings</strong>: <span style=\"color: #95281B\"> "+pretty_num(savings_fig)+" kWh</span>"
            }
          }
          return s
        },
        shared: true
      }
    });
}
