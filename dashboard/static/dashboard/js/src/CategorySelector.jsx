var React = require('react');

var CategorySelector = React.createClass({
  render: function() {
    var categoryListItems = this.props.categories.map(function(d, i) {
      var selected = (this.props.selectedCategoryId == d.id);
      return (
        <CategoryListItem
          key={i}
          category={d}
          selected={selected}
          selectCategoryCallback={this.props.selectCategoryCallback}
        />
      )
    }, this);

    var title;
    if (this.props.title != null) {
      title = <h5>{this.props.title}</h5>
    } else {
      title = null;
    }

    return (
      <div className="categorySelector">
        {title}
        <div className="btn-group" data-toggle="buttons">
          {categoryListItems}
        </div>
      </div>
    )
  }
});

var CategoryListItem = React.createClass({
  handleSelect: function(e) {
    this.props.selectCategoryCallback(this.props.category.id);
  },
  render: function() {
    var bootstrap_class;
    if (this.props.selected) {
      bootstrap_class = "categoryListItem btn btn-primary active";
    } else {
      bootstrap_class = "categoryListItem btn btn-primary";
    }
    return (
      <label className={bootstrap_class} onClick={this.handleSelect}>
        <input
          type="radio"
          checked={this.props.selected}
          readOnly={true}
        />
        {this.props.category.name}
      </label>
    )
  }
});

module.exports = CategorySelector;
