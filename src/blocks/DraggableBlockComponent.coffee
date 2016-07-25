React = require 'react'
H = React.DOM
R = React.createElement

DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext


# Gets the drop side (top, left, right, bottom)
getDropSide = (monitor, component) ->
  # Get underlying component
  blockComponent = component.getDecoratedComponentInstance()

  # Get bounds of component
  hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect()

  clientOffset = monitor.getClientOffset()

  # Get position within hovered item
  hoverClientX = clientOffset.x - hoverBoundingRect.left
  hoverClientY = clientOffset.y - hoverBoundingRect.top

  # Determine if over is more left, right, top or bottom
  fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left)
  fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top)

  if fractionX > fractionY  # top or right
    if (1 - fractionX) > fractionY # top or left
      pos = "top"
    else
      pos = "right"
  else # bottom or left
    if (1 - fractionX) > fractionY # top or left
      pos = "left"
    else
      pos = "bottom"

  return pos

blockTargetSpec =
  # Called when an block hovers over this component
  hover: (props, monitor, component) ->
    # Hovering over self does nothing
    hoveringId = monitor.getItem().block.id
    myId = props.block.id
    if hoveringId == myId
      return

    if props.onlyBottom
      side = "bottom"
    else
      side = getDropSide(monitor, component)

    # Set the state
    component.getDecoratedComponentInstance().setState(hoverSide: side)

  canDrop: (props, monitor) ->
    hoveringId = monitor.getItem().block.id
    myId = props.block.id
    if hoveringId == myId
      return false

    return true

  drop: (props, monitor, component) ->
    if monitor.didDrop()
      return

    side = component.getDecoratedComponentInstance().state.hoverSide
    props.onBlockDrop(monitor.getItem().block, props.block, side)

blockSourceSpec = {
  beginDrag: (props, monitor, component) ->
    return {
      block: props.block
    }

  isDragging: (props, monitor) ->
    return props.block.id == monitor.getItem().block.id
}

collectTarget = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver({ shallow: true })
    canDrop: monitor.canDrop()
  }


collectSource = (connect, monitor) ->
  return {
    connectDragSource: connect.dragSource()
    connectDragPreview: connect.dragPreview()
    isDragging: monitor.isDragging()
  }


class DraggableBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired # Block to display

    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    onBlockRemove: React.PropTypes.func.isRequired # Called with (block) when block is removed

    canMove: React.PropTypes.bool.isRequired  # True to allow block to be moved
    canRemove: React.PropTypes.bool.isRequired # True to allow block to be removed
    onlyBottom: React.PropTypes.bool # True to only allow dropping at bottom (root block)

    # Injected by React-dnd
    isDragging: React.PropTypes.bool.isRequired # internally used for tracking if an item is being dragged
    isOver: React.PropTypes.bool.isRequired # internally used to check if an item is over the current component

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDropTarget: React.PropTypes.func.isRequired # the drop target connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  constructor: (props) ->
    super(props)

    @state = {
      hoverSide: null
    }

  render: ->
    outerStyle = { }

    # Show
    if @props.isOver
      # style.backgroundColor = "#DDF"
      switch @state.hoverSide
        when "left"
          outerStyle.borderLeft = "solid 3px #38D"
        when "right"
          outerStyle.borderRight = "solid 3px #38D"
        when "top"
          outerStyle.borderTop = "solid 3px #38D"
        when "bottom"
          outerStyle.borderBottom = "solid 3px #38D"

    style = { } 

    # Hide if dragging
    if @props.isDragging
      style.visibility = "hidden"

    if @props.canMove or @props.canRemove
      elem = H.div style: outerStyle, className: "mwater-visualization-block-outer",
        if @props.canMove and not @props.isDragging
          @props.connectDragSource(H.div key: "move", className: "mwater-visualization-block-move",
            H.i className: "fa fa-ellipsis-h")

        if @props.canRemove and not @props.isDragging
          H.div key: "remove", className: "mwater-visualization-block-remove", onClick: @props.onBlockRemove.bind(null, @props.block),
            H.i className: "fa fa-times"

        H.div style: style, className: "mwater-visualization-block-inner",
          @props.children
    else
      elem = H.div style: outerStyle, @props.children

    return @props.connectDragPreview(@props.connectDropTarget(elem))


module.exports = _.flow(DragSource("block", blockSourceSpec, collectSource), DropTarget("block", blockTargetSpec, collectTarget))(DraggableBlockComponent)

