// TODO: nice error handling

export function register_serial<T>(
        name : string, 
        version : string,
        manager? : SerializationManager<T>, 
        deserialize_funcs? : { [version : string] : (input : any) => T }) {
    return function (target : Function) : any {
        let registered = function (...args) {
            target.apply(this, args);
        }
        registered.prototype = target.prototype;

        let old_serialize = registered.prototype.serialize;
        registered.prototype.serialize = function () : any {
            return {
                type: name,
                version: version,
                value: old_serialize.apply(this)
            }
        }

        if (manager) {
            manager.register(name, deserialize_funcs);
        }
        return registered;
    }
}

export interface Serializable {
    serialize() : any;
}

export class SerializationManager<T> {
    constructor(public map : { [name : string] : { [version : string] : (input : any) => T } } = {}) {
    }

    register(name: string, deserialize_funcs : { [version : string] : (input : any) => T }) {
        this.map[name] = deserialize_funcs;
    }

    deserialize(input : any) : T {
        return this.map[input.type][input.version](input.value);
    }
}
