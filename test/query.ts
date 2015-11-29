/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/query.ts" />

describe('query', () => {
    it('should be serializable', () => {
        let qry = new Query([
            new MapOp(new MapOpMapping(
                {
                    test: new PathExpr(new Path('a.path.expr')),
                    other_test: new ValueExpr(new Value(0)),
                    embed: {
                        for: {
                            ever: new ValueExpr(new Value(true))
                        }
                    }
                }
            ))
        ]);
        expect(deserialize_query(qry.serialize())).toEqual(qry);
    });
});
