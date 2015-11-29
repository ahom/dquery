/// <reference path="./condition.ts" />

enum OperationType {
    map,
    filter,
    concat,
    range,
    reduce
};

abstract class Operation implements Serializable {
    constructor(public type : OperationType) {
    }
    abstract serialize() : any;
}

function deserialize_op(input : any) : Operation {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof Operation) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize Operation from: " + JSON.stringify(deserialized_any));
}

class Mapping implements Serializable {
    constructor(public map : any, public is_leaf : (input : any) => boolean) {
    }

    _serialize_map(obj : any, out : any = {}, prefix : Path = new Path()) : any {
        Object.keys(obj).forEach((key) => {
            if (this.is_leaf(obj[key])) {
                out[prefix.append(new Path(key)).serialize()] = obj[key].serialize();
            } else {
                this._serialize_map(obj[key], out, prefix.append(new Path(key)));
            }
        });
        return out;
    }

    serialize() : any {
        return this._serialize_map(this.map);
    }

    static Deserialize(input : any, is_leaf : (input : any) => boolean) {
        let map = {};
        Object.keys(input).forEach((key) => {
            let deserialized_any = serialization_manager.deserialize_any(input[key]);
            if (!(is_leaf(deserialized_any))) {
                throw new Error("Can't deserialize expression in mapping from: " + JSON.stringify(deserialized_any));
            }
            let current_obj = map;
            let current_comp = undefined;
            Path.Deserialize(key).split().forEach((path_comp) => {
                if (current_comp !== undefined) {
                    if (current_obj[current_comp] === undefined) {
                        current_obj[current_comp] = {};
                    }
                    current_obj = current_obj[current_comp];
                }
                current_comp = path_comp;
            });
            current_obj[current_comp] = deserialized_any;
        });
        return new Mapping(map, is_leaf);
    }
}

function is_map_op_leaf(input : any) : boolean {
    return input instanceof Expression || input instanceof ArrayExpr;
}

class MapOpMapping extends Mapping {
    constructor(mapop_mapping : any) {
        super(mapop_mapping, is_map_op_leaf);
    }

    static Deserialize(input : any) : MapOpMapping {
        return new MapOpMapping(Mapping.Deserialize(input, is_map_op_leaf).map);
    }
}

@register_serial("op:map", "1", {
    1: MapOp.Deserialize
})
class MapOp extends Operation {
    constructor(public map : MapOpMapping) {
        super(OperationType.map);
    }

    serialize() : any {
        return this.map.serialize();
    }

    static Deserialize(input : any) : MapOp {
        return new MapOp(MapOpMapping.Deserialize(input));
    }
}

@register_serial("op:filter", "1", {
    1:FilterOp.Deserialize
})
class FilterOp extends Operation {
    constructor(public cond : Condition) {
        super(OperationType.filter);
    }

    serialize() : any {
        return this.cond.serialize();
    }

    static Deserialize(input : any) : FilterOp {
        return new FilterOp(deserialize_cond(input));
    }
}

@register_serial("op:concat", "1", {
    1: ConcatOp.Deserialize
})
class ConcatOp extends Operation {
    constructor(public paths : Array<Path>) {
        super(OperationType.concat);
    }

    serialize() : any {
        return this.paths.map((path) => path.serialize());
    }

    static Deserialize(input : any) : ConcatOp {
        return new ConcatOp(input.map((path) => Path.Deserialize(path)));
    }
}

enum RangeOpOperator {
    skip,
    limit
};

@register_serial("op:range", "1", {
    1: RangeOp.Deserialize
})
class RangeOp extends Operation {
    constructor(public op : RangeOpOperator, public val : number) {
        super(OperationType.range);
    }

    serialize() : any {
        return {
            op: RangeOpOperator[this.op],
            val: this.val
        };
    }

    static Deserialize(input : any) : RangeOp {
        return new RangeOp(
            RangeOpOperator[<string>input.op],
            input.val
        );
    }
}

function is_reduce_op_keys_leaf(input : any) : boolean {
    return input instanceof Expression;
}

class ReduceOpKeysMapping extends Mapping {
    constructor(keys_mapping : any) {
        super(keys_mapping, is_reduce_op_keys_leaf);
    }

    static Deserialize(input : any) : ReduceOpKeysMapping {
        return new ReduceOpKeysMapping(Mapping.Deserialize(input, is_reduce_op_keys_leaf).map);
    }
}

function is_reduce_op_values_leaf(input : any) : boolean {
    return input instanceof Reducer;
}

class ReduceOpValuesMapping extends Mapping {
    constructor(values_mapping : any) {
        super(values_mapping, is_reduce_op_values_leaf);
    }

    static Deserialize(input : any) : ReduceOpValuesMapping {
        return new ReduceOpValuesMapping(Mapping.Deserialize(input, is_reduce_op_values_leaf).map);
    }
}

@register_serial("op:reduce", "1", {
    1: ReduceOp.Deserialize
})
class ReduceOp extends Operation {
    constructor(public keys : ReduceOpKeysMapping, public values : ReduceOpValuesMapping) {
        super(OperationType.reduce);
    }

    serialize() : any {
        return {
            keys: this.keys.serialize(), 
            values: this.values.serialize()
        };
    }

    static Deserialize(input : any) : ReduceOp {
        return new ReduceOp(
            ReduceOpKeysMapping.Deserialize(input.keys),
            ReduceOpValuesMapping.Deserialize(input.values)
        );
    }
}
