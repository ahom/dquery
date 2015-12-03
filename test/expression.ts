/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/expression.ts" />

describe('expession', () => {
    let v = function (val : ValueTypes) : ValueExpr {
        return new ValueExpr(new Value(val));
    };

    let serialize_check = function (expr : Expression) {
        expect(deserialize_expr(expr.serialize())).toEqual(expr);
    };

    describe('value', () => {
        it('should be serializable for boolean', () => {
            serialize_check(v(true));
            serialize_check(v(false));
        });
        it('should be serializable for numbers', () => {
            serialize_check(v(0));
            serialize_check(v(1234567890));
            serialize_check(v(-1234567890));
        });
        it('should be serializable for string', () => {
            serialize_check(v(''));
            serialize_check(v('my_string'));
        });
        it('should be serializable for dates', () => {
            serialize_check(v(new Date()));
            serialize_check(v(new Date(2000, 1, 1, 23, 59, 59, 999)));
        });
    });
    describe('path', () => {
        it('should be serializable', () => {
            serialize_check(new PathExpr(new Path('my.path')));
        });
    });
    describe('nary_expr', () => {
        it('should be serializable', () => {
            for (let i = 0; NaryExprExprOperator[i] !== undefined; i++) {
                serialize_check(new NaryExprExpr(i, [v(0), v(1)]));
            }
        });
    });
    describe('array', () => {
        it('should be serializable', () => {
            let arr_expr = new ArrayExpr(
                "alias",
                new Path('my.path'),
                [ new MapOp(new MapOpMapping({})) ]
            );
            expect(deserialize_array_expr(arr_expr.serialize())).toEqual(arr_expr);
        });
    });
    describe('reduced', () => {
        it('should be serializable', () => {
            let reduced_expr = new ReducedExpr(
                new ArrayExpr(
                    "alias",
                    new Path('my.path'),
                    [ new MapOp(new MapOpMapping({})) ]
                ),
                new ExprReducer(
                    ExprReducerOperator.sum,
                    new PathExpr(new Path('my.path'))
                )
            );
            serialize_check(reduced_expr);
        });
    });
});
