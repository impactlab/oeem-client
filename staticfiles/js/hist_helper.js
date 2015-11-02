var HistHelper = {};
HistHelper.create = function(element_id, title, y_label, x_label, xCategories, dataseries, dataType) {

  type = "column"

  return new Highcharts.Chart({
      chart: {
          renderTo: element_id,
          type: type,
          height: 350,
          backgroundColor:'transparent',
          style: {
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 300
          },
      },
      credits: { 
        enabled: false 
      },
      title: {
            text: title
      },
      xAxis: {
          categories: xCategories,
          labels: {
                rotation: 315,
                formatter: function () {
                    return this.value.replace(/( to).*/, "");
                },
                style: {
                    color: '#333'
                },
            },
          title: {
                text: x_label,
                style: {color: '#333'}
            }
      },
      legend: false,
      yAxis: {
          title: {
                text: y_label,
                style: {color: '#333'}
            },
          labels: {
              style: {
                  color: '#333'
              }
          },
          gridLineColor: '#eee',
      },
      series: dataseries,
      plotOptions: {
        column: {
            groupPadding: 0,
            pointPadding: 0,
            borderWidth: 0
        },
        series: {
            color: '#c6dceb'
        }
      }

    });
}
