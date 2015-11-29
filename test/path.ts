/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/path.ts" />

describe('path', () => {
    let p = function (path : string) : Path {
        return new Path(path);
    };

    it('should be appendable', () => {
        expect(p('my.path').append(p('appended'))).toEqual(p('my.path.appended'));
    });
    it('should be splitable', () => {
        expect(p('my.splited.path').split()).toEqual(['my', 'splited', 'path']);
        expect(p('my').split()).toEqual(['my']);
        expect(p('').split()).toEqual([]);
    });
    it('should know if it starts_with', () => {
        expect(p('my.path').starts_with(p(''))).toBeTruthy();
        expect(p('my.path').starts_with(p('my'))).toBeTruthy();
        expect(p('my.path').starts_with(p('my.path'))).toBeTruthy();

        expect(p('my.path').starts_with(p('my.path.toolong'))).toBeFalsy();
        expect(p('my.path').starts_with(p('the'))).toBeFalsy();
        expect(p('my.path').starts_with(p('the.path'))).toBeFalsy();
    });
});
