/// <reference path="./serial.ts" />
/// <reference path="./operation.ts" />

let query_serialization_manager = new SerializationManager<Query>();

@register_serial("query", "1", query_serialization_manager, {
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
        return new Query(input.ops.map((op) => op_serialization_manager.deserialize(op)));
    }
}

