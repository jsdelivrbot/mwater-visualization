var BlankTabComponent, ConsoleComponent, DashboardComponent, H, PropTypes, R, React, _, uuid,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

uuid = require('uuid');

DashboardComponent = require('../dashboards/DashboardComponent');

module.exports = ConsoleComponent = (function(superClass) {
  extend(ConsoleComponent, superClass);

  ConsoleComponent.propTypes = {
    design: PropTypes.object.isRequired,
    onDesignChange: PropTypes.func,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    consoleDataSource: PropTypes.object.isRequired,
    onRowClick: PropTypes.func,
    namedStrings: PropTypes.object
  };

  function ConsoleComponent(props) {
    this.renderTab = bind(this.renderTab, this);
    this.handleTabAppend = bind(this.handleTabAppend, this);
    this.handleTabChange = bind(this.handleTabChange, this);
    this.handleTabDesignChange = bind(this.handleTabDesignChange, this);
    this.handleTabRemove = bind(this.handleTabRemove, this);
    this.handleTabClick = bind(this.handleTabClick, this);
    this.handleAddTab = bind(this.handleAddTab, this);
    ConsoleComponent.__super__.constructor.call(this, props);
    this.state = {
      tabId: null
    };
  }

  ConsoleComponent.prototype.componentWillMount = function() {
    if (this.props.design.tabs[0]) {
      return this.setState({
        tabId: this.props.design.tabs[0].id
      });
    }
  };

  ConsoleComponent.prototype.componentWillReceiveProps = function(nextProps) {};

  ConsoleComponent.prototype.handleAddTab = function() {
    var tabs;
    tabs = this.props.design.tabs.concat([
      {
        id: uuid(),
        type: "blank",
        name: "New Tab"
      }
    ]);
    this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
    return this.setState({
      tabId: _.last(tabs).id
    });
  };

  ConsoleComponent.prototype.handleTabClick = function(tab) {
    return this.setState({
      tabId: tab.id
    });
  };

  ConsoleComponent.prototype.handleTabRemove = function(tab, ev) {
    var selectedTab, tabIndex, tabs;
    ev.stopPropagation();
    if (!confirm("Permanently delete tab?")) {
      return;
    }
    tabIndex = _.indexOf(this.props.design.tabs, tab);
    tabs = _.without(this.props.design.tabs, tab);
    if (tabs.length === 0) {
      tabs.push({
        id: uuid(),
        type: "blank",
        name: "New Tab"
      });
    }
    this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
    selectedTab = tabs[tabIndex] || tabs[tabIndex - 1];
    return this.setState({
      tabId: selectedTab.id
    });
  };

  ConsoleComponent.prototype.handleTabDesignChange = function(tab, design) {
    var tabIndex, tabs;
    tabIndex = _.indexOf(this.props.design.tabs, tab);
    tabs = this.props.design.tabs.slice();
    tabs[tabIndex] = _.extend({}, tab, {
      design: design
    });
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  ConsoleComponent.prototype.handleTabChange = function(tab, newTab) {
    var tabIndex, tabs;
    tabIndex = _.indexOf(this.props.design.tabs, tab);
    tabs = this.props.design.tabs.slice();
    tabs[tabIndex] = newTab;
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  ConsoleComponent.prototype.handleTabAppend = function(tab, newTab) {
    var tabIndex, tabs;
    tabIndex = _.indexOf(this.props.design.tabs, tab);
    tabs = this.props.design.tabs.slice();
    tabs.splice(tabIndex + 1, 0, newTab);
    return this.props.onDesignChange(_.extend({}, this.props.design, {
      tabs: tabs
    }));
  };

  ConsoleComponent.prototype.renderTab = function(tab) {
    return H.li({
      key: tab.id,
      className: (this.state.tabId === tab.id ? "active" : void 0)
    }, H.a({
      onClick: this.handleTabClick.bind(null, tab),
      style: {
        cursor: "pointer"
      }
    }, tab.name, this.props.design.tabs.length > 1 || tab.type !== "blank" ? H.button({
      type: "button",
      className: "btn btn-xs btn-link",
      onClick: this.handleTabRemove.bind(null, tab)
    }, H.span({
      className: "fa fa-times"
    })) : void 0));
  };

  ConsoleComponent.prototype.renderTabs = function() {
    return H.ul({
      key: "tabs",
      className: "nav nav-tabs",
      style: {
        marginBottom: 10,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0
      }
    }, _.map(this.props.design.tabs, this.renderTab), H.li({
      key: "_add"
    }, H.a({
      onClick: this.handleAddTab
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }))));
  };

  ConsoleComponent.prototype.renderContents = function(tab) {
    var contents;
    if (this.props.customTabRenderer) {
      contents = this.props.customTabRenderer({
        tab: tab,
        onTabChange: this.handleTabChange.bind(null, tab),
        onTabAppend: this.handleTabAppend(null, tab)
      });
      if (contents) {
        return contents;
      }
    }
    switch (tab.type) {
      case "blank":
        return R(BlankTabComponent, {
          tab: tab,
          onTabChange: this.handleTabChange.bind(null, tab)
        });
      case "dashboard":
        return R(DashboardComponent, {
          design: tab.design,
          onDesignChange: this.handleTabDesignChange.bind(null, tab),
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          dashboardDataSource: this.props.consoleDataSource.getDashboardTabDataSource(tab.id),
          onRowClick: this.props.onRowClick,
          namedStrings: this.props.namedStrings
        });
      case "test":
        return H.div(null, "TEST");
      default:
        throw new Error("Unsupported tab type " + tab.type);
    }
  };

  ConsoleComponent.prototype.render = function() {
    var currentTab;
    currentTab = _.findWhere(this.props.design.tabs, {
      id: this.state.tabId
    });
    return H.div({
      style: {
        height: "100%",
        paddingTop: 45,
        position: "relative"
      }
    }, this.renderTabs(), currentTab ? this.renderContents(currentTab) : void 0);
  };

  return ConsoleComponent;

})(React.Component);

BlankTabComponent = (function(superClass) {
  extend(BlankTabComponent, superClass);

  function BlankTabComponent() {
    return BlankTabComponent.__super__.constructor.apply(this, arguments);
  }

  BlankTabComponent.prototype.render = function() {
    return H.div(null, H.a({
      onClick: ((function(_this) {
        return function() {
          return _this.props.onTabChange({
            id: _this.props.tab.id,
            name: "New Dashboard",
            type: "dashboard",
            design: {
              items: {
                id: "root",
                type: "root",
                blocks: []
              },
              layout: "blocks"
            }
          });
        };
      })(this))
    }, "New Dashboard"));
  };

  return BlankTabComponent;

})(React.Component);