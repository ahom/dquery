import {Serializable, SerializationManager, register_serial} from './serial';

export enum OperationType {
    map
};

export abstract class Operation implements Serializable {
    constructor(public type : OperationType) {
    }
    abstract serialize() : any;
}

export let op_serialization_manager = new SerializationManager<Operation>();

@register_serial("op:map", "1", op_serialization_manager, {
    1: MapOp.Deserialize
})
export class MapOp extends Operation {
    constructor(public map : Object = {}) {
        super(OperationType.map);
    }

    // TODO
    serialize() : Object {
        return {};
    }

    // TODO
    static Deserialize(input : Object) : MapOp {
        return new MapOp();
    }
}

