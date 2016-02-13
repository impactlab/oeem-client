var React = require('react');

var ProjectBlockFilter = React.createClass({
  loadProjectBlocks: function() {
    var projectBlockListURL = this.props.project_block_list_url + "?name_only=True";
    $.ajax({
      url: projectBlockListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({projectBlockList: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }.bind(this)
    });
  },

  deleteProjectBlock: function(projectBlock) {
    var projectBlockDetailURL = this.props.project_block_detail_url + projectBlock.id;
    $.ajax({
      url: projectBlockDetailURL,
      dataType: 'json',
      type: 'DELETE',
      headers: { "X-CSRFToken": this.props.csrf_token },
      success: (function (data) {
        this.loadProjectBlocks();
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }).bind(this)
    });
  },

  performUpdateName:function(projectBlock) {
    var projectBlockData = {
      name: projectBlock.name,
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
        this.loadProjectBlocks();
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(projectBlockListURL, status, err.toString());
      }).bind(this)
    });
  },

  handleSelectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    ids.push(projectBlockId);
    this.setState({selectedProjectBlockIds: ids}, this.callCallback);
  },

  handleDeselectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    var index = ids.indexOf(projectBlockId);
    if (index != -1) {
      ids.splice(index, 1);
    }
    this.setState({selectedProjectBlockIds: ids}, this.callCallback);
  },

  toggleFilterModeCallback: function() {
    var filterMode = (this.state.filterMode == "OR") ? "AND" : "OR";
    this.setState({filterMode: filterMode}, this.callCallback);
  },

  callCallback: function() {
    this.props.selectProjectBlocksCallback({
      ids: this.state.selectedProjectBlockIds,
      filterMode: this.state.filterMode,
    });
  },

  toggleEditing: function() {
    this.setState({editing: !this.state.editing});
  },

  getInitialState: function() {
    return {
      projectBlockList: [],
      editing: false,
      selectedProjectBlockIds: [],
      filterMode: this.props.projectBlockIdFilterMode,
    };
  },

  componentDidMount: function() {
    this.loadProjectBlocks();
  },

  componentWillReceiveProps: function() {
    this.loadProjectBlocks();
  },

  render: function() {
    var projectBlockListItems = this.state.projectBlockList.map(function(d, i) {
      var selected = (this.state.selectedProjectBlockIds.indexOf(d.id) != -1);
      return (
        <ProjectBlockListItem
          key={d.id}
          selected={selected}
          editing={this.state.editing}
          handleSelectProjectBlock={this.handleSelectProjectBlock}
          handleDeselectProjectBlock={this.handleDeselectProjectBlock}
          deleteProjectBlock={this.deleteProjectBlock}
          performUpdateName={this.performUpdateName}
          projectBlock={d}
        />
      );
    }, this);

    var editButton;
    if (this.state.editing) {
      editButton = <a className="pull-right" onClick={this.toggleEditing}>Done editing</a>
    } else {
      editButton = <a className="pull-right" onClick={this.toggleEditing}>Edit</a>
    }

    return (
      <div className="projectBlockFilter">
        <span>Project block (mode:&nbsp;
          <a onClick={this.toggleFilterModeCallback}>
            {this.state.filterMode}
          </a>) {editButton}
        </span>
        <ul className="list-group">
         {projectBlockListItems}
        </ul>
      </div>
    )
  }
});

var ProjectBlockListItem = React.createClass({
  handleSelect: function() {
    if (this.props.selected) {
      this.props.handleDeselectProjectBlock(this.props.projectBlock.id);
    }else{
      this.props.handleSelectProjectBlock(this.props.projectBlock.id);
    }
  },

  handleDelete: function() {
    this.props.deleteProjectBlock(this.props.projectBlock);
  },

  toggleRenaming: function() {
    this.setState({renaming: !this.state.renaming});
  },

  handleProjectBlockNameChange: function(event) {
    this.setState({
      newProjectBlockName: event.target.value,
    });
  },

  handleRename: function() {
    this.toggleRenaming();
    this.props.performUpdateName({
      id: this.props.projectBlock.id,
      name: this.state.newProjectBlockName,
    });
  },

  getInitialState: function() {
    return {
      renaming: false,
      newProjectBlockName: this.props.projectBlock.name,
    }
  },

  render: function() {

    var listItemClasses;
    if (this.props.selected) {
      listItemClasses = "projectBlockListItem list-group-item clearfix active";
    } else {
      listItemClasses = "projectBlockListItem list-group-item clearfix";
    }

    var deleteButton = null;
    var renameButton = null;
    var name = <a onClick={this.handleSelect}>{this.props.projectBlock.name}&nbsp;</a>;
    if (this.props.editing) {
      if (this.state.renaming) {
        renameButton = <a className="pull-right" onClick={this.handleRename}>done&nbsp;</a>;

        name = <input
            type="text"
            placeholder="Name of new Project Block"
            value={this.state.newProjectBlockName}
            style={{width:"auto", marginRight: "20px"}}
            onChange={this.handleProjectBlockNameChange}
          />;
      } else {
        renameButton = <a className="pull-right" onClick={this.toggleRenaming}>rename&nbsp;</a>;
        deleteButton = <a className="pull-right" onClick={this.handleDelete}>delete</a>;
      }
    }


    return (
      <li className={listItemClasses}>
        {name}
        {deleteButton}
        {renameButton}
      </li>
    )
  }
});

module.exports = ProjectBlockFilter;
