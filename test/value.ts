/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/value.ts" />

describe('value', () => {
    let v = function (val : ValueTypes) : Value {
        return new Value(val);
    };

    let serialize_check = function (val : Value) {
        expect(Value.Deserialize(val.serialize())).toEqual(val);
    };

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
