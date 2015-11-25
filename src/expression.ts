import {Serializable, SerializationManager, register_serial} from './serial';
import {Path} from './document';

export enum ExpressionType {
    value,
    path
};

export abstract class Expression implements Serializable {
    constructor(public type : ExpressionType) {
    }
    abstract serialize() : any;
}

export let expr_serialization_manager = new SerializationManager<Expression>();

@register_serial("expr:value", "1", expr_serialization_manager, {
    1: ValueExpr.Deserialize
})
export class ValueExpr extends Expression {
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
export class PathExpr extends Expression {
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

