type ValueTypes = Date | number | boolean | string;

class Value implements Serializable {
    constructor(public val : ValueTypes) {
    }

    serialize() : any {
        if (this.val instanceof Date) {
            let date : Date = <Date>(this.val);
            return {
                datetime: date.toJSON()
            }
        }
        return this.val;
    }

    static Deserialize(input : any) : Value {
        if (typeof input === 'number' 
                || typeof input === 'string'
                || typeof input === 'boolean') {
            return new Value(input);
        } else if (input.datetime !== undefined) {
            return new Value(new Date(input.datetime));
        }
        throw new Error("Can't deserialize to Value from: " + JSON.stringify(input));
    }
}
