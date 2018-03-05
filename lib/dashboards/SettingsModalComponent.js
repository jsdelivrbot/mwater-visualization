var ActionCancelModalComponent, DashboardUtils, FiltersDesignerComponent, H, PropTypes, QuickfiltersDesignComponent, R, React, ReactSelect, SettingsModalComponent, _, languages, ui, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

update = require('update-object');

languages = require('languages');

ui = require('react-library/lib/bootstrap');

ReactSelect = require('react-select');

DashboardUtils = require('./DashboardUtils');

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent');

QuickfiltersDesignComponent = require('../quickfilter/QuickfiltersDesignComponent');

FiltersDesignerComponent = require('../FiltersDesignerComponent');

module.exports = SettingsModalComponent = (function(superClass) {
  extend(SettingsModalComponent, superClass);

  SettingsModalComponent.propTypes = {
    onDesignChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired
  };

  SettingsModalComponent.contextTypes = {
    globalFiltersElementFactory: PropTypes.func
  };

  function SettingsModalComponent(props) {
    this.handleGlobalFiltersChange = bind(this.handleGlobalFiltersChange, this);
    this.handleFiltersChange = bind(this.handleFiltersChange, this);
    this.handleDesignChange = bind(this.handleDesignChange, this);
    this.handleCancel = bind(this.handleCancel, this);
    this.handleSave = bind(this.handleSave, this);
    SettingsModalComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      design: null
    };
  }

  SettingsModalComponent.prototype.show = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleSave = function() {
    this.props.onDesignChange(this.state.design);
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleCancel = function() {
    return this.setState({
      design: null
    });
  };

  SettingsModalComponent.prototype.handleDesignChange = function(design) {
    return this.setState({
      design: design
    });
  };

  SettingsModalComponent.prototype.handleFiltersChange = function(filters) {
    var design;
    design = _.extend({}, this.state.design, {
      filters: filters
    });
    return this.handleDesignChange(design);
  };

  SettingsModalComponent.prototype.handleGlobalFiltersChange = function(globalFilters) {
    var design;
    design = _.extend({}, this.state.design, {
      globalFilters: globalFilters
    });
    return this.handleDesignChange(design);
  };

  SettingsModalComponent.prototype.render = function() {
    var filterableTables, localeOptions;
    if (!this.state.design) {
      return null;
    }
    filterableTables = DashboardUtils.getFilterableTables(this.state.design, this.props.schema);
    localeOptions = _.map(languages.getAllLanguageCode(), (function(_this) {
      return function(code) {
        return {
          value: code,
          label: languages.getLanguageInfo(code).name + " (" + languages.getLanguageInfo(code).nativeName + ")"
        };
      };
    })(this));
    return R(ActionCancelModalComponent, {
      size: "large",
      onCancel: this.handleCancel,
      onAction: this.handleSave
    }, H.div({
      style: {
        paddingBottom: 200
      }
    }, H.h4(null, "Quick Filters"), H.div({
      className: "text-muted"
    }, "Quick filters are shown to the user as a dropdown at the top of the dashboard and can be used to filter data of widgets."), filterableTables.length > 0 ? R(QuickfiltersDesignComponent, {
      design: this.state.design.quickfilters,
      onDesignChange: (function(_this) {
        return function(design) {
          return _this.handleDesignChange(update(_this.state.design, {
            quickfilters: {
              $set: design
            }
          }));
        };
      })(this),
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      tables: filterableTables
    }) : "Nothing to quickfilter. Add widgets to the dashboard", H.h4({
      style: {
        paddingTop: 10
      }
    }, "Filters"), H.div({
      className: "text-muted"
    }, "Filters are built in to the dashboard and cannot be changed by viewers of the dashboard."), filterableTables.length > 0 ? R(FiltersDesignerComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filters: this.state.design.filters,
      onFiltersChange: this.handleFiltersChange,
      filterableTables: filterableTables
    }) : "Nothing to filter. Add widgets to the dashboard", this.context.globalFiltersElementFactory ? H.div(null, H.h4({
      style: {
        paddingTop: 10
      }
    }, "Global Filters"), this.context.globalFiltersElementFactory({
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      filterableTables: filterableTables,
      globalFilters: this.state.design.globalFilters || [],
      onChange: this.handleGlobalFiltersChange
    })) : void 0, H.h4({
      style: {
        paddingTop: 10
      }
    }, "Language"), H.div({
      className: "text-muted"
    }, "Controls the preferred language of widgets and uses specified language when available"), R(ReactSelect, {
      value: this.state.design.locale || "en",
      options: localeOptions,
      clearable: false,
      onChange: (function(_this) {
        return function(value) {
          return _this.handleDesignChange(update(_this.state.design, {
            locale: {
              $set: value
            }
          }));
        };
      })(this)
    }), H.h4({
      style: {
        paddingTop: 10
      }
    }, "Advanced"), R(ui.Checkbox, {
      value: (this.state.design.implicitFiltersEnabled != null ? this.state.design.implicitFiltersEnabled : true),
      onChange: ((function(_this) {
        return function(value) {
          return _this.handleDesignChange(update(_this.state.design, {
            implicitFiltersEnabled: {
              $set: value
            }
          }));
        };
      })(this))
    }, "Enable Implicit Filtering (leave unchecked for new dashboards)")));
  };

  return SettingsModalComponent;

})(React.Component);
