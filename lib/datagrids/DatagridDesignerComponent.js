var ColumnDesignerComponent, ColumnsDesignerComponent, DatagridDesignerComponent, ExprComponent, ExprUtils, FilterExprComponent, H, R, React, ReactReorderable, TabbedComponent, TableSelectComponent, _, update, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

TableSelectComponent = require('mwater-visualization').TableSelectComponent;

TabbedComponent = require('react-library/lib/TabbedComponent');

ExprComponent = require('mwater-expressions-ui').ExprComponent;

FilterExprComponent = require('mwater-expressions-ui').FilterExprComponent;

ReactReorderable = require('react-reorderable');

uuid = require('node-uuid');

update = require('update-object');

module.exports = DatagridDesignerComponent = (function(superClass) {
  extend(DatagridDesignerComponent, superClass);

  function DatagridDesignerComponent() {
    this.handleFilterChange = bind(this.handleFilterChange, this);
    this.handleColumnsChange = bind(this.handleColumnsChange, this);
    this.handleTableChange = bind(this.handleTableChange, this);
    return DatagridDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  DatagridDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func.isRequired
  };

  DatagridDesignerComponent.prototype.handleTableChange = function(table) {
    var col, columns, design, i, len, ref;
    columns = [];
    ref = this.props.schema.getColumns(table);
    for (i = 0, len = ref.length; i < len; i++) {
      col = ref[i];
      if (col.type === "join") {
        continue;
      }
      columns.push({
        id: uuid.v4(),
        type: "expr",
        width: 150,
        expr: {
          type: "field",
          table: table,
          column: col.id
        },
        label: null
      });
    }
    design = {
      table: table,
      columns: columns
    };
    return this.props.onDesignChange(design);
  };

  DatagridDesignerComponent.prototype.handleColumnsChange = function(columns) {
    return this.props.onDesignChange(update(this.props.design, {
      columns: {
        $set: columns
      }
    }));
  };

  DatagridDesignerComponent.prototype.handleFilterChange = function(filter) {
    return this.props.onDesignChange(update(this.props.design, {
      filter: {
        $set: filter
      }
    }));
  };

  DatagridDesignerComponent.prototype.renderTabs = function() {
    return R(TabbedComponent, {
      initialTabId: "columns",
      tabs: [
        {
          id: "columns",
          label: "Columns",
          elem: R(ColumnsDesignerComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            columns: this.props.design.columns,
            onColumnsChange: this.handleColumnsChange
          })
        }, {
          id: "filter",
          label: "Filter",
          elem: R(FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            value: this.props.design.filter,
            onChange: this.handleFilterChange
          })
        }
      ]
    });
  };

  DatagridDesignerComponent.prototype.render = function() {
    return H.div(null, H.label(null, "Data Source:"), R(TableSelectComponent, {
      schema: this.props.schema,
      value: this.props.design.table,
      onChange: this.handleTableChange
    }), this.props.design.table ? this.renderTabs() : void 0);
  };

  return DatagridDesignerComponent;

})(React.Component);

ColumnsDesignerComponent = (function(superClass) {
  extend(ColumnsDesignerComponent, superClass);

  function ColumnsDesignerComponent() {
    this.handleReorder = bind(this.handleReorder, this);
    this.handleAddColumn = bind(this.handleAddColumn, this);
    this.handleColumnChange = bind(this.handleColumnChange, this);
    return ColumnsDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ColumnsDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    columns: React.PropTypes.array.isRequired,
    onColumnsChange: React.PropTypes.func.isRequired
  };

  ColumnsDesignerComponent.prototype.handleColumnChange = function(columnIndex, column) {
    var columns;
    columns = this.props.columns.slice();
    if (!column) {
      columns.splice(columnIndex, 1);
    } else {
      columns[columnIndex] = column;
    }
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.handleAddColumn = function() {
    var columns;
    columns = this.props.columns.slice();
    columns.push({
      id: uuid.v4(),
      type: "expr",
      width: 150
    });
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.handleReorder = function(elems) {
    var columns;
    columns = _.map(elems, function(e) {
      return e.props.column;
    });
    return this.props.onColumnsChange(columns);
  };

  ColumnsDesignerComponent.prototype.render = function() {
    return H.div({
      style: {
        height: 800,
        overflowY: "auto",
        overflowX: "hidden"
      }
    }, R(ReactReorderable, {
      onDrop: this.handleReorder,
      handle: ".drag-handle"
    }, _.map(this.props.columns, (function(_this) {
      return function(column, columnIndex) {
        return R(ColumnDesignerComponent, {
          key: columnIndex,
          schema: _this.props.schema,
          table: _this.props.table,
          dataSource: _this.props.dataSource,
          column: column,
          onColumnChange: _this.handleColumnChange.bind(null, columnIndex)
        });
      };
    })(this))), H.button({
      type: "button",
      className: "btn btn-default",
      onClick: this.handleAddColumn
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Column"));
  };

  return ColumnsDesignerComponent;

})(React.Component);

ColumnDesignerComponent = (function(superClass) {
  extend(ColumnDesignerComponent, superClass);

  function ColumnDesignerComponent() {
    this.render = bind(this.render, this);
    this.handleLabelChange = bind(this.handleLabelChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return ColumnDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  ColumnDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    column: React.PropTypes.object.isRequired,
    onColumnChange: React.PropTypes.func.isRequired
  };

  ColumnDesignerComponent.prototype.handleExprChange = function(expr) {
    return this.props.onColumnChange(update(this.props.column, {
      expr: {
        $set: expr
      }
    }));
  };

  ColumnDesignerComponent.prototype.handleLabelChange = function(label) {
    return this.props.onColumnChange(update(this.props.column, {
      label: {
        $set: label
      }
    }));
  };

  ColumnDesignerComponent.prototype.render = function() {
    var exprUtils;
    exprUtils = new ExprUtils(this.props.schema);
    return H.div({
      className: "row"
    }, H.div({
      className: "col-xs-1"
    }, H.span({
      className: "text-muted glyphicon glyphicon-move drag-handle"
    })), H.div({
      className: "col-xs-5"
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      value: this.props.column.expr,
      onChange: this.handleExprChange
    })), H.div({
      className: "col-xs-5"
    }, H.input({
      type: "text",
      className: "form-control",
      placeholder: exprUtils.summarizeExpr(this.props.column.expr),
      value: this.props.column.label,
      onChange: (function(_this) {
        return function(ev) {
          return _this.handleLabelChange(ev.target.value);
        };
      })(this)
    })), H.div({
      className: "col-xs-1"
    }, H.a({
      onClick: this.props.onColumnChange.bind(null, null)
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))));
  };

  return ColumnDesignerComponent;

})(React.Component);