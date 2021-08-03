import { str, envsafe, port} from 'envsafe';
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
        devDefault: 'app*',
        desc: 'Debug prefix'
    }),
});
