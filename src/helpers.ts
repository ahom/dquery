/// <reference path="./query.ts" />

declare class ErrorClass implements Error {
    public name: string;
    public message: string;
    constructor(message?: string);
}

class CoercionError extends ErrorClass {
    public name = "CoercionError";
    constructor (public message?: string) {
        super(message);
    }
}

function CoerceToPath(path : any) : Path {
    if (path instanceof Path) {
        return path;
    }
    if (typeof path === "string") {
        let str : string = <string>path;
        if (str.length > 0 && str[0] === '$') {
            return new Path(str.substr(1));
        } else {
            return new Path(path);
        }
    }
    throw new CoercionError("Can't build a Path from: " + JSON.stringify(path)); 
}

function CoerceToValue(val : any) : Value {
    if (val instanceof Date 
            || typeof val === 'string' 
            || typeof val === 'boolean'  
            || typeof val === 'number'
            && ( this.val === this.val // test for NaN
                && this.val !== Infinity
                && this.val !== -Infinity )) {
        return new Value(val);
    }
    throw new CoercionError("Can't build a Value from: " + JSON.stringify(val)); 
}

function CoerceToExpression(expr : any) : Expression {
    if (expr instanceof ExpressionBuilder) {
        return expr.lhe;
    }
    if (expr instanceof Expression) {
        return expr;
    }
    if (expr instanceof Path) {
        return new PathExpr(expr);
    }
    if (expr instanceof Date) {
        return new ValueExpr(expr);
    }
    switch (typeof expr) {
        case "string":
            // explicit cast waiting for https://github.com/Microsoft/TypeScript/issues/2214
            let str : string = <string>expr;
            if (str.length > 0 && str[0] === '$') {
                return new PathExpr(new Path(str.substr(1)));
            }
        case "number":
        case "boolean":
            return new ValueExpr(CoerceToValue(expr));
    }
    throw new CoercionError("Can't build an Expression from: " + JSON.stringify(expr));
}

function CoerceToCondition(cond : any) : Condition {
    if (cond instanceof ConditionBuilder) {
        return cond.lhc;
    }
    if (cond instanceof Condition) {
        return cond;
    }
    throw new CoercionError("Can't build a Condition from: " + JSON.stringify(cond));
}

function CoerceToArrayExpr(arr : any) : ArrayExpr {
    if (arr instanceof ArrayExprBuilder) {
        return arr.arr;
    }
    if (arr instanceof ArrayExpr) {
        return arr;
    }
    throw new CoercionError("Can't build an ArrayExpr from: " + JSON.stringify(arr));
}

function CoerceToReducer(red : any) : Reducer {
    if (red instanceof Reducer) {
        return red;
    }
    throw new CoercionError("Can't build a Reducer from: " + JSON.stringify(red));
}

function CoerceToMapOpMapping(mapping : any) : MapOpMapping {
    Object.keys(mapping).forEach((key) => {
        let obj = mapping[key];

        try {
            mapping[key] = CoerceToExpression(obj);
        } catch(e) {
            if (!(e instanceof CoercionError)) {
                throw e;
            }

            try {
                mapping[key] = CoerceToArrayExpr(obj);
            } catch(e) {
                if (!(e instanceof CoercionError)) {
                    throw e;
                }

                mapping[key] = CoerceToMapOpMapping(obj).map;
            }
        }
    });
    return new MapOpMapping(mapping);
}

function CoerceToReduceOpKeysMapping(mapping : any) : ReduceOpKeysMapping {
    Object.keys(mapping).forEach((key) => {
        let obj = mapping[key];

        try {
            mapping[key] = CoerceToExpression(obj);
        } catch(e) {
            if (!(e instanceof CoercionError)) {
                throw e;
            }
            mapping[key] = CoerceToReduceOpKeysMapping(obj).map;
        }
    });
    return new ReduceOpKeysMapping(mapping);
}

function CoerceToReduceOpValuesMapping(mapping : any) : ReduceOpValuesMapping {
    Object.keys(mapping).forEach((key) => {
        let obj = mapping[key];

        try {
            mapping[key] = CoerceToReducer(obj);
        } catch(e) {
            if (!(e instanceof CoercionError)) {
                throw e;
            }
            mapping[key] = CoerceToReduceOpValuesMapping(obj).map;
        }
    });
    return new ReduceOpValuesMapping(mapping);
}

class ExpressionBuilder implements Serializable {
    public lhe : Expression;
    constructor(lhe_like : any) {
        this.lhe = CoerceToExpression(lhe_like);
    }

    serialize() : any {
        return this.lhe.serialize();
    }
}

for (let it = 0; BinaryExprCondOperator[it] !== undefined; it++) {
    let op = BinaryExprCondOperator[it];
    ExpressionBuilder.prototype[op] = function (index : number) {
        return function (rhe : any) : ConditionBuilder {
            return new ConditionBuilder(new BinaryExprCond(this.lhe, index, CoerceToExpression(rhe)));
        };
    }(it);
}

for (let it = 0; BinaryExprExprOperator[it] !== undefined; it++) {
    let op = BinaryExprExprOperator[it];
    ExpressionBuilder.prototype[op] = function (index : number) {
        return function (rhe : any) : ExpressionBuilder {
            this.lhe = new BinaryExprExpr(this.lhe, index, CoerceToExpression(rhe));
            return this;
        };
    }(it);
}

class PathExpressionBuilder extends ExpressionBuilder {
    public path : Path;
    constructor(path_like : any) {
        this.path = CoerceToPath(path_like);
        super(this.path);
    }

    exists() : ConditionBuilder {
        return new ConditionBuilder(new ExistsCond(this.path));
    }
    
    like(regex : string) : ConditionBuilder {
        if (typeof regex === 'string') {
            return new ConditionBuilder(new LikeCond(this.path, regex));
        }
        throw new Error("Can't build a regex with: " + JSON.stringify(regex));
    }
}

for (let it = 0; ListCondOperator[it] !== undefined; it++) {
    let op = ListCondOperator[it];
    PathExpressionBuilder.prototype[op] = function (index : number) {
        return function (values : Array<any>) : ConditionBuilder {
            if (values instanceof Array) {
                return new ConditionBuilder(new ListCond(this.path, index, values.map((val) => CoerceToValue(val))));
            }
            throw new Error("Can't build a [" + ListCondOperator[index] + "] condition from: " + JSON.stringify(values));
        };
    }(it);
}

for (let it = 0; EachCondCondOperator[it] !== undefined; it++) {
    let op = EachCondCondOperator[it];
    PathExpressionBuilder.prototype[op] = function (index : number) {
        return function (cond : any) : ConditionBuilder {
            return new ConditionBuilder(new EachCondCond(this.path, index, CoerceToCondition(cond)));
        };
    }(it);
}

class ArrayExprBuilder implements Serializable {
    public arr : ArrayExpr;
    constructor(path : any) {
        this.arr = new ArrayExpr(CoerceToPath(path));
    }

    serialize() : any {
        return this.arr.serialize();
    }

    map(mapping : any) : ArrayExprBuilder {
        this.arr.ops.push(new MapOp(CoerceToMapOpMapping(mapping)));
        return this;
    }

    filter(cond : any) : ArrayExprBuilder {
        this.arr.ops.push(new FilterOp(CoerceToCondition(cond)));
        return this;
    }
}

for (let it = 0; ExprReducerOperator[it] !== undefined; it++) {
    let op = ExprReducerOperator[it];
    ArrayExprBuilder.prototype[op] = function (index : number) {
        return function (expr : any) : ExpressionBuilder {
            return new ExpressionBuilder(new ReducedExpr(this.arr, new ExprReducer(index, CoerceToExpression(expr))));
        };
    }(it);
}

class ConditionBuilder implements Serializable {
    public lhc : Condition;
    constructor(lhc_like : any) {
        this.lhc = CoerceToCondition(lhc_like);
    }

    serialize() : any {
        return this.lhc.serialize();
    }
}

for (let it = 0; NaryCondCondOperator[it] !== undefined; it++) {
    let op = NaryCondCondOperator[it];
    ConditionBuilder.prototype[op] = function (index : number) {
        return function (rhc : any) : ConditionBuilder {
            if (this.lhc.type !== ConditionType.nary_cond) {
                this.lhc = new NaryCondCond(index, [this.lhc, CoerceToCondition(rhc)]);
            } else {
                if (index === this.lhc.op) {
                    this.lhc.conds.push(CoerceToCondition(rhc));
                } else {
                    throw new Error("Can't concatenate [" + NaryCondCondOperator[index] + "] and [" + NaryCondCondOperator[this.lhc.op] + "] conditions");
                }
            }
            return this;
        };
    }(it);
}

class QueryBuilder {
    query : Query;
    constructor() {
        this.query = new Query();
    }

    map(mapping : any) : QueryBuilder {
        this.query.ops.push(new MapOp(CoerceToMapOpMapping(mapping)));
        return this;
    }

    filter(cond : any) : QueryBuilder {
        this.query.ops.push(new FilterOp(CoerceToCondition(cond)));
        return this;
    }

    concat(paths : any) : QueryBuilder {
        if (paths instanceof Array) {
            this.query.ops.push(new ConcatOp(paths.map((path) => CoerceToPath(path))));
            return this;
        }
        throw new Error("Can't build a concat operation from: " + JSON.stringify(paths));
    }

    reduce(keys_mapping : any, values_mapping : any) : QueryBuilder {
        this.query.ops.push(new ReduceOp(
            CoerceToReduceOpKeysMapping(keys_mapping),
            CoerceToReduceOpValuesMapping(values_mapping)
        ));
        return this;
    }
}

for (let it = 0; RangeOpOperator[it] !== undefined; it++) {
    let op = RangeOpOperator[it];
    QueryBuilder.prototype[op] = function (index : number) {
        return function (val : any) : QueryBuilder {
            if (typeof val === 'number'
                    && val === val // NaN
                    && val !== Infinity
                    && val !== -Infinity) {
                this.query.ops.push(new RangeOp(index, val));
                return this;
            }
            throw new Error("Can't build a range operation from: " + JSON.stringify(val));
        };
    }(it);
}
