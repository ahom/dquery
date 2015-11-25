import {p} from '../src/helpers';

describe('Path', function() {
    it('should be appendable', function () {
        expect(p('append').append(p('path'))).toEqual(p('append.path'));
    });
});


