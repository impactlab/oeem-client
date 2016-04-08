var helpers = {};

helpers.getProjectParam = function(projects) {
  var sorted_ids = projects.map(function(d, i){
    return d.id;
  }).sort(function (a, b) { // js doesn't sort numerically out of the box??
    return a - b;
  });

  var groups = [], group = [];
  var parts = sorted_ids.forEach(function(d) {
    if (group.length > 0) {
      if (d == group[group.length-1] + 1) {
        // consecutive, update existing

        // expand to max length of 2
        if (group.length == 1) {
          group.push(d);
        } else {
          group[1] = d;
        }
      } else {
        // non-consecutive - start a new group
        groups.push(group);
        group = [d];
      }
    } else {
      group = [d];
    }
  });

  if (group.length != 0) {
    groups.push(group);
  }

  groups = groups.map(function(d) {
    if (d.length == 1) {
      return d.toString();
    } else {
      return d[0] + "-" + d[1];
    }
  });

  return "projects=" + groups.join("+");
};

module.exports = helpers;
