type VersionMapping = { [version : string] : (input : any) => any };
type TypeVersionMapping = { [name : string] : VersionMapping };

interface Serializable {
    serialize() : any;
}

class SerializationManager {
    constructor(public map : TypeVersionMapping = {}) {
    }

    register(name: string, deserialize_funcs : VersionMapping) {
        this.map[name] = deserialize_funcs;
    }

    deserialize_any(input : any) : any {
        let obj = JSON.parse(input);
        return this.map[obj.type][obj.version](obj.value);
    }
}

let serialization_manager = new SerializationManager();

function register_serial(
        name : string, 
        version : string,
        deserialize_funcs : VersionMapping) {
    return function (target : Function) : any {
        let registered = function (...args) {
            target.apply(this, args);
        }
        registered.prototype = target.prototype;

        let old_serialize = registered.prototype.serialize;
        registered.prototype.serialize = function () : string {
            return JSON.stringify({
                type: name,
                version: version,
                value: old_serialize.apply(this)
            });
        }
        serialization_manager.register(name, deserialize_funcs);
        return registered;
    }
}
