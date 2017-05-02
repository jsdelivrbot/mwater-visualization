_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
H = React.DOM

ActionCancelModalComponent = require('react-library/lib/ActionCancelModalComponent')
ExprUtils = require('mwater-expressions').ExprUtils
TextComponent = require '../../text/TextComponent'

PivotChartUtils = require './PivotChartUtils'
PivotChartLayoutComponent = require './PivotChartLayoutComponent'
PivotChartLayoutBuilder = require './PivotChartLayoutBuilder'
SegmentDesignerComponent = require './SegmentDesignerComponent'
IntersectionDesignerComponent = require './IntersectionDesignerComponent'

DashboardPopupComponent = require '../../../dashboards/DashboardPopupComponent'

# Displays a pivot chart
module.exports = class PivotChartViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired
    data: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func

    width: React.PropTypes.number.isRequired
    standardWidth: React.PropTypes.number  # Deprecated

    # scope of the widget (when the widget self-selects a particular scope)
    scope: React.PropTypes.shape({ 
      name: React.PropTypes.node.isRequired
      filter: React.PropTypes.shape({ table: React.PropTypes.string.isRequired, jsonql: React.PropTypes.object.isRequired })
      data: React.PropTypes.any
    }) 
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    widgetDataSource: React.PropTypes.object.isRequired # dashboard data source for widget

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired })).isRequired
    onPopupsChange: React.PropTypes.func # Sets popups of dashboard. If not set, readonly
    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

    # Gets available system actions for a table. Called with (tableId). 
    # Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
    getSystemActions: React.PropTypes.func 

    # Filters to add to the dashboard
    filters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired    # id table to filter
      jsonql: React.PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  constructor: ->
    super

    @state = {
      editSegment: null   # Segment being edited
      editIntersectionId: null # id of intersection being edited
      editIntersection: null # value of intersection being edited
    }

  handleHeaderChange: (header) =>
    @props.onDesignChange(_.extend({}, @props.design, header: header))

  handleFooterChange: (footer) =>
    @props.onDesignChange(_.extend({}, @props.design, footer: footer))

  handleEditSection: (sectionId) =>
    # If intersection
    if sectionId.match(":")
      @setState(editIntersectionId: sectionId, editIntersection: @props.design.intersections[sectionId] or {})
    else
      # Find segment
      segment = PivotChartUtils.findSegment(@props.design.rows, sectionId) or PivotChartUtils.findSegment(@props.design.columns, sectionId)
      @setState(editSegment: segment)

  handleSaveEditSegment: =>
    # Always has label when saved
    segment = @state.editSegment

    if not segment.label?
      segment = _.extend({}, segment, label: "")
    
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.replaceSegment(@props.design.rows, segment)
      columns: PivotChartUtils.replaceSegment(@props.design.columns, segment)
      })

    @props.onDesignChange(design)
    @setState(editSegment: null)

  handleCancelEditSegment: =>
    @setState(editSegment: null)

  handleSaveEditIntersection: =>
    intersections = _.clone(@props.design.intersections)
    intersections[@state.editIntersectionId] = @state.editIntersection

    design = _.extend({}, @props.design, intersections: intersections)
    @props.onDesignChange(design)
    @setState(editIntersectionId: null, editIntersection: null)

  handleCancelEditIntersection: =>
    @setState(editIntersectionId: null, editIntersection: null)

  handleRemoveSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.removeSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.removeSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleInsertBeforeSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.insertBeforeSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.insertBeforeSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleInsertAfterSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.insertAfterSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.insertAfterSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleAddChildSegment: (segmentId) =>
    design = _.extend({}, @props.design, {
      rows: PivotChartUtils.addChildSegment(@props.design.rows, segmentId)
      columns: PivotChartUtils.addChildSegment(@props.design.columns, segmentId)
      })

    @props.onDesignChange(design)

  handleSummarizeSegment: (segmentId) =>
    design = PivotChartUtils.summarizeSegment(@props.design, segmentId, "Summary")

    @props.onDesignChange(design)

  performScopeAction: (cell) ->
    if cell.scoped
      @props.onScopeChange?()
    else if cell.segmentValues and not _.isEmpty(cell.segmentValues)
      scope = {
        name: PivotChartUtils.createScopeName(@props.design, @props.schema, cell.segmentValues, @context.locale)
        filter: PivotChartUtils.createCellFilter(@props.design, @props.schema, cell.segmentValues)
        data: {
          section: cell.section
          segmentValues: cell.segmentValues
        }
      }

      @props.onScopeChange?(scope)

  handleCellClick: (cell) =>
    # If segment
    if cell.type in ['row', 'column']
      segment = PivotChartUtils.findSegment(@props.design.rows, cell.section) or PivotChartUtils.findSegment(@props.design.columns, cell.section)

      # Determine action
      if segment.clickAction == "scope"
        @performScopeAction(cell)
      else if segment.clickAction == "popup" and segment.clickActionPopup
        @dashboardPopupComponent.show(segment.clickActionPopup, 
          _.compact([PivotChartUtils.createCellFilter(@props.design, @props.schema, cell.segmentValues)]))
    else if cell.type == "intersection"
      intersection = @props.design.intersections[cell.section]

      # Determine action
      if intersection.clickAction == "scope"
        @performScopeAction(cell)
      else if intersection.clickAction == "popup" and intersection.clickActionPopup
        @dashboardPopupComponent.show(intersection.clickActionPopup, 
          _.compact([PivotChartUtils.createCellFilter(@props.design, @props.schema, cell.segmentValues)]))

  renderHeader: ->
    return H.div ref: "header", style: { paddingLeft: 10, paddingRight: 10 },
      R TextComponent,
        design: @props.design.header
        onDesignChange: if @props.onDesignChange then @handleHeaderChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.header or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderFooter: ->
    return H.div ref: "footer", style: { paddingLeft: 10, paddingRight: 10 },
      R TextComponent,
        design: @props.design.footer
        onDesignChange: if @props.onDesignChange then @handleFooterChange
        schema: @props.schema
        dataSource: @props.dataSource
        exprValues: @props.data.footer or {}
        width: @props.width
        standardWidth: @props.standardWidth

  renderEditSegmentModal: ->
    if not @state.editSegment
      return

    segmentType = if PivotChartUtils.findSegment(@props.design.rows, @state.editSegment.id) then "row" else "column"

    R ActionCancelModalComponent,
      header: "Edit #{segmentType}"
      onAction: @handleSaveEditSegment
      onCancel: @handleCancelEditSegment,
        R SegmentDesignerComponent,
          segment: @state.editSegment
          table: @props.design.table
          schema: @props.schema
          dataSource: @props.dataSource
          segmentType: segmentType
          onChange: (segment) => @setState(editSegment: segment)
          widgetDataSource: @props.widgetDataSource
          popups: @props.popups
          onPopupsChange: @props.onPopupsChange
          onSystemAction: @props.onSystemAction
          getSystemActions: @props.getSystemActions
          namedStrings: @props.namedStrings
          filters: @props.filters

  renderEditIntersectionModal: ->
    if not @state.editIntersectionId
      return

    R ActionCancelModalComponent,
      header: "Edit Value"
      onAction: @handleSaveEditIntersection
      onCancel: @handleCancelEditIntersection,
        R IntersectionDesignerComponent,
          intersection: @state.editIntersection
          table: @props.design.table
          schema: @props.schema
          dataSource: @props.dataSource
          onChange: (intersection) => @setState(editIntersection: intersection)
          widgetDataSource: @props.widgetDataSource
          popups: @props.popups
          onPopupsChange: @props.onPopupsChange
          onSystemAction: @props.onSystemAction
          getSystemActions: @props.getSystemActions
          namedStrings: @props.namedStrings
          filters: @props.filters

  renderPopup: ->
    R DashboardPopupComponent,
      ref: (c) => @dashboardPopupComponent = c
      popups: @props.popups
      onPopupsChange: @props.onPopupsChange
      schema: @props.schema
      dataSource: @props.dataSource
      widgetDataSource: @props.widgetDataSource
      onSystemAction: @props.onSystemAction
      getSystemActions: @props.getSystemActions
      namedStrings: @props.namedStrings
      filters: @props.filters

  render: ->
    layout = new PivotChartLayoutBuilder(schema: @props.schema).buildLayout(@props.design, @props.data, @context.locale, @props.scope)

    H.div style: { width: @props.width, height: @props.height },
      @renderPopup()
      @renderHeader()
      @renderEditSegmentModal()
      @renderEditIntersectionModal()
      H.div key: "layout", style: { margin: 10, marginTop: 15 },  # Leave room for gear menu
        R PivotChartLayoutComponent, 
          layout: layout
          editable: @props.onDesignChange?
          onEditSection: if @props.onDesignChange? then @handleEditSection
          onRemoveSegment: if @props.onDesignChange? then @handleRemoveSegment
          onInsertBeforeSegment: if @props.onDesignChange? then @handleInsertBeforeSegment
          onInsertAfterSegment: if @props.onDesignChange? then @handleInsertAfterSegment
          onAddChildSegment: if @props.onDesignChange? then @handleAddChildSegment
          onSummarizeSegment: if @props.onDesignChange? then @handleSummarizeSegment
          onCellClick: @handleCellClick


      @renderFooter()
