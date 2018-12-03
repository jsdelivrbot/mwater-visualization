var ChartViewComponent, PropTypes, R, React, asyncLatest,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

asyncLatest = require('async-latest');

module.exports = ChartViewComponent = (function(superClass) {
  extend(ChartViewComponent, superClass);

  ChartViewComponent.propTypes = {
    chart: PropTypes.object.isRequired,
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    widgetDataSource: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    standardWidth: PropTypes.number,
    scope: PropTypes.any,
    filters: PropTypes.array,
    onScopeChange: PropTypes.func,
    onRowClick: PropTypes.func
  };

  function ChartViewComponent(props) {
    ChartViewComponent.__super__.constructor.call(this, props);
    this.state = {
      validDesign: null,
      data: null,
      dataLoading: false,
      dataError: null,
      cacheExpiry: props.dataSource.getCacheExpiry()
    };
    this.loadData = asyncLatest(this.loadData, {
      serial: true
    });
    this.state = {};
  }

  ChartViewComponent.prototype.componentDidMount = function() {
    return this.updateData(this.props);
  };

  ChartViewComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.design, this.props.design) || !_.isEqual(nextProps.filters, this.props.filters) || nextProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry) {
      this.setState({
        cacheExpiry: nextProps.dataSource.getCacheExpiry()
      });
      return this.updateData(nextProps);
    }
  };

  ChartViewComponent.prototype.updateData = function(props) {
    var design, errors;
    design = props.chart.cleanDesign(props.design, props.schema);
    errors = props.chart.validateDesign(design, props.schema);
    if (errors) {
      return;
    }
    this.setState({
      dataLoading: true
    });
    return this.loadData(props, (function(_this) {
      return function(error, data) {
        return _this.setState({
          dataLoading: false,
          dataError: error,
          data: data,
          validDesign: design
        });
      };
    })(this));
  };

  ChartViewComponent.prototype.loadData = function(props, callback) {
    return props.widgetDataSource.getData(props.design, props.filters, callback);
  };

  ChartViewComponent.prototype.renderSpinner = function() {
    return R('div', {
      style: {
        position: "absolute",
        bottom: "50%",
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 20
      }
    }, R('i', {
      className: "fa fa-spinner fa-spin"
    }));
  };

  ChartViewComponent.prototype.render = function() {
    var style;
    style = {
      width: this.props.width,
      height: this.props.height
    };
    if (this.state.dataLoading) {
      style.opacity = 0.5;
    }
    if (!this.state.validDesign) {
      style.backgroundColor = "#E0E0E0";
      style.opacity = 0.35;
      if (!this.props.height && this.props.width) {
        style.height = this.props.width / 1.6;
      }
    }
    if (this.state.dataError) {
      return R('div', {
        className: "alert alert-danger"
      }, "Error loading data: " + (this.state.dataError.message || this.state.dataError));
    }
    return R('div', {
      style: style
    }, this.state.validDesign ? this.props.chart.createViewElement({
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      design: this.state.validDesign,
      onDesignChange: this.props.onDesignChange,
      data: this.state.data,
      scope: this.props.scope,
      onScopeChange: this.props.onScopeChange,
      width: this.props.width,
      height: this.props.height,
      standardWidth: this.props.standardWidth,
      onRowClick: this.props.onRowClick,
      filters: this.props.filters
    }) : void 0, this.state.dataLoading ? this.renderSpinner() : void 0);
  };

  return ChartViewComponent;

})(React.Component);
