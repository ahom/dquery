/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/helpers.ts" />

describe('helpers', () => {
    describe('CoerceToPath', () => {
        it('should build valid paths', () => {
            let p = new Path("my.path");
            expect(CoerceToPath(p)).toEqual(p);
            expect(CoerceToPath("my.path")).toEqual(p);
            expect(CoerceToPath("$my.path")).toEqual(p);
        });
        it('should throw on invalid paths', () => {
            for (let val of [1, true, {}]) {
                expect(((v) => () => CoerceToPath(v))(val)).toThrowError(CoercionError);

            }
        });
    });
    describe('CoerceToValue', () => {
        it('should build valid values', () => {
            for (let val of [-12, 0, 567.78, true, false, new Date(), "my", "string"]) {
                expect(CoerceToValue(val)).toEqual(new Value(val));
            }
        });
        it('should throw on invalid values', () => {
            for (let val of [{}, null, NaN, Infinity, -Infinity]) {
                expect(((v) => () => CoerceToValue(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('CoerceToExpression', () => {
        it('should build valid expression', () => {
            expect(CoerceToExpression(new ExpressionBuilder(new ValueExpr(CoerceToValue(0))))).toEqual(new ValueExpr(CoerceToValue(0)));
            expect(CoerceToExpression(new ValueExpr(CoerceToValue(0)))).toEqual(new ValueExpr(CoerceToValue(0)));
            expect(CoerceToExpression(new Path("my.path"))).toEqual(new PathExpr(new Path("my.path")));
            expect(CoerceToExpression(new Date(2000, 1, 1))).toEqual(new ValueExpr(CoerceToValue(new Date(2000, 1, 1))));
            expect(CoerceToExpression("$my.path")).toEqual(new PathExpr(new Path("my.path")));
            expect(CoerceToExpression("my.path")).toEqual(new ValueExpr(CoerceToValue("my.path")));
            expect(CoerceToExpression(2)).toEqual(new ValueExpr(CoerceToValue(2)));
            expect(CoerceToExpression(true)).toEqual(new ValueExpr(CoerceToValue(true)));
        });
        it('should throw on invalid expressions', () => {
            for (let val of [{}, null, NaN]) {
                expect(((v) => () => CoerceToExpression(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('CoerceToCondition', () => {
        it('should build valid conditions', () => {
            expect(CoerceToCondition(new ConditionBuilder(new ExistsCond(new Path("my.path"))))).toEqual(new ExistsCond(new Path("my.path")));
            expect(CoerceToCondition(new ExistsCond(new Path("my.path")))).toEqual(new ExistsCond(new Path("my.path")));
        });
        it('should throw on invalid conditions', () => {
            for (let val of [{}, null]) {
                expect(((v) => () => CoerceToCondition(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('CoerceToArrayExpr', () => {
        it('should build valid array exprs', () => {
            expect(CoerceToArrayExpr(new ArrayExprBuilder("alias", "my.path"))).toEqual(new ArrayExpr("alias", new Path("my.path"), []));
            expect(CoerceToArrayExpr(new ArrayExpr("alias", new Path("my.path"), []))).toEqual(new ArrayExpr("alias", new Path("my.path"), []));
        });
        it('should throw on invalid array expr', () => {
            for (let val of [{}, null]) {
                expect(((v) => () => CoerceToArrayExpr(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('CoerceToReducer', () => {
        it('should build valid reducers', () => {
            expect(CoerceToReducer(new ExprReducer(ExprReducerOperator.sum, CoerceToExpression(0)))).toEqual(new ExprReducer(ExprReducerOperator.sum, CoerceToExpression(0))); 
        });
        it('should throw on invalid reducers', () => {
            for (let val of [{}, null]) {
                expect(((v) => () => CoerceToReducer(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('CoerceToMapOpMapping', () => {
        it('should build valid map op mapping', () => {
            expect(CoerceToMapOpMapping({
                num: 2,
                path: "$my.path",
                embed: {
                    for: {
                        ever: new ArrayExprBuilder("alias", "my.path")
                    }
                }
            })).toEqual(new MapOpMapping({
                num: CoerceToExpression(2),
                path: CoerceToExpression("$my.path"),
                embed: {
                    for: {
                        ever: CoerceToArrayExpr(new ArrayExprBuilder("alias", "my.path"))
                    }
                }
            }));
        });
        it('should throw on leaves', () => {
            expect(() => CoerceToMapOpMapping({
                num: null
            })).toThrowError(TypeError);
        });
    });
    describe('CoerceToReduceOpKeysMapping', () => {
        it('should build valid reduce op keys mapping', () => {
            expect(CoerceToReduceOpKeysMapping({
                num: 2,
                path: "$my.path",
                embed: {
                    for: {
                        ever: true
                    }
                }
            })).toEqual(new ReduceOpKeysMapping({
                num: CoerceToExpression(2),
                path: CoerceToExpression("$my.path"),
                embed: {
                    for: {
                        ever: CoerceToExpression(true)
                    }
                }
            }));
        });
        it('should throw on leaves', () => {
            expect(() => CoerceToReduceOpKeysMapping({
                num: null
            })).toThrowError(TypeError);
        });
    });
    describe('CoerceToReduceOpValuesMapping', () => {
        it('should build valid reduce op values mapping', () => {
            expect(CoerceToReduceOpValuesMapping({
                num: new ExprReducer(ExprReducerOperator.sum, new ValueExpr(new Value(1)))
            })).toEqual(new ReduceOpValuesMapping({
                num: new ExprReducer(ExprReducerOperator.sum, new ValueExpr(new Value(1)))
            }));
        });
        it('should throw on leaves', () => {
            expect(() => CoerceToReduceOpValuesMapping({
                num: null
            })).toThrowError(TypeError);
        });
    });
    describe('CoerceToQuery', () => {
        it('should build Query', () => {
            expect(CoerceToQuery(new QueryBuilder())).toEqual(new Query());
            expect(CoerceToQuery(new Query())).toEqual(new Query());
        });
        it('should throw on invalid values', () => {
            for (let val of [{}, null]) {
                expect(((v) => () => CoerceToQuery(v))(val)).toThrowError(CoercionError);
            }
        });
    });
    describe('ExpressionBuilder', () => {
        it('should build BinaryExprCond', () => {
            for (let i = 0; BinaryExprCondOperator[i] !== undefined; i++) {
                let op = BinaryExprCondOperator[i];
                let cond : any = new ExpressionBuilder("$my.path")[op](2);
                expect(CoerceToCondition(cond)).toEqual(new BinaryExprCond(
                    new PathExpr(new Path("my.path")),
                    i,
                    new ValueExpr(new Value(2))
                ));
            }
        });
        it('should build NaryExprExpr', () => {
            for (let i = 0; NaryExprExprOperator[i] !== undefined; i++) {
                let op = NaryExprExprOperator[i];
                let sub_expr = CoerceToExpression(new ExpressionBuilder(2));
                let expr : any = new ExpressionBuilder(sub_expr)[op](sub_expr);
                expect(CoerceToExpression(expr)).toEqual(new NaryExprExpr(
                    i,
                    [sub_expr, sub_expr]
                ));
                expr = new ExpressionBuilder(sub_expr)[op]([sub_expr, sub_expr]);
                expect(CoerceToExpression(expr)).toEqual(new NaryExprExpr(
                    i,
                    [sub_expr, sub_expr, sub_expr]
                ));
            }
        });
    });
    describe('PathExpressionBuilder', () => {
        it('should build ExistsCond', () => {
            let cond : any = new PathExpressionBuilder("my.path").exists();
            expect(CoerceToCondition(cond)).toEqual(new ExistsCond(new Path("my.path")));
        });
        it('should build MatchCond', () => {
            let cond : any = new PathExpressionBuilder("my.path").match("regex");
            expect(CoerceToCondition(cond)).toEqual(new MatchCond(
                new Path("my.path"),
                "regex"
            ));
        });
        it('should build ListCond', () => {
            for (let i = 0; ListCondOperator[i] !== undefined; i++) {
                let op = ListCondOperator[i];
                let cond : any = new PathExpressionBuilder("my.path")[op]([1, 2, 3]);
                expect(CoerceToCondition(cond)).toEqual(new ListCond(
                    new Path("my.path"),
                    i,
                    [new Value(1), new Value(2), new Value(3)]
                ));
            }
        });
        it('should build EachCondCond', () => {
            for (let i = 0; EachCondCondOperator[i] !== undefined; i++) {
                let op = EachCondCondOperator[i];
                let cond : any = new PathExpressionBuilder("my.path")[op](new ExistsCond(new Path("my.path")));
                expect(CoerceToCondition(cond)).toEqual(new EachCondCond(
                    new Path("my.path"),
                    i,
                    new ExistsCond(new Path("my.path"))
                ));
            }
        });
    });
    describe('ArrayExprBuilder', () => {
        it('should build ReducedExpr', () => {
            let arr : any = new ArrayExprBuilder("alias", "my.path");
            for (let i = 0; ExprReducerOperator[i] !== undefined; i++) {
                let op = ExprReducerOperator[i];
                let expr : any = arr[op](new PathExpr(new Path("my.path")));
                expect(CoerceToExpression(expr)).toEqual(new ReducedExpr(
                    CoerceToArrayExpr(arr),
                    new ExprReducer(i, new PathExpr(new Path("my.path")))
                ));
            }
        });
    });
    describe('ConditionBuilder', () => {
        it('should build ConditionBuilder', () => {
            for (let i = 0; NaryCondCondOperator[i] !== undefined; i++) {
                let op = NaryCondCondOperator[i];
                let sub_cond = new ExistsCond(new Path("my.path"));
                let cond : any = new ConditionBuilder(sub_cond)[op](sub_cond);
                expect(CoerceToCondition(cond)).toEqual(new NaryCondCond(
                    i,
                    [sub_cond, sub_cond]
                ));
                cond = new ConditionBuilder(sub_cond)[op]([sub_cond, sub_cond]);
                expect(CoerceToCondition(cond)).toEqual(new NaryCondCond(
                    i,
                    [sub_cond, sub_cond, sub_cond]
                ));
            }
        });
    });
    describe('QueryBuilder', () => {
        it('should build ops', () => {
            expect(new QueryBuilder()
                    .map({})
                    .filter(new ExistsCond(new Path("my.path")))
                    .concat([])
                    .reduce({}, {})
                    ["limit"](1)
                    ["skip"](2)
                    .query
            ).toEqual(
                new Query([
                    new MapOp(new MapOpMapping({})), 
                    new FilterOp(new ExistsCond(new Path("my.path"))), 
                    new ConcatOp([]), 
                    new ReduceOp(new ReduceOpKeysMapping({}), new ReduceOpValuesMapping({})), 
                    new RangeOp(RangeOpOperator.limit, 1),
                    new RangeOp(RangeOpOperator.skip, 2)
                ])
            );
        });
    });
});
