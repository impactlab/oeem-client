var SavingsTimeseriesHelper = {};
SavingsTimeseriesHelper.create = function(element_id, title, units, baseline_begin_date, actual_start_idx, baseline_series, actual_series, n_projects_series) {

  // this assumes that the breakdowns are by month

  var dates = []

  var baseline_vals = $(baseline_series.values).slice(actual_start_idx)
  var actual_vals = $(actual_series.values).slice(actual_start_idx)
  var savings_vals = []

  // var n_projects = $(n_projects_series.values).slice(actual_start_idx)

  var start_yr = parseInt(baseline_begin_date.slice(0,4))
  var start_mon = parseInt(baseline_begin_date.slice(5))

  var max_savings = 0
  var min_savings = 0

  for(var i=0; i<baseline_vals.length; i++) {
    var savings_val = baseline_vals[i] - actual_vals[i]
    var month = Date.UTC(start_yr, 1*i+start_mon-1, 1)
    dates.push(month)

    savings_vals.push( [ month, savings_val ] )
    baseline_vals[i] = [ month, baseline_vals[i]]
    actual_vals[i] = [ month, actual_vals[i]]
    // n_projects[i] = [ month, n_projects[i]]

    if (savings_val > max_savings){
      max_savings = savings_val
    }
    if (savings_val < min_savings){
      min_savings = savings_val
    }

  };

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
          type: 'areaspline',
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
      },
      legend: false,
      yAxis: {
          title: {
                text: 'Savings ('+units+')',
                style: {color: '#333'}
            },
          labels: {
                style: {
                    color: '#333'
                }
            },
          gridLineColor: '#eee',
          max: max_savings,
          min: min_savings,
      },
      tooltip: {
            shared: true
        },
      plotOptions:{
        series:{
          marker:{
            enabled:false
          }
        },
        areaspline: {
          fillOpacity: 0.1
        },
      },
      series: [
        {
          name: 'Adjusted Baseline',
          type: 'spline',
          lineWidth: 0, // hide line in chart but keep data for tooltip
          marker: {     // hide marker in chart
            states: {
              hover: {
                enabled: false,
              }
            }
          },
          data: baseline_vals,
        },
        {
          name: 'Actual Usage',
          type: 'spline',
          lineWidth: 0, // hide line in chart but keep data for tooltip
          marker: {     // hide marker in chart
            states: {
              hover: {
                enabled: false,
              }
            }
          },
          data: actual_vals,
        },
        {
          name: 'Gross Savings',
          data: savings_vals,
          color: '#2274AD'
        },
        // {
        //   name: 'Total Projects',
        //   type: 'spline',
        //   lineWidth: 0, // hide line in chart but keep data for tooltip
        //   marker: {     // hide marker in chart
        //     states: {
        //       hover: {
        //         enabled: false,
        //       }
        //     }
        //   },
        //   data: n_projects,
        // },
      ],
      tooltip: {
        formatter: function() {
          year = Highcharts.dateFormat("%b %Y", this.x)
          var s = year+" - ";
          var actual_fig = null;
          var baseline_fig;

          $.each(this.points, function(i, point) {
            if (point.series.name == 'Total Projects'){
              actual_fig = this.y
              s += 'Total Projects: '+pretty_num(this.y)+'<br>'
            }
          });

          $.each(this.points, function(i, point) {
            if (point.series.name == 'Adjusted Baseline'){
              baseline_fig = this.y
              s += 'Adjusted Baseline: '+pretty_num(this.y)+' '+units+'<br>'
            }
            if (point.series.name == 'Actual Usage'){
              actual_fig = this.y
              s += 'Actual Usage: '+pretty_num(this.y)+' '+units+'<br>'
            }
            if (point.series.name == 'Gross Savings'){
              savings_fig = this.y
            }
          });

          if (actual_fig){
            if (savings_fig > 0){
              s+= "<strong>Gross Savings</strong>: <span style=\"color: #03B069\"> "+pretty_num(savings_fig)+" "+units+"</span>"
            }
            else{
              s+= "<strong>Gross Savings</strong>: <span style=\"color: #95281B\"> "+pretty_num(savings_fig)+" "+units+"</span>"
            }
          }
          return s
        },
        shared: true
      }
    });
}
