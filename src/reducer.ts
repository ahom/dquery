/// <reference path="./expression.ts" />

enum ReducerType {
    expr
};

abstract class Reducer implements Serializable {
    constructor(public type : ReducerType) {
    }
    abstract serialize() : any;
}

function deserialize_red(input : any) : Reducer {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof Reducer) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize Reducer from: " + JSON.stringify(deserialized_any));
}

enum ExprReducerOperator {
    sum,
    avg,
    count,
    min,
    max
}

@register_serial("red:expr", "1", {
    1: ExprReducer.Deserialize
})
class ExprReducer extends Reducer {
    constructor(public op : ExprReducerOperator, public expr : Expression) {
        super(ReducerType.expr);
    }

    serialize() : any {
        return {
            op : ExprReducerOperator[this.op],
            expr: this.expr.serialize()
        }
    }

    static Deserialize(input : any) : ExprReducer {
        return new ExprReducer(
            ExprReducerOperator[<string>input.op],
            deserialize_expr(input.expr)
        );
    }
}

