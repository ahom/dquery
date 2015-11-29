/// <reference path="./helpers.ts" />

let exports = {
    query: function () : QueryBuilder {
        return new QueryBuilder();
    },

    path: function (path : any) : PathExpressionBuilder {
        return new PathExpressionBuilder(path);
    },

    expr: function (expr : any) : ExpressionBuilder {
        return new ExpressionBuilder(expr);
    },

    for_each: function(path : any) : ArrayExprBuilder {
        return new ArrayExprBuilder(path);
    }
};

for (let it = 0; ExprReducerOperator[it] !== undefined; it++) {
    let op = ExprReducerOperator[it];
    exports[op] = function (index : number) {
        return function (expr : any) : Reducer {
            return new ExprReducer(index, CoerceToExpression(expr));
        };
    }(it);
}
