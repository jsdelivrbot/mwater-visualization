PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
ReactSelect = require 'react-select'

# Allows selecting of map marker symbol
module.exports = class MarkerSymbolSelectComponent extends React.Component
  @propTypes:
    symbol: PropTypes.string
    onChange: PropTypes.func.isRequired

  render: ->
    # Create options
    options = [
      { value: "font-awesome/dot-circle-o", label: "Dot circle" }
      { value: "font-awesome/bullseye", label: "Bullseye" }
      { value: "font-awesome/star", label: "Star" }
      { value: "font-awesome/square", label: "Square" }
      { value: "font-awesome/home", label: "Home" }
      { value: "font-awesome/plus", label: "Plus" }
      { value: "font-awesome/plus-circle", label: "Plus Circle" }
      { value: "font-awesome/plus-square", label: "Plus Square" }
      { value: "font-awesome/asterisk", label: "Asterisk" }
      { value: "font-awesome/mobile", label: "Mobile" }
      { value: "font-awesome/check", label: "Check" }
      { value: "font-awesome/university", label: "Institution" }
      { value: "font-awesome/check-circle", label: "Check Circle" }
      { value: "font-awesome/times", label: "Removed" }
      { value: "font-awesome/ban", label: "Ban" }
      { value: "font-awesome/crosshairs", label: "Crosshairs" }
      { value: "font-awesome/flask", label: "Flask" }
      { value: "font-awesome/flag", label: "Flag" }
      { value: "font-awesome/info-circle", label: "Info Circle" }
      { value: "font-awesome/exclamation-circle", label: "Exclamation Circle" }
      { value: "font-awesome/exclamation-triangle", label: "Exclamation Triangle" }
      { value: "font-awesome/bell", label: "Bell" }
      { value: "font-awesome/bolt", label: "Bolt" }
      { value: "font-awesome/building", label: "Building" }
      { value: "font-awesome/bus", label: "Bus" }
      { value: "font-awesome/certificate", label: "Certificate" }
      { value: "font-awesome/comment", label: "Comment" }
      { value: "font-awesome/male", label: "Male" }
      { value: "font-awesome/female", label: "Female" }
      { value: "font-awesome/user", label: "Person" }
      { value: "font-awesome/users", label: "Group" }
      { value: "font-awesome/wheelchair", label: "Wheelchair" }
      { value: "font-awesome/h-square", label: "Hospital Symbol" }
      { value: "font-awesome/thumbs-up", label: "Thumbs Up" }
      { value: "font-awesome/thumbs-down", label: "Thumbs Down" }
      { value: "font-awesome/ticket", label: "Ticket" }
      { value: "font-awesome/tint", label: "Tint" }
      { value: "font-awesome/times-circle", label: "Times Circle" }
      { value: "font-awesome/tree", label: "Tree" }
      { value: "font-awesome/file", label: "File" }
      { value: "font-awesome/usd", label: "USD" }
      { value: "font-awesome/caret-up", label: "Caret Up" }
      { value: "font-awesome/chevron-circle-up", label: "Chevron Up" }
      { value: "font-awesome/chevron-circle-down", label: "Chevron Down" }
      { value: "font-awesome/medkit", label: "Medkit" }
      { value: "font-awesome/cloud", label: "Cloud" }
      { value: "font-awesome/beer", label: "Cup" }
    ]

    optionRenderer = (option) ->
      return R 'span', null,
        R 'i', className: "fa fa-#{option.value.substr(13)}" # Trim "font-awesome/"
        " #{option.label}"

    return R 'div', className: "form-group",
      R 'label', className: "text-muted", 
        R('span', className: "fa fa-star")
        " "
        "Symbol"
      R ReactSelect, {
        placeholder: "Circle"
        value: @props.symbol
        options: options
        optionRenderer: optionRenderer
        valueRenderer: optionRenderer
        onChange: @props.onChange
      }
