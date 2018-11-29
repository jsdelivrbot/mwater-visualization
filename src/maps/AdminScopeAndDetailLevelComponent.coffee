PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

RegionSelectComponent = require './RegionSelectComponent'
DetailLevelSelectComponent = require './DetailLevelSelectComponent'
ReactSelect = require 'react-select'

# Scope and detail level setter for AdminChoropleth layers when using admin_regions
module.exports = class AdminScopeAndDetailLevelComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    scope: PropTypes.string     # admin region that is outside bounds. null for whole world
    scopeLevel: PropTypes.number # level of scope region. null for whole world
    detailLevel: PropTypes.number # Detail level within scope region
    onScopeAndDetailLevelChange: PropTypes.func.isRequired # Called with (scope, scopeLevel, detailLevel)

  handleScopeChange: (scope, scopeLevel) =>
    if scope
      # Detail level will be set by DetailLevelSelectComponent
      @props.onScopeAndDetailLevelChange(scope, scopeLevel, null)
    else
      @props.onScopeAndDetailLevelChange(null, null, 0)

  handleDetailLevelChange: (detailLevel) =>
    @props.onScopeAndDetailLevelChange(@props.scope, @props.scopeLevel, detailLevel)

  render: ->
    H.div null,
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Region to Map"
        R RegionSelectComponent, region: @props.scope, onChange: @handleScopeChange, schema: @props.schema, dataSource: @props.dataSource
      if @props.scope? and @props.detailLevel?
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Detail Level"
          R DetailLevelSelectComponent, 
            scope: @props.scope
            scopeLevel: @props.scopeLevel
            detailLevel: @props.detailLevel
            onChange: @handleDetailLevelChange
            schema: @props.schema
            dataSource: @props.dataSource
      else if not @props.scope? and @props.detailLevel?
        # Case of whole world. Allow selecting country or admin level 1
        H.div className: "form-group",
          H.label className: "text-muted", 
            "Detail Level"
          R ReactSelect, {
            value: @props.detailLevel
            options: [{ value: 0, label: "Countries" }, { value: 1, label: "Level 1 (State/Province/District)" }]
            clearable: false
            onChange: (value) => @handleDetailLevelChange(parseInt(value))
          }


