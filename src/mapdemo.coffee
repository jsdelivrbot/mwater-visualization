H = React.DOM
visualization_mwater = require './systems/mwater'
visualization = require './index'

class MapDemoComponent extends React.Component
  constructor: (props) ->
    super
    @state = { design: @props.initialDesign }

  componentDidMount: ->
    visualization_mwater.createSchema { apiUrl: @props.apiUrl, client: @props.client }, (err, schema) =>
      if err
        throw err
        
      dataSource = visualization_mwater.createDataSource(@props.apiUrl, @props.client)
      widgetFactory = new visualization.WidgetFactory(schema, dataSource)
      layerFactory = new visualization.LayerFactory(schema: @props.schema, apiUrl: @props.apiUrl, client: @props.client)

      @setState(schema: schema, widgetFactory: widgetFactory, dataSource: dataSource, layerFactory: layerFactory)

  handleDesignChange: (design) =>
    @setState(design: design)
    console.log JSON.stringify(design, null, 2)
    
  render: ->
    if not @state.schema
      return H.div null, "Loading..."

    return H.div style: { height: "100%" },
      H.style null, '''html, body { height: 100% }'''
      React.createElement(visualization.MapComponent, {
        layerFactory: @state.layerFactory
        schema: @state.schema
        design: @state.design
        onDesignChange: @handleDesignChange
        })

$ ->
  layerViews = []
  addLegacyLayerView = (id, name, visible) ->
    layerViews.push { 
      id: id
      name: name
      visible: visible == true
      opacity: 1
      layer: {
        type: "MWaterServer"
        design: {
          type: id
          table: "entities.water_point"
        }
      }
    }

  addLegacyLayerView("water_points_by_type", "Water Point Type", true)
  addLegacyLayerView("functional_status", "Functionality")
  addLegacyLayerView("ecoli_status", "E.Coli Level")
  addLegacyLayerView("water_access", "Functional Water Access")
  addLegacyLayerView("safe_water_access", "Safe Water Access")

  design = {
    baseLayer: "bing_road"
    layerViews: layerViews
    filters: {}
    bounds: { w: 0, n: 0, e: 40, s: -25 }
  }

  sample = React.createElement(MapDemoComponent, initialDesign: design, apiUrl: "http://localhost:1234/v3/")
  React.render(sample, document.body)
