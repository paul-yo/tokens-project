/**
 * A Map of the generic key and value types.
 * Supports keys that refer to multiple values stored in a Set.
 */
export class MapSet<TKey, TVal>
{
	/** */
	*[Symbol.iterator]()
	{
		for (const entry of this.map)
			yield entry;
	}

	/** */
	entries()
	{
		return this.map.entries();
	}

	/** */
	get(key: TKey)
	{
		return this.map.get(key);
	}

	/** */
	has(key: TKey, value?: TVal)
	{
		const values = this.get(key);
		if (!values)
			return false;

		if (value !== undefined)
			return values.has(value);

		return true;
	}

	/** */
	add(key: TKey, value: TVal)
	{
		if (value)
		{
			const values = this.get(key);
			if (values)
			{
				values.add(value);
			}
			else
			{
				this.map.set(key, new Set([value]));
			}
		}

		return this;
	}

	/** */
	delete(key: TKey, value?: TVal)
	{
		if (value === undefined)
			return !!this.map.delete(key);

		const storedValues = this.map.get(key);
		if (storedValues === undefined)
			return false;

		const deleted = storedValues.delete(value);

		if (storedValues.size === 0)
			this.map.delete(key);

		return deleted;
	}

	/** */
	clear()
	{
		this.map.clear();
	}

	/** */
	values()
	{
		return this.map.values();
	}

	/** */
	get size()
	{
		return this.map.size;
	}

	/** */
	private map = new Map<TKey, Set<TVal>>();
}