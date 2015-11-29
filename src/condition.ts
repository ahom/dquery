/// <reference path="./expression.ts" />

enum ConditionType {
    binary_expr,
    nary_cond,
    like,
    exists,
    list,
    each_cond
};

abstract class Condition implements Serializable {
    constructor(public type : ConditionType) {
    }
    abstract serialize() : any;
}

function deserialize_cond(input : any) : Condition {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof Condition) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize Condition from: " + JSON.stringify(deserialized_any));
}

enum BinaryExprCondOperator {
    gt,
    gte,
    lt,
    lte,
    eq,
    neq
};

@register_serial("cond:binary_expr", "1", {
    1: BinaryExprCond.Deserialize
})
class BinaryExprCond extends Condition {
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
            deserialize_expr(input.lhe),
            BinaryExprCondOperator[<string>input.op],
            deserialize_expr(input.rhe)
        );
    }
}

enum NaryCondCondOperator {
    and,
    or
};

@register_serial("cond:nary_cond", "1", {
    1: NaryCondCond.Deserialize
})
class NaryCondCond extends Condition {
    constructor(public op : NaryCondCondOperator, public conds : Array<Condition> = []) {
        super(ConditionType.nary_cond);
    }

    serialize() : any {
        return {
            op: NaryCondCondOperator[this.op],
            conds: this.conds.map((cond) => cond.serialize())
        }
    }

    static Deserialize(input : any) : NaryCondCond {
        return new NaryCondCond(
            NaryCondCondOperator[<string>input.op],
            input.conds.map((cond) => deserialize_cond(cond))
        ); 
    }
}

@register_serial("cond:like", "1", {
    1: LikeCond.Deserialize
})
class LikeCond extends Condition {
    constructor(public path : Path, public regex : string) {
        super(ConditionType.like);
    }

    serialize() : any {
        return {
            path: this.path.serialize(),
            regex: this.regex
        }
    }

    static Deserialize(input : any) : LikeCond {
        return new LikeCond(
            Path.Deserialize(input.path),
            input.regex
        );
    }
}

enum ListCondOperator {
    in,
    nin
};

@register_serial("cond:list", "1", {
    1: ListCond.Deserialize
})
class ListCond extends Condition {
    constructor(public path : Path, public op : ListCondOperator, public values : Array<Value>) {
        super(ConditionType.list);
    }

    serialize() : any {
        return {
            path: this.path.serialize(),
            op: ListCondOperator[this.op],
            values: this.values.map((val) => val.serialize())
        }
    }

    static Deserialize(input : any) : ListCond {
        return new ListCond(
            Path.Deserialize(input.path),
            ListCondOperator[<string>input.op],
            input.values.map((val) => Value.Deserialize(val))
        );
    }
}

@register_serial("cond:exists", "1", {
    1: ExistsCond.Deserialize
})
class ExistsCond extends Condition {
    constructor(public path : Path) {
        super(ConditionType.exists);
    }

    serialize() : any {
        return this.path.serialize();
    }

    static Deserialize(input : any) : ExistsCond {
        return new ExistsCond(Path.Deserialize(input));
    }
}

enum EachCondCondOperator {
    any,
    all
};

@register_serial("cond:each_cond", "1", {
    1: EachCondCond.Deserialize
})
class EachCondCond extends Condition {
    constructor(public path : Path, public op : EachCondCondOperator, public cond : Condition) {
        super(ConditionType.each_cond);
    }

    serialize() : any {
        return {
            path: this.path.serialize(),
            op: EachCondCondOperator[this.op],
            cond: this.cond.serialize()
        }
    }

    static Deserialize(input : any) : EachCondCond {
        return new EachCondCond(
            Path.Deserialize(input.path),
            EachCondCondOperator[<string>input.op],
            deserialize_cond(input.cond)
        );
    }
}
