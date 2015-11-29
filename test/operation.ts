/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/operation.ts" />

describe('operation', () => {
    let serialize_check = function (op : Operation) {
        expect(deserialize_op(op.serialize())).toEqual(op);
    };

    describe('map', () => {
        it('should be serializable', () => {
            serialize_check(new MapOp(new MapOpMapping(
                {
                    test: new PathExpr(new Path('a.path.expr')),
                    other_test: new ValueExpr(new Value(0)),
                    embed: {
                        for: {
                            ever: new ValueExpr(new Value(true))
                        }
                    }
                }
            )));
        });
    });
    describe('filter', () => {
        it('should be serializable', () => {
            serialize_check(new FilterOp(new ExistsCond(new Path('the.path'))));
        });
    });
    describe('concat', () => {
        it('should be serializable', () => {
            serialize_check(new ConcatOp([new Path('the.path'), new Path('the.other.path')]));
        });
    });
    describe('range', () => {
        it('should be serializable', () => {
            for (let i = 0; RangeOpOperator[i] !== undefined; i++) {
                serialize_check(new RangeOp(i, 10));
            }
        });
    });
    describe('reduce', () => {
        it('should be serializable', () => {
            serialize_check(new ReduceOp(
                new ReduceOpKeysMapping(
                    {
                        test: new PathExpr(new Path('a.path.expr')),
                        other_test: new ValueExpr(new Value(0)),
                        embed: {
                            for: {
                                ever: new ValueExpr(new Value(true))
                            }
                        }
                    }
                ),
                new ReduceOpValuesMapping(
                    {
                        test: new ExprReducer(ExprReducerOperator.sum, new PathExpr(new Path('a.path.expr'))),
                        embed: {
                            for: {
                                ever: new ExprReducer(ExprReducerOperator.avg, new ValueExpr(new Value(1)))
                            }
                        }
                    }
                )
            ));
        });
    });
});
