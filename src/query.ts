/// <reference path="./operation.ts" />

function deserialize_query(input : any) : Query {
    let deserialized_any = serialization_manager.deserialize_any(input);
    if (deserialized_any instanceof Query) {
        return deserialized_any;
    }
    throw new Error("Can't deserialize Query from: " + JSON.stringify(deserialized_any));
}

@register_serial("query", "1", {
    1: Query.Deserialize
})
class Query implements Serializable {
    constructor(public ops : Array<Operation> = []) {
    }

    serialize() : any {
        return {
            ops: this.ops.map((op) => op.serialize())
        }
    }
    
    static Deserialize(input : any) : Query {
        return new Query(input.ops.map((op) => deserialize_op(op)));
    }
}

