import {Serializable, SerializationManager, register_serial} from './serial';
import {Expression, expr_serialization_manager} from './expression';

export enum ConditionType {
    binary_expr,
    nary_cond
};

export abstract class Condition implements Serializable {
    constructor(public type : ConditionType) {
    }
    abstract serialize() : any;
}

export let cond_serialization_manager = new SerializationManager<Condition>();

export enum BinaryExprCondOperator {
    gt,
    gte,
    lt,
    lte,
    eq,
    neq
};

@register_serial("cond:binary_expr", "1", cond_serialization_manager, {
    1: BinaryExprCond.Deserialize
})
export class BinaryExprCond extends Condition {
    constructor(public lhe : Expression, public op : BinaryExprCondOperator, public rhe : Expression) {
        super(ConditionType.binary_expr);
    }

    serialize() : any {
        return {
            lhe: this.lhe.serialize(),
            op: BinaryExprCondOperator[this.op],
            rhe: this.rhe.serialize()
        }
    }

    static Deserialize(input : any) : BinaryExprCond {
        return new BinaryExprCond(
            expr_serialization_manager.deserialize(input.lhe),
            BinaryExprCondOperator[<string>input.op],
            expr_serialization_manager.deserialize(input.rhe)
        );
    }
}

export enum NaryCondCondOperator {
    and,
    or
};

@register_serial("cond:nary_cond", "1", cond_serialization_manager, {
    1: NaryCondCond.Deserialize
})
export class NaryCondCond extends Condition {
    constructor(public op : NaryCondCondOperator, public conds : Array<Condition> = []) {
        super(ConditionType.nary_cond);
    }

    serialize() : any {
        return {
            type: NaryCondCondOperator[this.type],
            conds: this.conds.map((cond) => cond.serialize())
        }
    }

    static Deserialize(input : any) : NaryCondCond {
        return new NaryCondCond(
            NaryCondCondOperator[<string>input.type],
            input.conds.map((cond) => cond_serialization_manager.deserialize(cond))
        ); 
    }
}
