var React = require('react');
var Modal = require('react-modal');

const customStyles = {
  content : {
    top                   : '7%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    width                 : '70%',
    transform             : 'translate(-50%, 0)',
    border                : 'none',
  },
  overlay: {
    backgroundColor   : 'rgba(100, 100, 100, 0.55)',
    zIndex: 10,
  },
};

var SaveProjectBlockModal = React.createClass({

  loadProjectBlocks: function() {
    var projectBlockListURL = this.props.project_block_list_url + "?name_only=True"
    $.ajax({
      url: projectBlockListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({projectBlocks: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }.bind(this)
    });
  },

  closeModal: function() {
    this.props.closeModalCallback();
  },

  chooseCreate: function() {
    this.setState({
      create: true,
      update: false,
    });
  },

  chooseUpdate: function() {
    this.setState({
      create: false,
      update: true,
    });
  },

  performCreate: function() {
    var projectList = this.props.projects.map(function(d) {
      return d.id;
    });

    var projectBlockData = {
      name: this.state.newProjectBlockName,
      projects: projectList,
    };

    var projectBlockListURL = this.props.project_block_list_url;
    console.log(projectBlockData);

    $.ajax({
      url: projectBlockListURL,
      dataType: 'json',
      type: 'POST',
      headers: { "X-CSRFToken": this.props.csrf_token },
      data: JSON.stringify(projectBlockData),
      contentType: "application/json; charset=utf-8",
      success: (function (data) {
        this.closeModal();
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }).bind(this)
    });
  },

  performUpdate:function(projectBlock) {
    var projectList = this.props.projects.map(function(d) {
      return d.id;
    });

    var projectBlockData = {
      projects: projectList,
    };

    var projectBlockDetailURL = this.props.project_block_detail_url + projectBlock.id;

    $.ajax({
      url: projectBlockDetailURL,
      dataType: 'json',
      type: 'PATCH',
      headers: { "X-CSRFToken": this.props.csrf_token },
      data: JSON.stringify(projectBlockData),
      contentType: "application/json; charset=utf-8",
      success: (function (data) {
        this.closeModal();
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }).bind(this)
    });
  },

  handleProjectBlockNameChange: function(event) {
    this.setState({
      newProjectBlockName: event.target.value,
    });
  },

  selectProjectBlock: function(projectBlock) {
    this.performUpdate(projectBlock);
  },

  getInitialState: function() {
    return {
      create: false,
      update: false,
      projectBlocks: [],
      selectedProjectBlock: null,
      newProjectBlockName: "",
    }
  },

  componentDidMount: function() {
    this.loadProjectBlocks();
  },

  componentWillReceiveProps: function() {
    this.loadProjectBlocks();
  },

  render: function() {

    var panel=null;
    var createButton = <a className="btn btn-default" onClick={this.chooseCreate}>Create new</a>;
    var updateButton = <a className="btn btn-default" onClick={this.chooseUpdate}>Update existing</a>;
    if (this.state.create) {
      panel = (
        <div className="panel panel-default">
          <div className="panel-body">
            <input
              type="text"
              placeholder="Name of new Project Block"
              value={this.state.newProjectBlockName}
              style={{width:"auto", marginRight: "20px"}}
              onChange={this.handleProjectBlockNameChange}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={this.performCreate}
              disabled={!this.state.newProjectBlockName}>
              Save
            </button>
          </div>
        </div>
      );
      createButton = <a className="btn btn-default active" onClick={this.chooseCreate}>Create new</a>;
    } else if (this.state.update) {

      var projectBlockChoices = this.state.projectBlocks.map(function(d) {
        return (
          <ProjectBlockChoice
            projectBlock={d}
            selectProjectBlockCallback={this.selectProjectBlock}
            key={d.id}
          />
        )
      }, this);

      panel = (
        <div className="panel panel-default">
          <div className="panel-body">
            <ul className="list-group">
            {projectBlockChoices}
            </ul>
          </div>
        </div>
      );
      updateButton = <a className="btn btn-default active" onClick={this.chooseUpdate}>Update existing</a>;
    }

    return (
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.closeModal}
        style={customStyles}>
        <div className="row">
          <div className="col-md-12 inline-headers">
            <h4>Save filters as a Project Block</h4>
            <button type="button" className="close pull-right" onClick={this.closeModal}>&times;</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {createButton}
            {updateButton}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            {panel}
          </div>
        </div>
      </Modal>
    )
  }
});

var ProjectBlockChoice = React.createClass({
  handleClick: function() {
    this.props.selectProjectBlockCallback(this.props.projectBlock);
  },
  render: function() {
    return (
      <li className="list-group-item">
        <button
          className="btn btn-primary"
          type="button"
          onClick={this.handleClick}>
          <span>Save as {this.props.projectBlock.name}&nbsp;</span>
        </button>
      </li>
    )
  }
});

module.exports = SaveProjectBlockModal;
