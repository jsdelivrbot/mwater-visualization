var CheckboxComponent, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = CheckboxComponent = (function(superClass) {
  extend(CheckboxComponent, superClass);

  function CheckboxComponent() {
    this.handleClick = bind(this.handleClick, this);
    return CheckboxComponent.__super__.constructor.apply(this, arguments);
  }

  CheckboxComponent.propTypes = {
    checked: PropTypes.bool,
    onClick: PropTypes.func,
    onChange: PropTypes.func
  };

  CheckboxComponent.prototype.handleClick = function() {
    if (this.props.onChange) {
      this.props.onChange(!this.props.checked);
    }
    if (this.props.onClick) {
      return this.props.onClick();
    }
  };

  CheckboxComponent.prototype.render = function() {
    return R('div', {
      className: (this.props.checked ? "mwater-visualization-checkbox checked" : "mwater-visualization-checkbox"),
      onClick: this.handleClick
    }, this.props.children);
  };

  return CheckboxComponent;

})(React.Component);
