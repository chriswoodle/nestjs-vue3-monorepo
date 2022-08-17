import { str, envsafe, port, bool} from 'envsafe';
export const pkg = require('../../package.json');

export const env = envsafe({
    NODE_ENV: str({
        devDefault: 'development',
        choices: ['development', 'test', 'production'],
    }),
    PORT: port({
        devDefault: 3000,
        desc: 'The port the app is running on',
        example: 80,
    }),
    DEBUG: str({
        allowEmpty: true,
        devDefault: 'app*',
        desc: 'Debug prefix'
    }),
    GENERATE_SPEC: bool({
        default: false
    })
});
