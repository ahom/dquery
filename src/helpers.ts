/// <reference path="./document.ts" />
/// <reference path="./expression.ts" />
/// <reference path="./condition.ts" />
/// <reference path="./operation.ts" />
/// <reference path="./query.ts" />

function p(path : string) : Path {
    return new Path(path);
}

class QueryBuilder {
    query : Query;

    map(mapping : any) : QueryBuilder {
        this.query.ops.push(new MapOp(mapping));
        return this;
    }
}

type ExpressionLike = Expression | Path | boolean | number | string | Date; 

function CoerceToExpression(expr : ExpressionLike) : Expression {
    if (expr instanceof Expression) {
        return expr
    }
    if (expr instanceof Path) {
        return new PathExpr(expr);
    }
    if (expr instanceof Date) {
        return new ValueExpr(expr);
    }
    switch (typeof expr) {
        case "string":
        case "number":
        case "boolean":
            return new ValueExpr(expr);
    }
    throw new Error("Can't build an Expression from: " + JSON.stringify(expr));
}

class ExpressionBuilder {
    public lhe : Expression;
    constructor(lhe_like : ExpressionLike) {
        this.lhe = CoerceToExpression(lhe_like);
    }

    lt(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.lt, CoerceToExpression(rhe)); 
    }
    lte(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.lte, CoerceToExpression(rhe)); 
    }
    gt(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.gt, CoerceToExpression(rhe)); 
    }
    gte(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.gte, CoerceToExpression(rhe)); 
    }
    eq(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.eq, CoerceToExpression(rhe)); 
    }
    neq(rhe : ExpressionLike) : Condition {
        return new BinaryExprCond(this.lhe, BinaryExprCondOperator.neq, CoerceToExpression(rhe)); 
    }
}
