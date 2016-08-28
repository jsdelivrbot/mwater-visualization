_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

NumberInputComponent = require('react-library/lib/NumberInputComponent')

# Dropdown to add a new layer. 
# Can be overridden by context of addLayerElementFactory which is called with all props
module.exports = class ZoomLevelsComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func.isRequired

  constructor: (props) ->
    super

    @state = {
      expanded: false
    }

  render: ->
    if not @state.expanded
      return H.div null,
        H.a className: "btn btn-link btn-xs", onClick: (=> @setState(expanded: true)),
          "Advanced options..."

    return H.div className: "form-group",
      H.label className: "text-muted", "Advanced"
      H.div null,
        H.span className: "text-muted", "Minimum Zoom Level:"
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.minZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, minZoom: v))

      H.div null,
        H.span className: "text-muted", "Maximum Zoom Level: "
        " "
        R NumberInputComponent, 
          small: true
          style: { display: "inline-block"}
          placeholder: "None"
          value: @props.design.maxZoom
          onChange: (v) => @props.onDesignChange(_.extend({}, @props.design, maxZoom: v))
