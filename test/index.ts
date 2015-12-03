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
    it('for in should build ArrayExprBuilder', () => {
        expect(api.for("alias").in("my.path")).toEqual(new ArrayExprBuilder("alias", "my.path"));
    });
    it('not should build ConditionBuilder', () => {
        expect(api.not(api.path("my.path").exists())).toEqual(new ConditionBuilder(new NotCond(new ExistsCond(new Path("my.path")))));
    });
    it('reducers should build ExprReducers', () => {
        for (let i = 0; ExprReducerOperator[i] !== undefined; i++) {
            let op = ExprReducerOperator[i];
            expect(api[op]("$my.path")).toEqual(new ExprReducer(i, new PathExpr(new Path("my.path"))));
        }
    });
});
