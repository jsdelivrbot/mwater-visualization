
# Cleans and validates designs
module.exports = class DesignValidator
  constructor: (schema) ->
    @schema = schema

  cleanExpr: (expr) ->
    if not expr or not expr.type
      return expr

    switch expr.type
      when "scalar"
        return @cleanScalarExpr(expr)
      when "comparison"
        return @cleanComparisonExpr(expr)
      when "logical"
        return @cleanLogicalExpr(expr)

    return expr

  cleanScalarExpr: (scalar, baseTable) =>
    if not scalar then return scalar

    # TODO toast if baseTable wrong

    # Clean aggregate
    if scalar.expr
      aggrs = @schema.getAggrs(scalar.expr)

      # Remove if wrong
      if scalar.aggrId not in _.pluck(aggrs, "id")
        scalar = _.omit(scalar, "aggrId")

      # Set if needed to first
      if not @schema.isAggrNeeded(scalar.joinIds)
        scalar = _.omit(scalar, "aggrId")
      else if not scalar.aggrId
        scalar = _.extend({}, scalar, { aggrId: aggrs[0].id })

    return scalar

  cleanComparisonExpr: (expr) =>
    # TODO always creates new
    expr = _.extend({}, expr, lhs: @cleanExpr(expr.lhs))

    # Remove op, rhs if no lhs
    if not expr.lhs 
      expr = { type: "comparison" }

    # Remove rhs if no op
    if not expr.op and expr.rhs
      expr = _.omit(expr, "rhs")

    # Remove rhs if wrong type
    if expr.op and expr.rhs and expr.lhs
      if @schema.getComparisonRhsType(@schema.getExprType(expr.lhs), expr.op) != @schema.getExprType(expr.rhs)
        expr = _.omit(expr, "rhs")        

    # Default op
    if expr.lhs and not expr.op
      expr = _.extend({}, expr, op: @schema.getComparisonOps(@schema.getExprType(expr.lhs))[0].id)
    return expr


  cleanLogicalExpr: (expr) =>
    # TODO always makes new
    expr = _.extend({}, expr, exprs: _.map(expr.exprs, @cleanComparisonExpr))

