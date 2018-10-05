var DecoratedBlockComponent, PropTypes, R, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = DecoratedBlockComponent = (function(superClass) {
  extend(DecoratedBlockComponent, superClass);

  DecoratedBlockComponent.propTypes = {
    style: PropTypes.object,
    onBlockRemove: PropTypes.func.isRequired,
    connectMoveHandle: PropTypes.func,
    connectDragPreview: PropTypes.func,
    connectResizeHandle: PropTypes.func,
    aspectRatio: PropTypes.number,
    onAspectRatioChange: PropTypes.func
  };

  function DecoratedBlockComponent(props) {
    this.handleMouseUp = bind(this.handleMouseUp, this);
    this.handleMouseMove = bind(this.handleMouseMove, this);
    this.handleAspectMouseDown = bind(this.handleAspectMouseDown, this);
    DecoratedBlockComponent.__super__.constructor.call(this, props);
    this.state = {
      aspectDragY: null,
      initialAspectDragY: null,
      initialClientY: null
    };
  }

  DecoratedBlockComponent.prototype.componentWillUnmount = function() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    return document.removeEventListener("mouseup", this.handleMouseUp);
  };

  DecoratedBlockComponent.prototype.handleAspectMouseDown = function(ev) {
    ev.preventDefault();
    this.setState({
      aspectDragY: ev.currentTarget.parentElement.offsetHeight,
      initialAspectDragY: ev.currentTarget.parentElement.offsetHeight
    });
    document.addEventListener("mousemove", this.handleMouseMove);
    return document.addEventListener("mouseup", this.handleMouseUp);
  };

  DecoratedBlockComponent.prototype.handleMouseMove = function(ev) {
    var aspectDragY;
    if (this.state.initialClientY != null) {
      aspectDragY = this.state.initialAspectDragY + ev.clientY - this.state.initialClientY;
      if (aspectDragY > 20) {
        return this.setState({
          aspectDragY: aspectDragY
        });
      }
    } else {
      return this.setState({
        initialClientY: ev.clientY
      });
    }
  };

  DecoratedBlockComponent.prototype.handleMouseUp = function(ev) {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    this.props.onAspectRatioChange(this.props.aspectRatio / (this.state.aspectDragY / this.state.initialAspectDragY));
    return this.setState({
      aspectDragY: null,
      initialAspectDragY: null,
      initialClientY: null
    });
  };

  DecoratedBlockComponent.prototype.renderAspectDrag = function() {
    var lineStyle;
    if (this.state.aspectDragY != null) {
      lineStyle = {
        position: "absolute",
        borderTop: "solid 3px #38D",
        top: this.state.aspectDragY,
        left: 0,
        right: 0
      };
      return R('div', {
        style: lineStyle,
        key: "aspectDrag"
      });
    } else {
      return null;
    }
  };

  DecoratedBlockComponent.prototype.render = function() {
    var elem, preview;
    elem = R('div', {
      className: "mwater-visualization-decorated-block",
      style: this.props.style
    }, this.props.children, this.renderAspectDrag(), !this.props.isDragging && (this.props.connectMoveHandle != null) ? this.props.connectMoveHandle(R('div', {
      key: "move",
      className: "mwater-visualization-decorated-block-move"
    }, R('i', {
      className: "fa fa-arrows"
    }))) : void 0, !this.props.isDragging && (this.props.onBlockRemove != null) ? R('div', {
      key: "remove",
      className: "mwater-visualization-decorated-block-remove",
      onClick: this.props.onBlockRemove
    }, R('i', {
      className: "fa fa-times"
    })) : void 0, !this.props.isDragging && (this.props.onAspectRatioChange != null) ? R('div', {
      key: "aspect",
      className: "mwater-visualization-decorated-block-aspect",
      onMouseDown: this.handleAspectMouseDown
    }, R('i', {
      className: "fa fa-arrows-v"
    })) : void 0, !this.props.isDragging && (this.props.connectResizeHandle != null) ? this.props.connectResizeHandle(R('div', {
      key: "resize",
      className: "mwater-visualization-decorated-block-resize"
    }, R('i', {
      className: "fa fa-expand fa-rotate-90"
    }))) : void 0, this.props.connectDragPreview ? (preview = R('div', {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none"
      }
    }, " "), this.props.connectDragPreview(preview)) : void 0);
    return elem;
  };

  return DecoratedBlockComponent;

})(React.Component);
