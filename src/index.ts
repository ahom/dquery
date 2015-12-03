/// <reference path="./helpers.ts" />

let api = {
    query: function () : QueryBuilder {
        return new QueryBuilder();
    },

    path: function (path : any) : PathExpressionBuilder {
        return new PathExpressionBuilder(path);
    },

    expr: function (expr : any) : ExpressionBuilder {
        return new ExpressionBuilder(expr);
    },

    for: function(alias : any) : { in: (path : any) => ArrayExprBuilder } {
        return {
            in: function(path : any) : ArrayExprBuilder {
                return new ArrayExprBuilder(alias, path);
            }
        }
    },

    not: function(cond : any) : ConditionBuilder {
        return new ConditionBuilder(new NotCond(CoerceToCondition(cond)));
    }
};

for (let it = 0; ExprReducerOperator[it] !== undefined; it++) {
    let op = ExprReducerOperator[it];
    api[op] = function (index : number) {
        return function (expr : any) : Reducer {
            return new ExprReducer(index, CoerceToExpression(expr));
        };
    }(it);
}
