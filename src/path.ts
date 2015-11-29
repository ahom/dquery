/// <reference path="./serial.ts" />

class Path implements Serializable {
    constructor(public raw : string = "") {
    }

    serialize() : string {
        return this.raw
    }

    static Deserialize(input : string) : Path {
        return new Path(input);
    }

    split() : Array<string> {
        return (this.raw.length > 0 ? this.raw.split('.') : []);
    }

    append(other_path : Path) : Path {
        return new Path(this.raw + (this.raw.length > 0 ? "." : "") + other_path.raw);
    }

    starts_with(other_path : Path) : boolean {
        let this_comps = this.split();
        let other_comps = other_path.split();

        if (this_comps.length < other_comps.length) {
            return false;
        } else {
            return other_comps.every((el, idx) => el === this_comps[idx]);
        }
    }
}
