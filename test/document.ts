/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/helpers.ts" />

describe('Path', () => {
    it('should be appendable', () => {
        expect(p('append').append(p('path'))).toEqual(p('append.path'));
    });
    it('should be splitable', () => {
        expect(p('a.splitted.path').split()).toEqual(['a', 'splitted', 'path']);
    });
    it('should be serializable', () => {
        expect(Path.Deserialize(p('a.splitted.path').serialize())).toEqual(p('a.splitted.path'));
    });
    it('should allow starts_with', () => {
        expect(p('a.long.path').starts_with(p('a'))).toBeTruthy();
        expect(p('a.long.path').starts_with(p('a.long.path'))).toBeTruthy();
        expect(p('a.long.path').starts_with(p('b'))).toBeFalsy();
        expect(p('a.long.path').starts_with(p('a.long.path.really'))).toBeFalsy();
    });
});


