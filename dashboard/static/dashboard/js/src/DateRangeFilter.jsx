var React = require('react');
var moment = require('moment');
var DateRangePicker = require('react-bootstrap-daterangepicker');


var DateRangeFilter = React.createClass({
  handleEvent: function (event, picker) {
		this.setState({
			startDate: picker.startDate,
			endDate: picker.endDate
		}, this.callCallback);
	},
  callCallback: function() {
    var range = null;
    if (this.state.active) {
      range = {
        start: this.state.startDate,
        end: this.state.endDate,
      };
    }
    this.props.onSelect(range);
  },
  toggleActive: function() {
    this.setState({active: !this.state.active}, this.callCallback);
  },
  getInitialState: function () {
		return {
			ranges: {
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
				'Last 6 Months': [moment().subtract(182, 'days'), moment()],
				'This Year': [moment().startOf('year'), moment().endOf('year')],
				'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
			},
			startDate: moment().subtract(29, 'days'),
			endDate: moment(),
			active: false,
		};
	},
  render: function() {
    var start = this.state.startDate.format('YYYY-MM-DD');
		var end = this.state.endDate.format('YYYY-MM-DD');
		var label = start + ' - ' + end;
		if (start === end) {
			label = start;
		}

    var content, active;
    if (this.state.active) {
      content = <DateRangePicker
        startDate={this.state.startDate}
        endDate={this.state.endDate}
        ranges={this.state.ranges}
        onEvent={this.handleEvent}
      >
        <button className="btn btn-default" type="button">
          <div className="pull-left">
            <i className="fa fa-calendar glyphicon glyphicon-calendar"></i>
          </div>
          <div className="pull-right">
            <span>{label}&nbsp;</span>
            <span className="caret"></span>
          </div>
        </button>
      </DateRangePicker>;
      active = "Deactivate"
    } else {
      content = null;
      active = "Activate";
    }

    return (
      <div className="dateRangeFilter">
        <span>{this.props.title}&nbsp;
          <a onClick={this.toggleActive}>{active}</a>
        </span>
        {content}
      </div>
    )
  }
});

module.exports = DateRangeFilter;
