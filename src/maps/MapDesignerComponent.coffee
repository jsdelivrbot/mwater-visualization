React = require 'react'
H = React.DOM
R = React.createElement
TabbedComponent = require('react-library/lib/TabbedComponent')
MapLayersDesignerComponent = require './MapLayersDesignerComponent'
MapFiltersDesignerComponent = require './MapFiltersDesignerComponent'
ClickOutHandler = require('react-onclickout')

module.exports = class MapDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # Data source to use
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  handleAttributionChange: (text) =>
    design = _.extend({}, @props.design, {attribution: text})
    @props.onDesignChange(design)

  render: ->
    H.div style: { padding: 5 },
      H.div className: "form-group",
        H.label className: "text-muted", 
          "Layers"

        R MapLayersDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange

      H.br()

      H.div className: "form-group",
        H.label className: "text-muted", 
          "Filters"

        # H.p className: "help-block",
        #   "Optionally filter all data on the map"

        R MapFiltersDesignerComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange

      H.br()

      H.div className: "form-group",
        H.label className: "text-muted", 
          "Map Style"
  
        R BaseLayerDesignerComponent,
          schema: @props.schema
          design: @props.design
          onDesignChange: @props.onDesignChange

      H.div className: "form-group",
        H.label className: "text-muted",
          "Attribution"

        H.p null,
          R AttributionComponent,
            text: @props.design.attribution
            onTextChange: @handleAttributionChange



# Designer for config
class BaseLayerDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleBaseLayerChange: (baseLayer) =>
    @updateDesign(baseLayer: baseLayer)

  renderBaseLayer: (id, name) ->
    className = "mwater-visualization-layer"
    if id == @props.design.baseLayer
      className += " checked"
    
    H.div 
      key: id
      className: className
      style: { display: "inline-block" },
      onClick: @handleBaseLayerChange.bind(null, id),
        name

  render: ->
    H.div style: { marginLeft: 10 }, 
      @renderBaseLayer("bing_road", "Roads")
      @renderBaseLayer("bing_aerial", "Satellite")
      @renderBaseLayer("cartodb_positron", "Light")
      @renderBaseLayer("cartodb_dark_matter", "Dark")

# Attribution inline editing
class AttributionComponent extends React.Component
  @propTypes:
    text: React.PropTypes.string
    onTextChange: React.PropTypes.func.required

  @defaultProps:
    text: null

  constructor: ->
    @state =
      editing: false

  handleTextChange: (e) =>
    @props.onTextChange(e.target.value)

  handleClickOut: () =>
    @setState(editing: false)

  renderEditor: ->
    R ClickOutHandler, onClickOut: @handleClickOut,
      H.input { ref: "attributionInput", onChange:@handleTextChange, value: @props.text, className: 'form-control'}

  onTextClick: =>
    @setState(editing: true)

  render: ->
    if @state.editing
      @renderEditor()
    else
      if @props.text?
        H.a onClick: @onTextClick,
          @props.text
      else
        H.a onClick: @onTextClick,
          "+ Add attribution"
