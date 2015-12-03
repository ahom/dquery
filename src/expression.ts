/// <reference path="./path.ts" />
/// <reference path="./value.ts" />
/// <reference path="./reducer.ts" />
/// <reference path="./operation.ts" />

enum ExpressionType {
    value,
    path,
    nary_expr,
    reducer
};

abstract class Expression implements Serializable {
    constructor(public type : ExpressionType) {
    }
    abstract serialize() : any;
}

function deserialize_expr(input : any) : Expression {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof Expression) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize Expression from: " + JSON.stringify(deserialized_any));
}

@register_serial("expr:value", "1", {
    1: ValueExpr.Deserialize
})
class ValueExpr extends Expression {
    constructor(public value : Value) {
        super(ExpressionType.value);
    }

    serialize() : any {
        return this.value.serialize();
    }

    static Deserialize(input : any) : ValueExpr {
        return new ValueExpr(Value.Deserialize(input));
    }
}

@register_serial("expr:path", "1", {
    1: PathExpr.Deserialize
})
class PathExpr extends Expression {
    constructor(public path : Path) {
        super(ExpressionType.path);
    }

    serialize() : any {
        return this.path.serialize();
    }

    static Deserialize(input : any) : PathExpr {
        return new PathExpr(Path.Deserialize(input));
    }
}

enum NaryExprExprOperator {
    add,
    sub,
    mul,
    div
};

@register_serial("expr:nary_expr", "1", {
    1: NaryExprExpr.Deserialize
})
class NaryExprExpr extends Expression {
    constructor(public op : NaryExprExprOperator, public exprs : Array<Expression> = []) {
        super(ExpressionType.nary_expr);
    }

    serialize() : any {
        return {
            op: NaryExprExprOperator[this.op],
            exprs: this.exprs.map((expr) => expr.serialize())
        }
    }

    static Deserialize(input : any) : NaryExprExpr {
        return new NaryExprExpr(
            NaryExprExprOperator[<string>input.op],
            input.exprs.map((expr) => deserialize_expr(expr))
        );
    }
}

type ArrayExprOperation = MapOp | FilterOp;

function deserialize_array_expr(input : any) : ArrayExpr {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof ArrayExpr) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize ArrayExpr from: " + JSON.stringify(deserialized_any));
}

@register_serial("expr:array", "1", {
    1: ArrayExpr.Deserialize
})
class ArrayExpr implements Serializable {
    constructor(public alias : string, public path : Path, public ops : Array<ArrayExprOperation> = []) {
    }

    serialize() : any {
        return {
            alias: this.alias,
            path: this.path.serialize(),
            ops: this.ops.map((op) => op.serialize())
        }
    }

    static Deserialize(input : any) : ArrayExpr {
        return new ArrayExpr(
            input.alias,
            Path.Deserialize(input.path),
            input.ops.map((op) => deserialize_op(op))
        );
    }
}

@register_serial("expr:reduced", "1", {
    1: ReducedExpr.Deserialize
})
class ReducedExpr extends Expression {
    constructor(public arr : ArrayExpr, public red : Reducer) {
        super(ExpressionType.reducer);
    }

    serialize() : any {
        return {
            arr: this.arr.serialize(),
            red: this.red.serialize()
        }
    }

    static Deserialize(input : any) : ReducedExpr {
        return new ReducedExpr(
            deserialize_array_expr(input.arr),
            deserialize_red(input.red)
        );
    }
}
