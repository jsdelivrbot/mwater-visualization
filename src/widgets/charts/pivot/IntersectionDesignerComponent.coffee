_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

Rcslider = require 'rc-slider'
AxisComponent = require '../../../axes/AxisComponent'

# Design an intersection of a pivot table
module.exports = class IntersectionDesignerComponent extends React.Component
  @propTypes: 
    intersection: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  # Updates intersection with the specified changes
  update: (changes) ->
    intersection = _.extend({}, @props.intersection, changes)
    @props.onChange(intersection)

  handleValueAxisChange: (valueAxis) => @update(valueAxis: valueAxis)
  
  handleBackgroundColorAxisChange: (backgroundColorAxis) => 
    opacity = @props.intersection.backgroundColorOpacity or 0.3

    @update(backgroundColorAxis: backgroundColorAxis, backgroundColorOpacity: opacity)

  handleBackgroundColorOpacityChange: (newValue) =>
    @update(backgroundColorOpacity: newValue / 100)

  renderValueAxis: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Calculation"
      H.div style: { marginLeft: 8 }, 
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date", "number"]
          aggrNeed: "required"
          value: @props.intersection.valueAxis
          onChange: @handleValueAxisChange

      H.p className: "help-block",
        "This is the calculated value that is displayed. Leave as blank to make an empty section"

  renderBackgroundColorAxis: ->
    return H.div className: "form-group",
      H.label className: "text-muted", 
        "Background Color"
      H.div style: { marginLeft: 8 }, 
        R AxisComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ["enum", "text", "boolean", "date"]
          aggrNeed: "required"
          value: @props.intersection.backgroundColorAxis
          onChange: @handleBackgroundColorAxisChange
          showColorMap: true

      H.p className: "help-block",
        "This is an optional background color to set on cells that is controlled by the data"

  renderBackgroundColorOpacityControl: ->
    if not @props.intersection.backgroundColorAxis
      return

    H.div className: 'form-group', style: { paddingTop: 10 },
      H.label className: 'text-muted',
        H.span null,
          "Background Opacity: #{Math.round(@props.intersection.backgroundColorOpacity * 100) }%"
      H.div style: {padding: '10px'},
        R Rcslider,
          min: 0
          max: 100
          step: 1
          tipTransitionName: "rc-slider-tooltip-zoom-down",
          value: @props.intersection.backgroundColorOpacity * 100,
          onChange: @handleBackgroundColorOpacityChange

  render: ->
    H.div null,
      @renderValueAxis()
      @renderBackgroundColorAxis()
      @renderBackgroundColorOpacityControl()

