var React = require('react');
var Modal = require('react-modal');
var ProjectConsumptionTimeseriesBox = require('./ProjectConsumptionTimeseriesBox.jsx');

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

var ProjectDetailModal = React.createClass({
  closeModal: function() {
    this.props.closeModalCallback();
  },

  goToPrev: function() {
    this.props.selectProjectCallback(this.props.prevProject);
  },

  goToNext: function() {
    this.props.selectProjectCallback(this.props.nextProject);
  },

  getInitialState: function() {
    return {
      data: [],
    }
  },

  render: function() {
    var title, content;
    if (this.props.project != null) {
      title = "Project " + this.props.project.project_id;
      content = (
        this.props.project.project_id
      )
    } else {
      title = "No projects selected.";
      content = null;
    }

    var navButtons; // Prevous / Next
    if (this.props.prevProject != null) {
      if (this.props.nextProject != null) {
        navButtons = (<div className="btn-group pull-right">
          <button type="button" className="btn btn-primary btn-xs" onClick={this.goToPrev}>Previous</button>
          <button type="button" className="btn btn-primary btn-xs" onClick={this.goToNext}>Next</button>
        </div>);
      } else {
        navButtons = (<div className="btn-group pull-right">
          <button type="button" className="btn btn-primary btn-xs" onClick={this.goToPrev}>Previous</button>
        </div>);
      }
    } else {
      if (this.props.nextProject != null) {
        navButtons = (<div className="btn-group pull-right">
          <button type="button" className="btn btn-primary btn-xs" onClick={this.goToNext}>Next</button>
        </div>);
      } else {
        navButtons = null;
      }
    }

    return (

      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.closeModal}
        style={customStyles}>
        <div className="row">
          <div className="col-md-12 inline-headers">
            <h4>{title}</h4>
            <button type="button" className="close pull-right" onClick={this.closeModal}>&times;</button>
            {navButtons}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-body">
                <ProjectConsumptionTimeseriesBox
                  project={this.props.project}
                  consumption_metadata_list_url={this.props.consumption_metadata_list_url}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
});

module.exports = ProjectDetailModal;
