var AdminChoroplethLayer, AxisBuilder, ExprCleaner, ExprCompiler, ExprUtils, H, Layer, LayerLegendComponent, LegendGroup, PopupFilterJoinsUtils, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

Layer = require('./Layer');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');

LayerLegendComponent = require('./LayerLegendComponent');

PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');


/*
Layer that is composed of administrative regions colored
Design is:
  scope: _id of overall admin region. Null for whole world.
  scopeLevel: admin level of scope. Default is 0 (entire country) if scope is set
  detailLevel: admin level to disaggregate to

  table: table to get data from
  adminRegionExpr: expression to get admin region id for calculations

  axes: axes (see below)

  filter: optional logical expression to filter by
  color: default color (e.g. #FF8800). Color axis overrides
  fillOpacity: opacity of fill of regions (0-1)

  displayNames: true to display name labels on admin regions

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the region is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

axes:
  color: color axis
  label: overrides the nameLabels to display text on each region
 */

module.exports = AdminChoroplethLayer = (function(superClass) {
  extend(AdminChoroplethLayer, superClass);

  function AdminChoroplethLayer() {
    return AdminChoroplethLayer.__super__.constructor.apply(this, arguments);
  }

  AdminChoroplethLayer.prototype.getJsonQLCss = function(design, schema, filters) {
    var layerDef;
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createJsonQL(design, schema, filters)
        }
      ],
      css: this.createCss(design, schema, filters),
      interactivity: {
        layer: "layer0",
        fields: ["id", "name"]
      }
    };
    return layerDef;
  };

  AdminChoroplethLayer.prototype.createJsonQL = function(design, schema, filters) {
    var axisBuilder, colorExpr, compiledAdminRegionExpr, exprCompiler, filter, i, innerQuery, labelExpr, len, query, ref, ref1, relevantFilters, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);

    /*
    E.g:
    select name, shape_simplified, regions.color from
    admin_regions as admin_regions2
    left outer join
    (
      select admin_regions.level2 as id,
      count(innerquery.*) as color
      from
      admin_regions inner join
      entities.water_point as innerquery
      on innerquery.admin_region = admin_regions._id
      where admin_regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
      group by 1
    ) as regions on regions.id = admin_regions2._id
    where admin_regions2.level = 2 and admin_regions2.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
     */
    if ((design.scopeLevel != null) && ((ref = design.scopeLevel) !== 0 && ref !== 1 && ref !== 2 && ref !== 3 && ref !== 4 && ref !== 5)) {
      throw new Error("Invalid scope level");
    }
    if ((ref1 = design.detailLevel) !== 0 && ref1 !== 1 && ref1 !== 2 && ref1 !== 3 && ref1 !== 4 && ref1 !== 5) {
      throw new Error("Invalid detail level");
    }
    compiledAdminRegionExpr = exprCompiler.compileExpr({
      expr: design.adminRegionExpr,
      tableAlias: "innerquery"
    });
    innerQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions",
            column: "level" + design.detailLevel
          },
          alias: "id"
        }
      ],
      from: {
        type: "join",
        kind: "inner",
        left: {
          type: "table",
          table: "admin_regions",
          alias: "admin_regions"
        },
        right: exprCompiler.compileTable(design.table, "innerquery"),
        on: {
          type: "op",
          op: "=",
          exprs: [
            compiledAdminRegionExpr, {
              type: "field",
              tableAlias: "admin_regions",
              column: "_id"
            }
          ]
        }
      },
      groupBy: [1]
    };
    if (design.axes.color) {
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "innerquery"
      });
      innerQuery.selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
    }
    if (design.axes.label) {
      labelExpr = axisBuilder.compileAxis({
        axis: design.axes.label,
        tableAlias: "innerquery"
      });
      innerQuery.selects.push({
        type: "select",
        expr: labelExpr,
        alias: "label"
      });
    }
    whereClauses = [];
    if (design.scope) {
      whereClauses.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions",
            column: "level" + (design.scopeLevel || 0)
          }, design.scope
        ]
      });
    }
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (i = 0, len = relevantFilters.length; i < len; i++) {
      filter = relevantFilters[i];
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 0) {
      innerQuery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    }
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions2",
            column: "_id"
          },
          alias: "id"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions2",
            column: "shape_simplified"
          },
          alias: "the_geom_webmercator"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions2",
            column: "name"
          },
          alias: "name"
        }
      ],
      from: {
        type: "join",
        kind: "left",
        left: {
          type: "table",
          table: "admin_regions",
          alias: "admin_regions2"
        },
        right: {
          type: "subquery",
          query: innerQuery,
          alias: "regions"
        },
        on: {
          type: "op",
          op: "=",
          exprs: [
            {
              type: "field",
              tableAlias: "regions",
              column: "id"
            }, {
              type: "field",
              tableAlias: "admin_regions2",
              column: "_id"
            }
          ]
        }
      },
      where: {
        type: "op",
        op: "and",
        exprs: [
          {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_regions2",
                column: "level"
              }, design.detailLevel
            ]
          }
        ]
      }
    };
    if (design.scope) {
      query.where.exprs.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions2",
            column: "level" + (design.scopeLevel || 0)
          }, design.scope
        ]
      });
    }
    if (design.axes.color) {
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "regions",
          column: "color"
        },
        alias: "color"
      });
    }
    if (design.axes.label) {
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "regions",
          column: "label"
        },
        alias: "label"
      });
    }
    return query;
  };

  AdminChoroplethLayer.prototype.createCss = function(design, schema, filters) {
    var css, i, item, len, ref;
    css = '#layer0 {\n  line-color: #000;\n  line-width: 1.5;\n  line-opacity: 0.6;\n  polygon-opacity: ' + design.fillOpacity + ';\npolygon-fill: ' + (design.color || "transparent") + ';\nopacity: ' + design.fillOpacity + '; \n}\n';
    if (design.displayNames) {
      css += '#layer0::labels {\n  text-name: [name];\n  text-face-name: \'Arial Regular\';\n  text-halo-radius: 2;\n  text-halo-opacity: 0.5;\n  text-halo-fill: #FFF;\n}';
    }
    if (design.axes.color && design.axes.color.colorMap) {
      ref = design.axes.color.colorMap;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (_.includes(design.axes.color.excludedValues, item.value)) {
          css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { line-color: transparent; polygon-opacity: 0; polygon-fill: transparent; }\n";
          if (design.displayNames) {
            css += "#layer0::labels [color=" + (JSON.stringify(item.value)) + "] { text-opacity: 0; text-halo-opacity: 0; }\n";
          }
        } else {
          css += "#layer0 [color=" + (JSON.stringify(item.value)) + "] { polygon-fill: " + item.color + "; }\n";
        }
      }
    }
    return css;
  };

  AdminChoroplethLayer.prototype.onGridClick = function(ev, clickOptions) {
    var BlocksLayoutManager, WidgetFactory, compiledFilterExpr, defaultPopupFilterJoins, exprCompiler, filter, filterExpr, popupFilterJoins, popupFilters, results, table;
    if (ev.data && ev.data.id) {
      results = {};
      table = clickOptions.design.table;
      exprCompiler = new ExprCompiler(clickOptions.schema);
      filterExpr = {
        type: "op",
        op: "within",
        table: table,
        exprs: [
          clickOptions.design.adminRegionExpr, {
            type: "literal",
            idTable: "admin_regions",
            valueType: "id",
            value: ev.data.id
          }
        ]
      };
      compiledFilterExpr = exprCompiler.compileExpr({
        expr: filterExpr,
        tableAlias: "{alias}"
      });
      filter = {
        table: table,
        jsonql: compiledFilterExpr
      };
      if (ev.event.originalEvent.shiftKey) {
        if (clickOptions.scopeData === ev.data.id) {
          results.scope = null;
        } else {
          results.scope = {
            name: ev.data.name,
            filter: filter,
            data: ev.data.id
          };
        }
      } else if (clickOptions.design.popup) {
        defaultPopupFilterJoins = {};
        if (clickOptions.design.adminRegionExpr) {
          defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr;
        }
        popupFilterJoins = clickOptions.design.popupFilterJoins || defaultPopupFilterJoins;
        popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true);
        popupFilters.push({
          table: "admin_regions",
          jsonql: {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "{alias}",
                column: "_id"
              }, {
                type: "literal",
                value: ev.data.id
              }
            ]
          }
        });
        BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
        WidgetFactory = require('../widgets/WidgetFactory');
        results.popup = new BlocksLayoutManager().renderLayout({
          items: clickOptions.design.popup.items,
          style: "popup",
          renderWidget: (function(_this) {
            return function(options) {
              var filters, widget, widgetDataSource;
              widget = WidgetFactory.createWidget(options.type);
              filters = clickOptions.filters.concat(popupFilters);
              widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);
              return widget.createViewElement({
                schema: clickOptions.schema,
                dataSource: clickOptions.dataSource,
                widgetDataSource: widgetDataSource,
                design: options.design,
                scope: null,
                filters: filters,
                onScopeChange: null,
                onDesignChange: null,
                width: options.width,
                height: options.height,
                standardWidth: options.standardWidth
              });
            };
          })(this)
        });
      }
      return results;
    } else {
      return null;
    }
  };

  AdminChoroplethLayer.prototype.getBounds = function(design, schema, dataSource, filters, callback) {
    if (!design.scope) {
      return callback(null);
    }
    filters = [
      {
        table: "admin_regions",
        jsonql: {
          type: "op",
          op: "=",
          exprs: [
            {
              type: "field",
              tableAlias: "{alias}",
              column: "_id"
            }, design.scope
          ]
        }
      }
    ];
    return this.getBoundsFromExpr(schema, dataSource, "admin_regions", {
      type: "field",
      table: "admin_regions",
      column: "shape"
    }, null, filters, callback);
  };

  AdminChoroplethLayer.prototype.getMinZoom = function(design) {
    return design.minZoom;
  };

  AdminChoroplethLayer.prototype.getMaxZoom = function(design) {
    return design.maxZoom;
  };

  AdminChoroplethLayer.prototype.getLegend = function(design, schema, name, dataSource, filters) {
    var _filters, axisBuilder, exprCompiler, jsonql;
    if (filters == null) {
      filters = [];
    }
    _filters = filters.slice();
    if (design.filter != null) {
      exprCompiler = new ExprCompiler(schema);
      jsonql = exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "{alias}"
      });
      if (jsonql) {
        _filters.push({
          table: design.filter.table,
          jsonql: jsonql
        });
      }
    }
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    return React.createElement(LayerLegendComponent, {
      schema: schema,
      name: name,
      dataSource: dataSource,
      filters: _.compact(_filters),
      axis: axisBuilder.cleanAxis({
        axis: design.axes.color,
        table: design.table,
        types: ['enum', 'text', 'boolean', 'date'],
        aggrNeed: "required"
      }),
      defaultColor: design.color
    });
  };

  AdminChoroplethLayer.prototype.getFilterableTables = function(design, schema) {
    if (design.table) {
      return [design.table];
    } else {
      return [];
    }
  };

  AdminChoroplethLayer.prototype.isEditable = function() {
    return true;
  };

  AdminChoroplethLayer.prototype.cleanDesign = function(design, schema) {
    var axisBuilder, exprCleaner;
    exprCleaner = new ExprCleaner(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    design = _.cloneDeep(design);
    design.color = design.color || "#FFFFFF";
    design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, {
      table: design.table,
      types: ["id"],
      idTable: "admin_regions"
    });
    design.axes = design.axes || {};
    design.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.75;
    design.displayNames = design.displayNames != null ? design.displayNames : true;
    design.axes.color = axisBuilder.cleanAxis({
      axis: design.axes.color,
      table: design.table,
      types: ['enum', 'text', 'boolean', 'date'],
      aggrNeed: "required"
    });
    design.axes.label = axisBuilder.cleanAxis({
      axis: design.axes.label,
      table: design.table,
      types: ['text', 'number'],
      aggrNeed: "required"
    });
    design.filter = exprCleaner.cleanExpr(design.filter, {
      table: design.table
    });
    if (design.detailLevel == null) {
      design.detailLevel = 0;
    }
    return design;
  };

  AdminChoroplethLayer.prototype.validateDesign = function(design, schema) {
    var axisBuilder, error, exprUtils;
    exprUtils = new ExprUtils(schema);
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    if (!design.table) {
      return "Missing table";
    }
    if (design.detailLevel == null) {
      return "Missing detail level";
    }
    if (!design.adminRegionExpr || exprUtils.getExprType(design.adminRegionExpr) !== "id") {
      return "Missing admin region expr";
    }
    if (design.axes.color) {
      error = axisBuilder.validateAxis({
        axis: design.axes.color
      });
      if (error) {
        return error;
      }
    }
    if (design.axes.label) {
      error = axisBuilder.validateAxis({
        axis: design.axes.label
      });
      if (error) {
        return error;
      }
    }
    return null;
  };

  AdminChoroplethLayer.prototype.createDesignerElement = function(options) {
    var AdminChoroplethLayerDesigner;
    AdminChoroplethLayerDesigner = require('./AdminChoroplethLayerDesigner');
    return React.createElement(AdminChoroplethLayerDesigner, {
      schema: options.schema,
      dataSource: options.dataSource,
      design: this.cleanDesign(options.design, options.schema),
      filters: options.filters,
      onDesignChange: (function(_this) {
        return function(design) {
          return options.onDesignChange(_this.cleanDesign(design, options.schema));
        };
      })(this)
    });
  };

  AdminChoroplethLayer.prototype.createKMLExportJsonQL = function(design, schema, filters) {
    var adminGeometry, axisBuilder, colorExpr, compiledAdminRegionExpr, exprCompiler, filter, i, innerQuery, labelExpr, len, query, ref, ref1, relevantFilters, valueExpr, whereClauses;
    axisBuilder = new AxisBuilder({
      schema: schema
    });
    exprCompiler = new ExprCompiler(schema);
    if ((design.scopeLevel != null) && ((ref = design.scopeLevel) !== 0 && ref !== 1 && ref !== 2 && ref !== 3 && ref !== 4 && ref !== 5)) {
      throw new Error("Invalid scope level");
    }
    if ((ref1 = design.detailLevel) !== 0 && ref1 !== 1 && ref1 !== 2 && ref1 !== 3 && ref1 !== 4 && ref1 !== 5) {
      throw new Error("Invalid detail level");
    }
    compiledAdminRegionExpr = exprCompiler.compileExpr({
      expr: design.adminRegionExpr,
      tableAlias: "innerquery"
    });
    innerQuery = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions",
            column: "level" + design.detailLevel
          },
          alias: "id"
        }
      ],
      from: {
        type: "join",
        kind: "inner",
        left: {
          type: "table",
          table: "admin_regions",
          alias: "admin_regions"
        },
        right: exprCompiler.compileTable(design.table, "innerquery"),
        on: {
          type: "op",
          op: "=",
          exprs: [
            compiledAdminRegionExpr, {
              type: "field",
              tableAlias: "admin_regions",
              column: "_id"
            }
          ]
        }
      },
      groupBy: [1]
    };
    if (design.axes.color) {
      valueExpr = exprCompiler.compileExpr({
        expr: design.axes.color.expr,
        tableAlias: "innerquery"
      });
      colorExpr = axisBuilder.compileAxis({
        axis: design.axes.color,
        tableAlias: "innerquery"
      });
      innerQuery.selects.push({
        type: "select",
        expr: colorExpr,
        alias: "color"
      });
      innerQuery.selects.push({
        type: "select",
        expr: valueExpr,
        alias: "value"
      });
    }
    if (design.axes.label) {
      labelExpr = axisBuilder.compileAxis({
        axis: design.axes.label,
        tableAlias: "innerquery"
      });
      innerQuery.selects.push({
        type: "select",
        expr: labelExpr,
        alias: "label"
      });
    }
    whereClauses = [];
    if (design.scope) {
      whereClauses.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions",
            column: "level" + (design.scopeLevel || 0)
          }, design.scope
        ]
      });
    }
    if (design.filter) {
      whereClauses.push(exprCompiler.compileExpr({
        expr: design.filter,
        tableAlias: "innerquery"
      }));
    }
    relevantFilters = _.where(filters, {
      table: design.table
    });
    for (i = 0, len = relevantFilters.length; i < len; i++) {
      filter = relevantFilters[i];
      whereClauses.push(injectTableAlias(filter.jsonql, "innerquery"));
    }
    whereClauses = _.compact(whereClauses);
    if (whereClauses.length > 0) {
      innerQuery.where = {
        type: "op",
        op: "and",
        exprs: whereClauses
      };
    }
    adminGeometry = {
      type: "op",
      op: "ST_AsGeoJson",
      exprs: [
        {
          type: "op",
          op: "ST_Transform",
          exprs: [
            {
              type: "field",
              tableAlias: "admin_regions2",
              column: "shape_simplified"
            }, 4326
          ]
        }
      ]
    };
    query = {
      type: "query",
      selects: [
        {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions2",
            column: "_id"
          },
          alias: "id"
        }, {
          type: "select",
          expr: adminGeometry,
          alias: "the_geom_webmercator"
        }, {
          type: "select",
          expr: {
            type: "field",
            tableAlias: "admin_regions2",
            column: "name"
          },
          alias: "name"
        }
      ],
      from: {
        type: "join",
        kind: "left",
        left: {
          type: "table",
          table: "admin_regions",
          alias: "admin_regions2"
        },
        right: {
          type: "subquery",
          query: innerQuery,
          alias: "regions"
        },
        on: {
          type: "op",
          op: "=",
          exprs: [
            {
              type: "field",
              tableAlias: "regions",
              column: "id"
            }, {
              type: "field",
              tableAlias: "admin_regions2",
              column: "_id"
            }
          ]
        }
      },
      where: {
        type: "op",
        op: "and",
        exprs: [
          {
            type: "op",
            op: "=",
            exprs: [
              {
                type: "field",
                tableAlias: "admin_regions2",
                column: "level"
              }, design.detailLevel
            ]
          }
        ]
      }
    };
    if (design.scope) {
      query.where.exprs.push({
        type: "op",
        op: "=",
        exprs: [
          {
            type: "field",
            tableAlias: "admin_regions2",
            column: "level" + (design.scopeLevel || 0)
          }, design.scope
        ]
      });
    }
    if (design.axes.color) {
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "regions",
          column: "color"
        },
        alias: "color"
      });
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "regions",
          column: "value"
        },
        alias: "value"
      });
    }
    if (design.axes.label) {
      query.selects.push({
        type: "select",
        expr: {
          type: "field",
          tableAlias: "regions",
          column: "label"
        },
        alias: "label"
      });
    }
    return query;
  };

  AdminChoroplethLayer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    var layerDef, style;
    style = {
      color: design.color,
      opacity: design.fillOpacity
    };
    if (design.axes.color && design.axes.color.colorMap) {
      style.colorMap = design.axes.color.colorMap;
    }
    layerDef = {
      layers: [
        {
          id: "layer0",
          jsonql: this.createKMLExportJsonQL(design, schema, filters),
          style: style
        }
      ]
    };
    return layerDef;
  };

  AdminChoroplethLayer.prototype.acceptKmlVisitorForRow = function(visitor, row) {
    var data, list, outer;
    if (!row.the_geom_webmercator) {
      return;
    }
    if (row.the_geom_webmercator.length === 0) {
      return;
    }
    data = JSON.parse(row.the_geom_webmercator);
    if (data.coordinates.length === 0) {
      return;
    }
    if (data.type === "MultiPolygon") {
      outer = data.coordinates[0][0];
    } else {
      outer = data.coordinates[0];
    }
    list = _.map(outer, function(coordinates) {
      return coordinates.join(",");
    });
    return visitor.addPolygon(list.join(" "), row.color, data.type === "MultiPolygon", row.name, visitor.buildDescription(row));
  };

  return AdminChoroplethLayer;

})(Layer);
