React = require 'react'
H = React.DOM
R = React.createElement

uuid = require 'uuid'

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require("mwater-expressions-ui").ExprComponent
ActionCancelModalComponent = require("react-library/lib/ActionCancelModalComponent")
TableSelectComponent = require '../../TableSelectComponent'
ExprItemEditorComponent = require './ExprItemEditorComponent'

# Modal that displays an expression builder
module.exports = class ExprInsertModalComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired   # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use to get values
    onInsert: React.PropTypes.func.isRequired   # Called with expr item to insert
    singleRowTable: React.PropTypes.string  # Table that is filtered to have one row

  constructor: ->
    super

    @state = {
      open: false
      exprItem: null
    }

  open: ->
    @setState(open: true, exprItem: { type: "expr", id: uuid() })

  handleInsert: (ev) =>
    if not @state.exprItem
      return

    # Close first to avoid strange effects when mixed with pojoviews
    @setState(open: false, =>
      @props.onInsert(@state.exprItem)
    )

  render: ->
    if not @state.open
      return null

    R ActionCancelModalComponent, 
      actionLabel: "Insert"
      onAction: @handleInsert 
      onCancel: => @setState(open: false)
      title: "Insert Field",
        R ExprItemEditorComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          exprItem: @state.exprItem
          onChange: (exprItem) => @setState(exprItem: exprItem)
          singleRowTable: @props.singleRowTable

