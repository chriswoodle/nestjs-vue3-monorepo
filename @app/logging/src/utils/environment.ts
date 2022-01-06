import { str, envsafe, port } from 'envsafe';

export const pkg = require('../../package.json');

export const env = envsafe({
    DEBUG: str({
        desc: 'Debug prefix'
    }),
});
