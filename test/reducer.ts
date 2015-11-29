/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/reducer.ts" />

describe('reducer', () => {
    let serialize_check = function (red : Reducer) {
        expect(deserialize_red(red.serialize())).toEqual(red);
    };

    describe('expr', () => {
        it('should be serializable', () => {
            for (let i = 0; ExprReducerOperator[i] !== undefined; i++) {
                serialize_check(new ExprReducer(i, new ValueExpr(new Value(0))));
            }
        });
    });
});
