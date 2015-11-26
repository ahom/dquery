/// <reference path="./serial.ts" />
/// <reference path="./document.ts" />

enum ExpressionType {
    value,
    path
};

abstract class Expression implements Serializable {
    constructor(public type : ExpressionType) {
    }
    abstract serialize() : any;
}

let expr_serialization_manager = new SerializationManager<Expression>();

@register_serial("expr:value", "1", expr_serialization_manager, {
    1: ValueExpr.Deserialize
})
class ValueExpr extends Expression {
    constructor(public value : any) {
        super(ExpressionType.value);
    }

    serialize() : any {
        return {
            value: this.value
        }
    }

    static Deserialize(input : any) : ValueExpr {
        return new ValueExpr(input.value);
    }
}

@register_serial("expr:path", "1", expr_serialization_manager, {
    1: PathExpr.Deserialize
})
class PathExpr extends Expression {
    constructor(public path : Path) {
        super(ExpressionType.path);
    }

    serialize() : any {
        return {
            path: this.path.serialize()
        }
    }

    static Deserialize(input : any) : PathExpr {
        return new PathExpr(
            Path.Deserialize(input.path)
        );
    }
}

