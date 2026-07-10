export declare const DEBUG: true;
/** */
export type TWritable<T> = {
    -readonly [K in keyof T]: T[K];
};
/**
 * Walks the inheritance chain of a class constructor.
 * @param constructor - The Mask class/constructor to inspect.
 * @returns An array of constructors starting from the class itself up to the root.
 */
export declare function getInheritanceChain<T extends abstract new (...args: any[]) => any>(constructor: T): T[];
/**
 * Wraps the specified value in an array if it is not in one already.
 */
export declare function toArray<T>(maybeArray: T | T[]): T[];
/** */
export declare function toArrayExtracted<T>(array: T[], fn: (item: T) => boolean): [T[], T[]];
/** */
type AbstractConstructor = abstract new (...args: any[]) => unknown;
type InstanceOf<T extends AbstractConstructor> = T extends abstract new (...args: any[]) => infer I ? I : never;
export type ToSum<T extends readonly AbstractConstructor[]> = InstanceOf<T[number]>;
export {};
