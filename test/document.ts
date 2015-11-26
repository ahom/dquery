/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/helpers.ts" />


describe('Path', () => {
    it('should be appendable', () => {
        expect(p('append').append(p('path'))).toEqual(p('append.path'));
    });
    it('should be splitable', () => {
        expect(p('a.splitted.path').split()).toEqual(['a', 'splitted', 'path']);
    })
});


