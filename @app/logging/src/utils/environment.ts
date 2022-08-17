import { str, envsafe, port } from 'envsafe';

export const pkg = require('../../package.json');

export const env = envsafe({
    DEBUG: str({
        allowEmpty: true,
        devDefault: 'app*',
        desc: 'Debug prefix'
    }),
});
