/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/index.ts" />

describe('api', () => {
    it('query should build QueryBuilder', () => {
        expect(api.query()).toEqual(new QueryBuilder());
    });
    it('expr should build ExpressionBuilder', () => {
        expect(api.expr("$my.path")).toEqual(new ExpressionBuilder("$my.path"));
    });
    it('path should build PathExpressionBuilder', () => {
        expect(api.path("my.path")).toEqual(new PathExpressionBuilder("my.path"));
    });
    it('for_each should build ArrayExprBuilder', () => {
        expect(api.for_each("my.path")).toEqual(new ArrayExprBuilder("my.path"));
    });
    it('reducers should build ExprReducers', () => {
        for (let i = 0; ExprReducerOperator[i] !== undefined; i++) {
            let op = ExprReducerOperator[i];
            expect(api[op]("$my.path")).toEqual(new ExprReducer(i, new PathExpr(new Path("my.path"))));
        }
    });
});
