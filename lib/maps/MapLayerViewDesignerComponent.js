var ActionCancelModalComponent, LayerFactory, MapLayerViewDesignerComponent, PropTypes, R, Rcslider, React, ui,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

Rcslider = require('rc-slider')["default"];

LayerFactory = require('./LayerFactory');

ui = require('react-library/lib/bootstrap');

module.exports = MapLayerViewDesignerComponent = (function(superClass) {
  extend(MapLayerViewDesignerComponent, superClass);

  MapLayerViewDesignerComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    layerView: PropTypes.object.isRequired,
    onLayerViewChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,
    connectDropTarget: PropTypes.func,
    allowEditingLayer: PropTypes.bool.isRequired,
    filters: PropTypes.array
  };

  function MapLayerViewDesignerComponent(props) {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleOpacityChange = bind(this.handleOpacityChange, this);
    this.handleRename = bind(this.handleRename, this);
    this.handleSaveEditing = bind(this.handleSaveEditing, this);
    this.handleToggleEditing = bind(this.handleToggleEditing, this);
    this.handleHideLegend = bind(this.handleHideLegend, this);
    this.handleVisibleClick = bind(this.handleVisibleClick, this);
    var layer;
    MapLayerViewDesignerComponent.__super__.constructor.call(this, props);
    layer = LayerFactory.createLayer(this.props.layerView.type);
    this.state = {
      editing: props.allowEditingLayer && layer.isIncomplete(this.props.layerView.design, this.props.schema)
    };
  }

  MapLayerViewDesignerComponent.prototype.update = function(updates) {
    return this.props.onLayerViewChange(_.extend({}, this.props.layerView, updates));
  };

  MapLayerViewDesignerComponent.prototype.handleVisibleClick = function() {
    return this.update({
      visible: !this.props.layerView.visible
    });
  };

  MapLayerViewDesignerComponent.prototype.handleHideLegend = function(hideLegend) {
    return this.update({
      hideLegend: hideLegend
    });
  };

  MapLayerViewDesignerComponent.prototype.handleToggleEditing = function() {
    return this.setState({
      editing: !this.state.editing
    });
  };

  MapLayerViewDesignerComponent.prototype.handleSaveEditing = function(design) {
    return this.update({
      design: design
    });
  };

  MapLayerViewDesignerComponent.prototype.handleRename = function() {
    var name;
    if (this.props.allowEditingLayer) {
      name = prompt("Enter new name", this.props.layerView.name);
      if (name) {
        return this.update({
          name: name
        });
      }
    }
  };

  MapLayerViewDesignerComponent.prototype.renderVisible = function() {
    if (this.props.layerView.visible) {
      return R('i', {
        className: "fa fa-fw fa-check-square",
        style: {
          color: "#2E6DA4"
        },
        onClick: this.handleVisibleClick
      });
    } else {
      return R('i', {
        className: "fa fa-fw fa-square",
        style: {
          color: "#DDDDDD"
        },
        onClick: this.handleVisibleClick
      });
    }
  };

  MapLayerViewDesignerComponent.prototype.renderHideLegend = function() {
    return R(ui.Checkbox, {
      value: this.props.layerView.hideLegend,
      onChange: this.handleHideLegend
    }, "Hide Legend");
  };

  MapLayerViewDesignerComponent.prototype.renderName = function() {
    return R('span', {
      className: "hover-display-parent",
      onClick: this.handleRename,
      style: {
        cursor: "pointer"
      }
    }, this.props.layerView.name, " ", R('span', {
      className: "hover-display-child glyphicon glyphicon-pencil text-muted"
    }));
  };

  MapLayerViewDesignerComponent.prototype.renderEditor = function() {
    var layer;
    layer = LayerFactory.createLayer(this.props.layerView.type);
    return R('div', null, layer.isEditable() ? layer.createDesignerElement({
      design: this.props.layerView.design,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onDesignChange: this.handleSaveEditing,
      filters: this.props.filters
    }) : void 0, this.renderOpacityControl(), this.renderHideLegend());
  };

  MapLayerViewDesignerComponent.prototype.renderLayerEditToggle = function() {
    return R('div', {
      key: "edit",
      style: {
        marginBottom: (this.state.editing ? 10 : void 0)
      }
    }, R('a', {
      onClick: this.handleToggleEditing,
      style: {
        fontSize: 12,
        cursor: "pointer"
      }
    }, this.state.editing ? [
      R('i', {
        className: "fa fa-caret-up"
      }), " Close"
    ] : [
      R('i', {
        className: "fa fa-cog"
      }), " Customize..."
    ]));
  };

  MapLayerViewDesignerComponent.prototype.handleOpacityChange = function(newValue) {
    return this.update({
      opacity: newValue / 100
    });
  };

  MapLayerViewDesignerComponent.prototype.handleRemove = function() {
    if (confirm("Delete layer?")) {
      return this.props.onRemove();
    }
  };

  MapLayerViewDesignerComponent.prototype.renderOpacityControl = function() {
    return R('div', {
      className: 'form-group',
      style: {
        paddingTop: 10
      }
    }, R('label', {
      className: 'text-muted'
    }, R('span', null, "Opacity: " + (Math.round(this.props.layerView.opacity * 100)) + "%")), R('div', {
      style: {
        padding: '10px'
      }
    }, React.createElement(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.layerView.opacity * 100,
      onChange: this.handleOpacityChange
    })));
  };

  MapLayerViewDesignerComponent.prototype.renderDeleteLayer = function() {
    return R('div', {
      style: {
        float: "right",
        cursor: "pointer",
        marginLeft: 10
      },
      key: "delete"
    }, R('a', {
      onClick: this.handleRemove
    }, R('i', {
      className: "fa fa-remove"
    })));
  };

  MapLayerViewDesignerComponent.prototype.render = function() {
    var layer, style;
    layer = LayerFactory.createLayer(this.props.layerView.type);
    style = {
      cursor: "move",
      marginRight: 8,
      opacity: 0.5
    };
    return this.props.connectDragPreview(this.props.connectDropTarget(R('div', null, R('div', {
      style: {
        fontSize: 16
      },
      key: "layerView"
    }, this.props.connectDragSource ? this.props.connectDragSource(R('i', {
      className: "fa fa-bars",
      style: style
    })) : void 0, this.props.allowEditingLayer ? this.renderDeleteLayer() : void 0, this.renderVisible(), "\u00A0", this.renderName()), this.props.allowEditingLayer ? this.renderLayerEditToggle() : void 0, this.state.editing ? this.renderEditor() : void 0)));
  };

  return MapLayerViewDesignerComponent;

})(React.Component);
