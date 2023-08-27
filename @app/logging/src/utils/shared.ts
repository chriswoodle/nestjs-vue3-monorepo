export const isObject = (fn: any): fn is object =>
    !!fn && typeof fn === 'object';

export const isPlainObject = (fn: any): fn is object => {
    if (!isObject(fn)) {
        return false;
    }
    const proto = Object.getPrototypeOf(fn);
    if (proto === null) {
        return true;
    }
    const ctor =
        Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
        proto.constructor;
    return (
        typeof ctor === 'function' &&
        ctor instanceof ctor &&
        Function.prototype.toString.call(ctor) ===
        Function.prototype.toString.call(Object)
    );
};