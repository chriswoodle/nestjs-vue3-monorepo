import * as path from 'path';
import debug from 'debug';
import './utils/environment'

export function createBasicLogger(packageName: string, _path: string, scope?: string) {
    return debug(`${packageName}:${path.basename(_path)}${scope ? ':' + scope : ''}`)
}