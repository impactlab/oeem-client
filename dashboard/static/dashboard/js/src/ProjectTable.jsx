var ProjectTable = React.createClass({
  render: function() {
    var projects = this.props.projects.map(function(d,i) {
      return (
        <ProjectTableItem
          key={d.id}
          project={d}
        />
      )
    });
    return (
      <div className="projectTable">
        Project Table
        <ul className="list-group">
          {projects}
        </ul>
      </div>
    )
  }
});

var ProjectTableItem = React.createClass({
  handleSelect: function() {
    console.log(this.props.project);
  },
  render: function() {
    return (
      <li className="list-group-item clearfix">
        <a onClick={this.handleSelect}>
          {this.props.project.project_id}
        </a>
      </li>
    )
  }
});

module.exports = ProjectTable;
