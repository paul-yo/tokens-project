import * as X from "./X.ts";

type TMatchableField = X.IOneField | X.ILassoField | X.IManyField | X.ISomeField;

/**
 * Attempts to apply the apex masks over the specified tape.
 */
export function applyApexMasks(tape: X.Tape, masks: readonly typeof X.Mask[])
{
	const apexCandidates = masks.map(m => m.schema);
	return applyMasks(tape, apexCandidates);
}

/**
 * Attempts to apply a mask from set of mask candidates
 * over the provided unread tape, sequentially, until the tape
 * has been fully exhausted.
 */
function applyMasks(tape: X.Tape, candidates: X.MaskSchema[])
{
	// There has to be an opportunity for there to be a field here
	// because this whole thing here about candidates and mask applying
	// might be trying to construct each of the fields for a mask
	
	const masks: X.Mask[] = [];
	
	next: for (const subTape of tape.read())
	{
		for (const maskSchema of candidates)
		{
			const maskResult = tryApplyMask(subTape, maskSchema);
			if (maskResult)
			{
				masks.push(...maskResult);
				continue next;
			}
		}
		
		console.error("Fragment could not be masked");
	}
	
	return masks;
}

/**
 * Attempts to apply a single mask to a tape.
 * Returns a boolean indicating whether the
 * tape has been fully covered by masks.
 */
function tryApplyMask(
	tape: X.TapeLike,
	maskSchema: X.MaskSchema,
	depth = 0)
{
	const matcher = maskSchema.enclosureIgnoringMatcher;
	if (!matcher)
		return null;
	
	const matchesArray = Array.from(matchAll(tape.charstring, matcher))
		.filter((m): m is RegExpMatchArray => !!m)
		.map(sanitizeMatches)
		.filter((m): m is TMatches => !!m);
	
	if (matchesArray.length === 0)
		return null;
	
	let masks: X.Mask[] | null = null;
	
	console.log(`${"  ".repeat(depth)}${maskSchema.type.name}, depth = ${depth}`);
	
	// Match the matcher regular expression against the charstring.
	// This handles both the case where current type is a sparse mask
	// and a non-sparse mask. Sparsity is already baked into the
	// computed regular expression at this point.
	// We have to go backwards because applying masks causes
	// the tape coordinates to move around, so if you go start to end
	// you'll have messed up coordinates, if you go end to start you
	// can dodge this.
	for (let i = -1; ++i < matchesArray.length;)
	{
		const mask = new (maskSchema.type as any)(); // 🫤
		const matches = matchesArray[i];
		
		for (const group of matches.groups)
		{
			const field = maskSchema.fields[group.name];
			
			// If there is a zero-length result then there is no point
			// in continuing we can just assign the field's default value.
			if (group.start === group.end)
			{
				mask[group.name] = getFieldDefaultValue(field);
				continue;
			}
			
			const lens = tape.slice(group.start, group.end);
			//if (field.description.startsWith("InfixedChainMask")) debugger;
			mask[group.name] = getFieldValue(lens, field, depth + 1);
		}
		
		const matchSpan = matches.to - matches.from;
		tape.applyMask(mask as X.Mask, matches.from, matches.to);
		
		// If the match span was > 1, then go through all masks that exist after 
		// the current one in the array and bump their index positions by the 
		// match span. The reason it's > 1 is because the mask itself is worth
		// one space in the underlying token sequence so the indexes aren't
		// actually affected unless the mask spans multiple tokens. The reason
		// we're doing it like this instead of just doing the mask application in
		// reverse order is because this causes arrays to be reversed downstream.
		if (matchSpan > 1)
		{
			for (let n = i + 1; n < matchesArray.length; n++)
			{
				const matches = matchesArray[i];
				matches.from -= matchSpan;
				matches.to -= matchSpan;
				
				for (const group of matches.groups)
				{
					group.start -= matchSpan;
					group.end -= matchSpan;
				}
			}
		}
		
		if (!masks)
			masks = [];
		
		masks.push(mask);
	}
	
	return masks;
}

/**
 * 
 */
function getFieldValue(tapeLike: X.TapeLike, field: X.TField, depth = 0)
{
	// It's easier to just special-case all the empties here to avoid
	// having to guard against a bunch of index-out-of-range
	// issues that will otherwise come up downstream.
	if (tapeLike.tokenSize === 0)
	{
		if (field.kind === "one" || field.kind === "lasso")
			return null;
		
		if (field.kind === "many" || field.kind === "some")
			return [];
		
		if (field.kind === "has")
			return false;
		
		if (field.kind === "raw")
			return "";
		
		throw 0;
	}
	
	if (field.kind === "raw")
		return ensure(tapeLike.at(0), X.RawToken);
	
	if (field.kind === "has")
		return field.match.every((fixed, i) => tapeLike.at(i) === fixed);
	
	// ---------------------------------------------
	// FIELD-LEVEL TAPE UNWRAPPING
	// ---------------------------------------------
	// If the field has a required enclosure, then this check will unwrap that
	// enclosure and give us the original tape. It also returns null if we don't
	// actually have a tape and a tape was required, although according to my
	// current understanding this actually should create an unknown state
	// because if we got to this point, it obviously means that the tape matched
	// and if the tape matched then how do we not have an enclosure in the
	// expected location?
	let unwrapped = false;
	if (field.data.enclosure !== X.Enclosure.none)
	{
		// If the first element of the tape isn't another tape,
		// then there is nothing to recurse into so just quit.
		const innerTape = tapeLike.at(0);
		if (!(innerTape instanceof X.Tape))
			return null;
		
		// If the enclosure of the tape we're looking at doesn't match
		// the enclosure that's required then quit.
		if (innerTape.enclosure !== field.data.enclosure)
			return null;
	
		tapeLike = innerTape;
		unwrapped = true;
	}
	
	if (field.data.matchesOnlyFlexes)
		return getMatchFieldValueOnlyFlex(tapeLike, field);
	
	if (field.data.matchesOnlySelects)
		return getMatchFieldValueOnlySelect(tapeLike, field);
	
	if (field.kind === "one")
	{
		// The tape is expected to be element item long.
		return getMatchFieldValue(tapeLike, field, depth);
	}
	
	if (field.kind === "lasso")
		return ensureNotNull(getMatchFieldValue(tapeLike, field, depth));
	
	if (field.kind === "many" || field.kind === "some")
	{
		// If the tapeLike is actually a tape, then that makes that the Tape
		// has not been read into fragments, and so we need to do that.
		if (tapeLike instanceof X.Tape)
		{
			const array: any[] = [];
			for (const subTape of tapeLike.read())
			{
				const value = getMatchFieldValue(subTape, field, depth);
				if (value)
					array.push(value);
			}
			return array;
		}
		else
		{
			const result = getMatchFieldValue(tapeLike, field, depth);
			return result;
		}
	}
	
	throw 0;
}

/**
 * 
 */
function getMatchFieldValue(tapeLike: X.TapeLike, field: TMatchableField, depth = 0)
{
	// Go through each match possibility, and try to fit the tape in it's entirety
	// into it, breaking when the first match becomes successful.
	for (const match of field.match)
	{
		if (X.Mask.isType(match))
		{
			const e = tapeLike.at(0);
			if (e instanceof match)
				return e;
			
			const unmaskedTokenCountBefore = tapeLike.unmaskedTokenCount;
			const result = tryApplyMask(tapeLike, match.schema, depth + 1);
			if (result === null)
				continue;
			
			if (tapeLike.unmaskedTokenCount > 0)
			{
				if (tapeLike.unmaskedTokenCount === unmaskedTokenCountBefore)
					throw "Unknown state? How did we get a result if nothing was masked?";
				
				// If we still have unmasked tokens, then that means we need to take
				// another run at the next match to keep matching things.
				continue;
			}
			
			return result;
		}
		else if (X.FlexToken.isType(match))
		{
			const e = tapeLike.at(0);
			if (e instanceof match)
				return e;
		}
		else if (X.isSelectMatch(match))
		{
			const e = tapeLike.at(0);
			if (X.isSelectMatchMember(e, match))
				return e;
		}
	}
	
	return null;
}

/**
 * Optimization path that deals exclusively with fields that only match with flex tokens.
 */
function getMatchFieldValueOnlyFlex(tapeLike: X.TapeLike, field: TMatchableField)
{
	const matches = field.match as typeof X.FlexToken[];
	if (X.DEBUG)
		if (!matches.every(m => X.FlexToken.isType(m)))
			throw "Unknown state";
	
	if (field.kind === "one")
	{
		const e = tapeLike.at(0);
		for (const match of matches)
			if (e instanceof match)
				return e;
	}
	else if (field.kind === "many" || field.kind === "some")
	{
		// Go through the entire tape and return an array 
		// containing all the flex tokens that match.
		const array: X.FlexToken[] = [];
		
		for (const token of tapeLike.walk())
			for (const match of matches)
				if (token instanceof match)
					array.push(token);
		
		return array;
	}
	else if (field.kind === "lasso")
		throw "Not implemented.";
}

/**
 * 
 */
function getMatchFieldValueOnlySelect(tapeLike: X.TapeLike, field: TMatchableField)
{
	const matches = field.match as X.TSelect[];
	if (X.DEBUG)
		if (!matches.every(m => X.isSelectMatch(m)))
			throw "Unknown state";
	
	if (field.kind === "one")
	{
		const e = tapeLike.at(0);
		for (const match of matches)
			if (X.isSelectMatchMember(e, match))
				return e;
	}
	else if (field.kind === "many" || field.kind === "some")
	{
		const array: X.FixedToken[] = [];
		
		for (const token of tapeLike.walk())
			for (const match of matches)
				if (X.isSelectMatchMember(token, match))
					array.push(token as X.FixedToken);
		
		return array;
	}
	else if (field.kind === "lasso")
		throw "Not implemented.";
}


/** Safe matchAll function that avoids exceptions being thrown */
function * matchAll(input: string, pattern: RegExp)
{
	if (!pattern.flags.includes("g"))
		yield input.match(pattern);
	
	else for (const matches of input.matchAll(pattern))
		yield matches;
}

/** */
type TMatches = {
	groups: TMatchedGroup[];
	from: number;
	to: number;
};

/** */
type TMatchedGroup = {
	name: string;
	start: number;
	end: number;
};

/**
 * Normalizes a single RegExpMatchArray (with indices) into a clean,
 * duplication-free structure: the per-field spans (named groups only,
 * skipping any that didn't participate in this match), plus the overall
 * span of the match as a whole (group 0), which covers any unnamed/
 * structural tokens the named groups don't account for.
 */
function sanitizeMatches(matches: RegExpMatchArray): TMatches | null
{
	if (!matches.indices)
		return null;
	
	const wholeMatch = matches.indices[0];
	if (!wholeMatch)
		return null;
	
	const [from, to] = wholeMatch;
	const fields: TMatchedGroup[] = [];
	
	if (matches.indices.groups)
	{
		for (const [name, span] of Object.entries(matches.indices.groups))
		{
			if (!span)
				continue;
			
			const [start, end] = span;
			fields.push({ name, start, end });
		}
	}
	
	return { groups: fields, from, to };
}

/** */
function getFieldDefaultValue(field: X.TField)
{
	switch (field.kind)
	{
		case "has": return false;
		case "lasso": return null;
		case "one": return null;
		case "many": return [];
		case "some": return [];
		case "raw": return null;
	}
	
	throw 0;
}

/** */
function ensure<T extends abstract new (...args: any[]) => any>(
	value: unknown, 
	kind: T): InstanceType<T>
{
	if (!(value instanceof kind))
		throw new Error("Value is not of the appropriate type.");
	
	return value as InstanceType<T>;
}

/** */
function ensureNotNull<T>(value: T | null | undefined): T
{
	if (value === null || value === undefined)
		throw new Error("Value must not be null or undefined");
	
	return value;
}
