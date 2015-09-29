# Design is:
  
  type: bar/line/spline/scatter/area/pie/donut
  layers: array of layers
  titleText: title text
  xAxisLabelText: text of x axis label
  yAxisLabelText: text of y axis label
  transpose: true to flip axes
  stacked: true to stack all 
  proportinal: true to stack proportionally (100 %). Only applicable if stacked

layer:
  type: bar/line/spline/scatter/area/pie/donut (overrides main one)
  name: label for layer (optional)
  axes: axes (see below)
  stacked: true to stack (Note: not implemented yet)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800)

axes:
  x: x axis
  y: y axis
  color: color axis (to split into series based on a color)

axis: 
  expr: expression of axis
  aggr: aggregation for axis

