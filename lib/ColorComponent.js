var ClickOutHandler, ColorComponent, PropTypes, R, React, SketchPicker, SwatchesPicker,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ClickOutHandler = require('react-onclickout');

SketchPicker = require("react-color").SketchPicker;

SwatchesPicker = require('react-color').SwatchesPicker;

module.exports = ColorComponent = (function(superClass) {
  extend(ColorComponent, superClass);

  ColorComponent.propTypes = {
    color: PropTypes.string,
    onChange: PropTypes.func
  };

  function ColorComponent(props) {
    this.handleAdvanced = bind(this.handleAdvanced, this);
    this.handleTransparent = bind(this.handleTransparent, this);
    this.handleReset = bind(this.handleReset, this);
    this.handleClose = bind(this.handleClose, this);
    this.handleClick = bind(this.handleClick, this);
    ColorComponent.__super__.constructor.call(this, props);
    this.state = {
      open: false,
      advanced: false
    };
  }

  ColorComponent.prototype.handleClick = function() {
    return this.setState({
      open: !this.state.open,
      advanced: false
    });
  };

  ColorComponent.prototype.handleClose = function(color) {
    return this.props.onChange(color.hex);
  };

  ColorComponent.prototype.handleReset = function() {
    this.setState({
      open: false
    });
    return this.props.onChange(null);
  };

  ColorComponent.prototype.handleTransparent = function() {
    this.setState({
      open: false
    });
    return this.props.onChange("transparent");
  };

  ColorComponent.prototype.handleAdvanced = function() {
    return this.setState({
      advanced: !this.state.advanced
    });
  };

  ColorComponent.prototype.render = function() {
    var popupPosition, style;
    style = {
      height: 20,
      width: 20,
      border: "solid 2px #888",
      borderRadius: 4,
      backgroundColor: this.props.color,
      cursor: "pointer",
      display: "inline-block"
    };
    if (!this.props.color) {
      style.backgroundColor = "#AAA";
      style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)";
    }
    popupPosition = {
      position: 'absolute',
      top: 0,
      left: 30,
      zIndex: 1000,
      backgroundColor: "white",
      border: "solid 1px #DDD",
      borderRadius: 3
    };
    return R('div', {
      style: {
        position: "relative",
        display: "inline-block"
      }
    }, R('div', {
      style: style,
      onClick: this.handleClick
    }), this.state.open ? React.createElement(ClickOutHandler, {
      onClickOut: ((function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this))
    }, R('div', {
      style: popupPosition
    }, R('button', {
      type: "button",
      className: "btn btn-link btn-sm",
      onClick: this.handleReset
    }, R('i', {
      className: "fa fa-undo"
    }), " Reset Color"), R('button', {
      type: "button",
      className: "btn btn-link btn-sm",
      onClick: this.handleAdvanced
    }, this.state.advanced ? "Basic" : "Advanced"), this.state.advanced ? React.createElement(SketchPicker, {
      color: this.props.color || void 0,
      disableAlpha: true,
      onChangeComplete: this.handleClose
    }) : React.createElement(SwatchesPicker, {
      color: this.props.color || void 0,
      onChangeComplete: this.handleClose
    }))) : void 0);
  };

  return ColorComponent;

})(React.Component);
