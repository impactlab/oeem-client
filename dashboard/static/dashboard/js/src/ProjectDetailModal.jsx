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

var ProjectDetailModal = React.createClass({
  closeModal: function() {
    this.props.closeModalCallback();
  },

  componentWillReceiveProps: function(nextProps) {
    console.log(nextProps);
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
    return (
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.closeModal}
        style={customStyles}>
        <button type="button" className="close pull-right" onClick={this.closeModal}>&times;</button>
        <div>
          <h4>{title}</h4>
        </div>
      </Modal>
    )
  }
});

module.exports = ProjectDetailModal;
