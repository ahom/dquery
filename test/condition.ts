/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/condition.ts" />

describe('condition', () => {
    let v = function (val : ValueTypes) : ValueExpr {
        return new ValueExpr(new Value(val));
    };

    let serialize_check = function (cond : Condition) {
        expect(deserialize_cond(cond.serialize())).toEqual(cond);
    };

    describe('binary_expr', () => {
        it('should be serializable', () => {
            for (let i = 0; BinaryExprCondOperator[i] !== undefined; i++) {
                serialize_check(new BinaryExprCond(v(0), i, v(1)));
            }
        });
    });
    describe('nary_cond', () => {
        it('should be serializable', () => {
            for (let i = 0; NaryCondCondOperator[i] !== undefined; i++) {
                serialize_check(new NaryCondCond(i,
                    [ new ExistsCond(new Path('my.path')) ]
                ));
            }
        });
    });
    describe('like', () => {
        it('should be serializable', () => {
            serialize_check(new LikeCond(new Path('my.path'), 'a_super_regex_lolz*[(/'));
        });
    });
    describe('list', () => {
        it('should be serializable', () => {
            for (let i = 0; ListCondOperator[i] !== undefined; i++) {
                serialize_check(new ListCond(
                    new Path('my.path'), 
                    i,
                    [ 1, 2, 3].map((val) => new Value(val))
                ));
            }
        });
    });
    describe('exists', () => {
        it('should be serializable', () => {
            serialize_check(new ExistsCond(new Path('my.path')));
        });
    });
    describe('each_cond', () => {
        it('should be serializable', () => {
            for (let i = 0; EachCondCondOperator[i] !== undefined; i++) {
                serialize_check(new EachCondCond(
                    new Path('my.path'), 
                    i,
                    new ExistsCond(new Path('lol.path'))
                ));
            }
        });
    });
});
