var ChartWidget, ChartWidgetComponent, H, React, Widget,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

Widget = require('./Widget');

module.exports = ChartWidget = (function(superClass) {
  extend(ChartWidget, superClass);

  function ChartWidget(chart, design, dataSource) {
    this.chart = chart;
    this.design = design;
    this.dataSource = dataSource;
  }

  ChartWidget.prototype.createViewElement = function(options) {
    return React.createElement(ChartWidgetComponent, {
      chart: this.chart,
      dataSource: this.dataSource,
      design: this.design,
      width: options.width,
      height: options.height,
      selected: options.selected,
      onSelect: options.onSelect
    });
  };

  ChartWidget.prototype.createDesignerElement = function(options) {
    return this.chart.createDesignerElement({
      design: this.design,
      onDesignChange: options.onDesignChange
    });
  };

  return ChartWidget;

})(Widget);

ChartWidgetComponent = (function(superClass) {
  extend(ChartWidgetComponent, superClass);

  ChartWidgetComponent.propTypes = {
    chart: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    design: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    connectMoveHandle: React.PropTypes.func,
    connectResizeHandle: React.PropTypes.func
  };

  function ChartWidgetComponent(props) {
    this.handleClick = bind(this.handleClick, this);
    ChartWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      data: null,
      dataQueries: null,
      dataError: null
    };
  }

  ChartWidgetComponent.prototype.componentDidMount = function() {
    return this.updateData(this.props);
  };

  ChartWidgetComponent.prototype.componentWillReceiveProps = function(nextProps) {
    return this.updateData(nextProps);
  };

  ChartWidgetComponent.prototype.updateData = function(props) {
    var queries;
    if (props.chart.validateDesign(props.design)) {
      return;
    }
    queries = props.chart.createQueries(props.design);
    if (_.isEqual(queries, this.state.dataQueries)) {
      return;
    }
    this.setState({
      data: null,
      dataQueries: null,
      dataError: null
    });
    return props.dataSource.performQueries(queries, (function(_this) {
      return function(err, data) {
        if (err) {
          return _this.setState({
            data: null,
            dataQueries: null,
            dataError: err
          });
        } else {
          return _this.setState({
            data: data,
            dataQueries: queries,
            dataError: null
          });
        }
      };
    })(this));
  };

  ChartWidgetComponent.prototype.handleClick = function(ev) {
    ev.stopPropagation();
    return this.props.onSelect();
  };

  ChartWidgetComponent.prototype.renderResizeHandle = function() {
    var resizeHandleStyle;
    resizeHandleStyle = {
      position: "absolute",
      right: 0,
      bottom: 0,
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')",
      width: 10,
      height: 10,
      cursor: "nwse-resize"
    };
    if (this.props.connectResizeHandle) {
      return this.props.connectResizeHandle(H.div({
        style: resizeHandleStyle,
        className: "widget-resize-handle"
      }));
    }
  };

  ChartWidgetComponent.prototype.renderChart = function(width, height) {
    return this.props.chart.createViewElement({
      design: this.props.design,
      data: this.state.data,
      width: width,
      height: height
    });
  };

  ChartWidgetComponent.prototype.render = function() {
    var contents, elem, results, style;
    results = this.props.chart.validateDesign(this.props.design);
    if (results) {
      contents = H.div(null, "Invalid design: ", results);
    } else if (this.state.dataError) {
      contents = H.div(null, "Error loading data: ", this.state.dataError.toString());
    } else if (!this.state.data) {
      contents = H.div(null, "Loading...");
    } else {
      contents = H.div({
        style: {
          position: "absolute",
          left: 2,
          top: 2
        }
      }, this.renderChart(this.props.width - 8, this.props.height - 8));
    }
    style = {
      width: this.props.width,
      height: this.props.height,
      borderRadius: 5
    };
    if (this.props.selected) {
      style.border = "dashed 2px #CCC";
    } else {
      style.border = "dashed 2px transparent";
    }
    elem = H.div({
      style: style,
      onClick: this.handleClick
    }, contents, this.renderResizeHandle());
    if (this.props.connectMoveHandle) {
      elem = this.props.connectMoveHandle(elem);
    }
    return elem;
  };

  return ChartWidgetComponent;

})(React.Component);