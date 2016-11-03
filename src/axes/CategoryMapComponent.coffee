_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ColorComponent = require '../ColorComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Category map for an axis. Controls the colorMap values and excludedValues
module.exports = class CategoryMapComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired   
    onChange: React.PropTypes.func.isRequired
    categories: React.PropTypes.array
    reorderable: React.PropTypes.bool
    showColorMap: React.PropTypes.bool  # True to allow editing the color map
    allowExcludedValues: React.PropTypes.bool # True to allow excluding of values via checkboxes

  handleReorder: (map) =>
    order = _.pluck(map, "value")
    @props.onChange(update(@props.axis, { drawOrder: { $set: order }}))

  handleColorChange: (value, color) =>
    # Delete if present for value
    colorMap = _.filter(@props.axis.colorMap, (item) => item.value != value)

    # Add if color present
    if color
      colorMap.push({ value: value, color: color })

    @props.onChange(update(@props.axis, { colorMap: { $set: colorMap }}))

  handleExcludeChange: (value, ev) =>
    if ev.target.checked
      excludedValues = _.difference(@props.axis.excludedValues, [value])
    else
      excludedValues = _.union(@props.axis.excludedValues, [value])

    @props.onChange(update(@props.axis, { excludedValues: { $set: excludedValues }}))

  # Gets the current color value if known
  lookupColor: (value) ->
    item = _.find(@props.axis.colorMap, (item) => item.value == value)
    if item
      return item.color
    return null

  handleNullLabelChange: (e) =>
    name = prompt("Enter label for none value", @props.axis.nullLabel or ExprUtils.localizeString("None"))
    if name
      @props.onChange(update(@props.axis, { nullLabel: { $set: name }}))

  renderLabel: (category) ->
    label = ExprUtils.localizeString(category.label)

    if category.value
      label
    else
      H.a onClick: @handleNullLabelChange, style: {cursor: 'pointer'},
        label
        H.span style: {fontSize: 12, marginLeft: 4}, "(click to change label for none value)"

  # Category is { value: category value, label: category label }
  renderCategory: (category, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    labelStyle =
      verticalAlign: 'middle'
      marginLeft: 5

    iconStyle =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      fontSize: 12
      height: 20

    colorPickerStyle =
      verticalAlign: 'middle'
      lineHeight: 1
      display: 'inline-block'
      marginLeft: 5

    elem = H.div null,
      if connectDragSource
        connectDragSource(H.i(className: "fa fa-bars", style: iconStyle))

      if @props.allowExcludedValues
        H.input 
          type: "checkbox"
          style: { marginLeft: 5, marginBottom: 5, verticalAlign: "middle" }
          checked: not _.includes(@props.axis.excludedValues, category.value)
          onChange: @handleExcludeChange.bind(null, category.value)

      if @props.showColorMap
        H.div style: colorPickerStyle,
          R ColorComponent,
            key: 'color'
            color: @lookupColor(category.value)
            onChange: (color) => @handleColorChange(category.value, color)

      H.span style: labelStyle,
        @renderLabel(category)

    if connectDropTarget
      elem = connectDropTarget(elem)
    if connectDragPreview
      elem = connectDragPreview(elem)

    return elem

  renderReorderable: ->
    drawOrder = @props.axis.drawOrder or _.pluck(@props.axis.colorMap, "value")

    orderedCategories = _.sortBy(@props.categories, (category) =>
      _.indexOf(drawOrder, category.value)
    )

    H.div null,
      R ReorderableListComponent,
        items: orderedCategories
        onReorder: @handleReorder
        renderItem: @renderCategory
        getItemId: (item) => item.value

  renderNonReorderable: ->
    H.div null,
      _.map @props.categories, (category) => @renderCategory(category)

  render: ->
    if @props.reorderable
      return @renderReorderable()
    else
      return @renderNonReorderable()
