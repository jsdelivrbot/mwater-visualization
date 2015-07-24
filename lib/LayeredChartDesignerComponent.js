var AggrScalarExprComponent, EditableLinkComponent, ExpressionBuilder, H, LayerDesignerComponent, LayeredChartDesignerComponent, LogicalExprComponent, PopoverComponent, React, ReactSelect, ScalarExprComponent,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ReactSelect = require('react-select');

ScalarExprComponent = require('./ScalarExprComponent');

AggrScalarExprComponent = require('./AggrScalarExprComponent');

LogicalExprComponent = require('./LogicalExprComponent');

ExpressionBuilder = require('./ExpressionBuilder');

EditableLinkComponent = require('./EditableLinkComponent');

PopoverComponent = require('./PopoverComponent');

module.exports = LayeredChartDesignerComponent = (function(superClass) {
  extend(LayeredChartDesignerComponent, superClass);

  function LayeredChartDesignerComponent() {
    this.renderLayer = bind(this.renderLayer, this);
    this.handleAddSeries = bind(this.handleAddSeries, this);
    this.handleRemoveLayer = bind(this.handleRemoveLayer, this);
    this.handleLayerChange = bind(this.handleLayerChange, this);
    this.handleTransposeChange = bind(this.handleTransposeChange, this);
    this.handleTypeChange = bind(this.handleTypeChange, this);
    this.handleTitleChange = bind(this.handleTitleChange, this);
    return LayeredChartDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  LayeredChartDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  LayeredChartDesignerComponent.prototype.updateDesign = function(changes) {
    var design;
    design = _.extend({}, this.props.design, changes);
    return this.props.onDesignChange(design);
  };

  LayeredChartDesignerComponent.prototype.handleTitleChange = function(ev) {
    return this.updateDesign({
      titleText: ev.target.value
    });
  };

  LayeredChartDesignerComponent.prototype.handleTypeChange = function(type) {
    return this.updateDesign({
      type: type
    });
  };

  LayeredChartDesignerComponent.prototype.handleTransposeChange = function(val) {
    return this.updateDesign({
      transpose: val
    });
  };

  LayeredChartDesignerComponent.prototype.handleLayerChange = function(index, layer) {
    var layers;
    layers = this.props.design.layers.slice();
    layers[index] = layer;
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.handleRemoveLayer = function(index) {
    var layers;
    layers = this.props.design.layers.slice();
    layers.splice(index, 1);
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.handleAddSeries = function() {
    var layers;
    layers = this.props.design.layers.slice();
    layers.push({});
    return this.updateDesign({
      layers: layers
    });
  };

  LayeredChartDesignerComponent.prototype.renderTitle = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Title"), H.input({
      type: "text",
      className: "form-control",
      value: this.props.design.titleText,
      onChange: this.handleTitleChange,
      placeholder: "Untitled"
    }));
  };

  LayeredChartDesignerComponent.prototype.renderType = function() {
    var chartTypes;
    chartTypes = [
      {
        id: "bar",
        name: "Bar Chart"
      }, {
        id: "line",
        name: "Line Chart"
      }, {
        id: "pie",
        name: "Pie Chart"
      }, {
        id: "donut",
        name: "Donut Chart"
      }, {
        id: "spline",
        name: "Smoothed Line Chart"
      }, {
        id: "scatter",
        name: "Scatter Chart"
      }, {
        id: "area",
        name: "Area Chart"
      }
    ];
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-th"
    }), " ", "Type"), ": ", React.createElement(EditableLinkComponent, {
      dropdownItems: chartTypes,
      onDropdownItemClicked: this.handleTypeChange
    }, _.findWhere(chartTypes, {
      id: this.props.design.type
    }).name));
  };

  LayeredChartDesignerComponent.prototype.renderTranspose = function() {
    var ref;
    if ((ref = this.props.design.type) === 'pie' || ref === 'donut') {
      return;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-retweet"
    }), " ", "Orientation"), ": ", H.label({
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: !this.props.design.transpose,
      onChange: this.handleTransposeChange.bind(null, false)
    }, "Vertical")), H.label({
      className: "radio-inline"
    }, H.input({
      type: "radio",
      checked: this.props.design.transpose,
      onChange: this.handleTransposeChange.bind(null, true)
    }, "Horizontal")));
  };

  LayeredChartDesignerComponent.prototype.renderLayer = function(index) {
    var style;
    style = {
      borderTop: "solid 1px #EEE",
      paddingTop: 10,
      paddingBottom: 10
    };
    return H.div({
      style: style
    }, React.createElement(LayerDesignerComponent, {
      design: this.props.design,
      schema: this.props.schema,
      index: index,
      onChange: this.handleLayerChange.bind(null, index),
      onRemove: this.handleRemoveLayer.bind(null, index)
    }));
  };

  LayeredChartDesignerComponent.prototype.renderLayers = function() {
    return H.div(null, _.map(this.props.design.layers, (function(_this) {
      return function(layer, i) {
        return _this.renderLayer(i);
      };
    })(this)), H.button({
      className: "btn btn-link",
      type: "button",
      onClick: this.handleAddSeries
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Series"));
  };

  LayeredChartDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderType(), this.renderTranspose(), this.renderLayers(), H.hr(), this.renderTitle());
  };

  return LayeredChartDesignerComponent;

})(React.Component);

LayerDesignerComponent = (function(superClass) {
  extend(LayerDesignerComponent, superClass);

  function LayerDesignerComponent() {
    this.handleStackedChange = bind(this.handleStackedChange, this);
    this.handleYAggrExprChange = bind(this.handleYAggrExprChange, this);
    this.handleYExprChange = bind(this.handleYExprChange, this);
    this.handleColorExprChange = bind(this.handleColorExprChange, this);
    this.handleXExprChange = bind(this.handleXExprChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleNameChange = bind(this.handleNameChange, this);
    return LayerDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  LayerDesignerComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    schema: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  LayerDesignerComponent.prototype.isLayerPolar = function(layer) {
    var ref;
    return (ref = layer.type || this.props.design.type) === 'pie' || ref === 'donut';
  };

  LayerDesignerComponent.prototype.isXAxisRequired = function(layer) {
    return !this.isLayerPolar(layer);
  };

  LayerDesignerComponent.prototype.getXAxisLabel = function(layer) {
    if (this.props.design.transpose) {
      return [
        H.span({
          className: "glyphicon glyphicon-resize-vertical"
        }), " Vertical Axis"
      ];
    } else {
      return [
        H.span({
          className: "glyphicon glyphicon-resize-horizontal"
        }), " Horizontal Axis"
      ];
    }
  };

  LayerDesignerComponent.prototype.getYAxisLabel = function(layer) {
    if (this.isLayerPolar(layer)) {
      return [
        H.span({
          className: "glyphicon glyphicon-repeat"
        }), " Angle Axis"
      ];
    } else if (this.props.design.transpose) {
      return [
        H.span({
          className: "glyphicon glyphicon-resize-horizontal"
        }), " Horizontal Axis"
      ];
    } else {
      return [
        H.span({
          className: "glyphicon glyphicon-resize-vertical"
        }), " Vertical Axis"
      ];
    }
  };

  LayerDesignerComponent.prototype.getColorAxisLabel = function(layer) {
    if (this.isLayerPolar(layer)) {
      return [
        H.span({
          className: "glyphicon glyphicon-text-color"
        }), " Label Axis"
      ];
    } else {
      return [
        H.span({
          className: "glyphicon glyphicon-equalizer"
        }), " Split Axis"
      ];
    }
  };

  LayerDesignerComponent.prototype.updateLayer = function(changes) {
    var layer;
    layer = _.extend({}, this.props.design.layers[this.props.index], changes);
    return this.props.onChange(layer);
  };

  LayerDesignerComponent.prototype.handleNameChange = function(ev) {
    return this.updateLayer({
      name: ev.target.value
    });
  };

  LayerDesignerComponent.prototype.handleTableChange = function(table) {
    return this.updateLayer({
      table: table
    });
  };

  LayerDesignerComponent.prototype.handleXExprChange = function(expr) {
    return this.updateLayer({
      xExpr: expr
    });
  };

  LayerDesignerComponent.prototype.handleColorExprChange = function(expr) {
    return this.updateLayer({
      colorExpr: expr
    });
  };

  LayerDesignerComponent.prototype.handleYExprChange = function(expr) {
    return this.updateLayer({
      yExpr: expr
    });
  };

  LayerDesignerComponent.prototype.handleYAggrExprChange = function(val) {
    return this.updateLayer({
      yExpr: val.expr,
      yAggr: val.aggr
    });
  };

  LayerDesignerComponent.prototype.handleStackedChange = function(ev) {
    return this.updateLayer({
      stacked: ev.target.checked
    });
  };

  LayerDesignerComponent.prototype.renderName = function() {
    var layer;
    if (this.props.design.layers.length <= 1) {
      return;
    }
    layer = this.props.design.layers[this.props.index];
    return H.input({
      type: "text",
      className: "form-control input-sm",
      value: layer.name,
      onChange: this.handleNameChange,
      placeholder: "Series " + (this.props.index + 1)
    });
  };

  LayerDesignerComponent.prototype.renderRemove = function() {
    if (this.props.design.layers.length > 1) {
      return H.button({
        className: "btn btn-xs btn-link pull-right",
        type: "button",
        onClick: this.props.onRemove
      }, H.span({
        className: "glyphicon glyphicon-remove"
      }));
    }
  };

  LayerDesignerComponent.prototype.renderTable = function() {
    var layer, popover;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      popover = "Start by selecting a data source";
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-file"
    }), " ", "Data Source"), ": ", React.createElement(PopoverComponent, {
      html: popover
    }, React.createElement(EditableLinkComponent, {
      dropdownItems: this.props.schema.getTables(),
      onDropdownItemClicked: this.handleTableChange,
      onRemove: layer.table ? this.handleTableChange.bind(this, null) : void 0
    }, layer.table ? this.props.schema.getTable(layer.table).name : H.i(null, "Select..."))));
  };

  LayerDesignerComponent.prototype.renderXAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    if (!this.isXAxisRequired(layer)) {
      return;
    }
    title = this.getXAxisLabel(layer);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, React.createElement(ScalarExprComponent, {
      editorTitle: title,
      schema: this.props.schema,
      table: layer.table,
      value: layer.xExpr,
      onChange: this.handleXExprChange
    })));
  };

  LayerDesignerComponent.prototype.renderColorAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    title = this.getColorAxisLabel(layer);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, React.createElement(ScalarExprComponent, {
      editorTitle: title,
      schema: this.props.schema,
      table: layer.table,
      types: ["enum", "text"],
      value: layer.colorExpr,
      onChange: this.handleColorExprChange
    })));
  };

  LayerDesignerComponent.prototype.renderYAxis = function() {
    var layer, title;
    layer = this.props.design.layers[this.props.index];
    if (!layer.table) {
      return;
    }
    title = this.getYAxisLabel(layer);
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, title), H.div({
      style: {
        marginLeft: 10
      }
    }, React.createElement(AggrScalarExprComponent, {
      editorTitle: title,
      schema: this.props.schema,
      table: layer.table,
      types: ["integer", "decimal"],
      value: {
        expr: layer.yExpr,
        aggr: layer.yAggr
      },
      onChange: this.handleYAggrExprChange
    })));
  };

  LayerDesignerComponent.prototype.renderStacked = function() {
    var layer;
    layer = this.props.design.layers[this.props.index];
    if (!layer.colorExpr || this.isLayerPolar(layer)) {
      return;
    }
    return H.div({
      className: "checkbox"
    }, H.label(null, H.input({
      type: "checkbox",
      value: layer.stacked,
      onChange: this.handleStackedChange
    }, "Stacked")));
  };

  LayerDesignerComponent.prototype.render = function() {
    return H.div(null, this.renderRemove(), this.renderTable(), this.renderXAxis(), this.renderYAxis(), this.renderColorAxis(), this.renderStacked(), this.renderName());
  };

  return LayerDesignerComponent;

})(React.Component);