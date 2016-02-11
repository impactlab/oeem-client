var React = require('react');
var _ = require('lodash');

var DownloadButton = React.createClass({
  onButtonClick: function() {
    var projectListURL = this.props.project_list_url + "?with_attributes=True&with_meter_runs=True";

    var projectAttributeKeyListURL = this.props.project_attribute_key_list_url;

    $.ajax({
      url: projectAttributeKeyListURL,
      dataType: 'json',
      cache: false,
      success: function(projectAttributeKeys) {

        $.ajax({
          url: projectListURL,
          dataType: 'json',
          cache: false,
          success: function(data) {
            var csvData = [];
            var projectDataKeys = [
              "project_id",
              "weather_station",
              "zipcode",
              "latitude",
              "longitude",
              "baseline_period_start",
              "baseline_period_end",
              "reporting_period_start",
              "reporting_period_end",
            ];
            var attributeHeaders = projectAttributeKeys.map(function(a) {
              return a.name;
            });
            var meterRunNames = ["electricity", "natural_gas"];
            var fuelTypeMapping = {
              "electricity": "E",
              "natural_gas": "NG",
            }
            var meterRunKeys = [
              "gross_savings",
              "annual_savings",
              "annual_usage_baseline",
              "annual_usage_reporting",
              "cvrmse_baseline",
              "cvrmse_reporting",
            ];
            var dataRows = [];
            data.forEach(function(d,i) {
              var dataRow = projectDataKeys.map(function(k) {
                return d[k];
              });
              meterRunNames.forEach(function(ft) {
                var meterRun = _.find(d.recent_meter_runs, {'fuel_type': fuelTypeMapping[ft]});
                meterRunKeys.forEach(function(k) {
                  if (meterRun != null) {
                    var attribute = meterRun[k];
                    if (attribute != null) {
                      dataRow.push(attribute);
                    } else {
                      dataRow.push("");
                    }
                  } else {
                    dataRow.push("");
                  }
                });
              });
              projectAttributeKeys.forEach(function(a) {
                var attribute = _.result(_.find( d.attributes, { 'key': a.id }), 'value');
                if (attribute != null) {
                  dataRow.push(attribute);
                } else {
                  dataRow.push("");
                }
              });
              dataRows.push(dataRow);
            });
            var meterRunHeaders = [];
            meterRunNames.forEach(function(n) {
              meterRunKeys.forEach(function(k) {
                meterRunHeaders.push(k + "_" + n);
              });
            });
            csvData.push(projectDataKeys.concat(meterRunHeaders).concat(attributeHeaders));
            csvData = csvData.concat(dataRows);

            this.exportToCSV("openeemeter-download.csv", csvData);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(projectListURL, status, err.toString());
          }.bind(this)
        });

      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectAttributeKeyListURL, status, err.toString());
      }.bind(this)
    });


  },
  exportToCSV: function(filename, rows) {
    var processRow = function (row) {
      var finalVal = '';
      for (var j = 0; j < row.length; j++) {
        var innerValue = row[j] === null ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        };
        var result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
          result = '"' + result + '"';
        if (j > 0)
          finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
      csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },
  render: function() {
    return (
      <div className="downloadButton">
        <button type="button" className="btn btn-default pull-right" onClick={this.onButtonClick}>
          Download all data
        </button>
      </div>
    )
  }
});

module.exports = DownloadButton;
