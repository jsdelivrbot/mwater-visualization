var AdminChoroplethLayerDesigner, AdminScopeAndDetailLevelComponent, AxisComponent, ColorComponent, EditPopupComponent, ExprCompiler, ExprComponent, ExprUtils, FilterExprComponent, H, PropTypes, R, Rcslider, React, TableSelectComponent, ZoomLevelsComponent, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

FilterExprComponent = require("mwater-expressions-ui").FilterExprComponent;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisComponent = require('./../axes/AxisComponent');

TableSelectComponent = require('../TableSelectComponent');

ColorComponent = require('../ColorComponent');

Rcslider = require('rc-slider');

EditPopupComponent = require('./EditPopupComponent');

ZoomLevelsComponent = require('./ZoomLevelsComponent');

AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');

module.exports = AdminChoroplethLayerDesigner = (function(superClass) {
  extend(AdminChoroplethLayerDesigner, superClass);

  function AdminChoroplethLayerDesigner() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColorAxisChange = bind(this.handleColorAxisChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    this.handleScopeAndDetailLevelChange = bind(this.handleScopeAndDetailLevelChange, this);
    return AdminChoroplethLayerDesigner.__super__.constructor.apply(this, arguments);
  }

  AdminChoroplethLayerDesigner.propTypes = {
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func.isRequired,
    filters: PropTypes.array
  };

  AdminChoroplethLayerDesigner.prototype.update = function(updates) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates));
  };

  AdminChoroplethLayerDesigner.prototype.updateAxes = function(changes) {
    var axes;
    axes = _.extend({}, this.props.design.axes, changes);
    return this.update({
      axes: axes
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleScopeAndDetailLevelChange = function(scope, scopeLevel, detailLevel) {
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      scope: scope,
      scopeLevel: scopeLevel,
      detailLevel: detailLevel
    }));
  };

  AdminChoroplethLayerDesigner.prototype.handleTableChange = function(table) {
    var adminRegionExpr, column, i, len, ref;
    adminRegionExpr = null;
    if (table) {
      ref = this.props.schema.getColumns(table);
      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];
        if (column.type === "join" && column.join.type === "n-1" && column.join.toTable === "admin_regions") {
          adminRegionExpr = {
            type: "field",
            table: table,
            column: column.id
          };
          break;
        }
      }
    }
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      table: table,
      adminRegionExpr: adminRegionExpr
    }));
  };

  AdminChoroplethLayerDesigner.prototype.handleColorChange = function(color) {
    return this.update({
      color: color
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleColorAxisChange = function(axis) {
    return this.updateAxes({
      color: axis
    });
  };

  AdminChoroplethLayerDesigner.prototype.handleFilterChange = function(expr) {
    return this.update({
      filter: expr
    });
  };

  AdminChoroplethLayerDesigner.prototype.renderTable = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.i({
      className: "fa fa-database"
    }), " ", "Data Source"), H.div({
      style: {
        marginLeft: 10
      }
    }, R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange,
      filter: this.props.design.filter,
      onFilterChange: this.handleFilterChange
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderAdminRegionExpr = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-map-marker"
    }), " Location"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: (function(_this) {
        return function(expr) {
          return _this.update({
            adminRegionExpr: expr
          });
        };
      })(this),
      table: this.props.design.table,
      types: ["id"],
      idTable: "admin_regions",
      value: this.props.design.adminRegionExpr
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderScopeAndDetailLevel = function() {
    return R(AdminScopeAndDetailLevelComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      scope: this.props.design.scope,
      scopeLevel: this.props.design.scopeLevel || 0,
      detailLevel: this.props.design.detailLevel,
      onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
    });
  };

  AdminChoroplethLayerDesigner.prototype.renderDisplayNames = function() {
    return H.div({
      className: "form-group"
    }, H.div({
      className: "checkbox"
    }, H.label(null, H.input({
      type: "checkbox",
      checked: this.props.design.displayNames,
      onChange: (function(_this) {
        return function(ev) {
          return _this.update({
            displayNames: ev.target.checked
          });
        };
      })(this)
    }), "Display Region Names")));
  };

  AdminChoroplethLayerDesigner.prototype.renderColor = function() {
    var exprCompiler, filters, jsonql;
    if (!this.props.design.table) {
      return;
    }
    filters = _.clone(this.props.filters) || [];
    if (this.props.design.filter != null) {
      exprCompiler = new ExprCompiler(this.props.schema);
      jsonql = exprCompiler.compileExpr({
        expr: this.props.design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        filters.push({
          table: this.props.design.filter.table,
          jsonql: jsonql
        });
      }
    }
    return H.div(null, !this.props.design.axes.color ? H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Fill Color"), H.div(null, R(ColorComponent, {
      color: this.props.design.color,
      onChange: this.handleColorChange
    }))) : void 0, H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon glyphicon-tint"
    }), "Color By Data"), R(AxisComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      types: ["text", "enum", "boolean", 'date'],
      aggrNeed: "required",
      value: this.props.design.axes.color,
      defaultColor: this.props.design.color,
      showColorMap: true,
      onChange: this.handleColorAxisChange,
      allowExcludedValues: true,
      filters: filters
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderFillOpacity = function() {
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, "Fill Opacity (%)"), ": ", R(Rcslider, {
      min: 0,
      max: 100,
      step: 1,
      tipTransitionName: "rc-slider-tooltip-zoom-down",
      value: this.props.design.fillOpacity * 100,
      onChange: (function(_this) {
        return function(val) {
          return _this.update({
            fillOpacity: val / 100
          });
        };
      })(this)
    }));
  };

  AdminChoroplethLayerDesigner.prototype.renderFilter = function() {
    if (!this.props.design.table) {
      return null;
    }
    return H.div({
      className: "form-group"
    }, H.label({
      className: "text-muted"
    }, H.span({
      className: "glyphicon glyphicon-filter"
    }), " Filters"), H.div({
      style: {
        marginLeft: 8
      }
    }, R(FilterExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onChange: this.handleFilterChange,
      table: this.props.design.table,
      value: this.props.design.filter
    })));
  };

  AdminChoroplethLayerDesigner.prototype.renderPopup = function() {
    if (!this.props.design.table) {
      return null;
    }
    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table
    });
  };

  AdminChoroplethLayerDesigner.prototype.render = function() {
    return H.div(null, this.renderTable(), this.renderAdminRegionExpr(), this.renderScopeAndDetailLevel(), this.renderDisplayNames(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), this.props.design.table ? R(ZoomLevelsComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange
    }) : void 0);
  };

  return AdminChoroplethLayerDesigner;

})(React.Component);
