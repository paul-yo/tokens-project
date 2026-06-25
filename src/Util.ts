
export const DEBUG: true = true;

/** */
export type TWritable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * Walks the inheritance chain of a class constructor.
 * @param constructor - The Mask class/constructor to inspect.
 * @returns An array of constructors starting from the class itself up to the root.
 */
export function getInheritanceChain<T extends abstract new (...args: any[]) => any>(constructor: T): T[]
{
	const chain: any[] = [];
	let current: any = constructor;
	
	// Iterate until we hit the base Function/Object prototype
	while (current && current !== Function.prototype && current !== Object.prototype)
	{
		chain.push(current);
		current = Object.getPrototypeOf(current);
	}
	
	return chain;
}

/**
 * Wraps the specified value in an array if it is not in one already.
 */
export function toArray<T>(maybeArray: T | T[]): T[]
{
	return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

/** */
export function toArrayExtracted<T>(array: T[], fn: (item: T) => boolean): [T[], T[]]
{
	const trueSet: T[] = [];
	const falseSet: T[] = [];
	
	for (let i = -1; ++i < array.length;)
	{
		const item = array[i];
		const target = fn(item) ? trueSet : falseSet;
		target.push(item);
	}
	return [trueSet, falseSet]
}

/** */
type AbstractConstructor = abstract new (...args: any[]) => unknown;

type InstanceOf<T extends AbstractConstructor> = 
	T extends abstract new (...args: any[]) => infer I ? I : never;

export type ToSum<T extends readonly AbstractConstructor[]> = 
	InstanceOf<T[number]>;
