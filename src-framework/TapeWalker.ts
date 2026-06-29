import * as X from "./X.ts";

interface Vertebra
{
	readonly mask: X.Mask;
	
	/**
	 * Stores the index of the mask object in it's containing array.
	 * If the mask is not stored in an array field, this value is -1.
	 * Testing whether .index < 0 is a handy way to disambiguate
	 * quickly between masks inside array and non-array fields.
	 */
	readonly index: number;
	
	/**
	 * Stores a reference to the TField schema object that describes
	 * the field in which this vertebra passes through.
	 */
	readonly schemaField: X.TField;
}

interface ICursor
{
	/**
	 * Stores a bottom-up array of each Vertebra which stores
	 * the path to where the cursor is currently pointing in the tape walk.
	 * When at the very top level, the spine will be an empty array.
	 * When at nested levels, spine[0] always stores the immediate
	 * parent, and spine.at(-1) always stores the root vertebra.
	 */
	readonly spine: readonly Vertebra[];
	
	/**
	 * Stores a pointer to the Mask of interest of the cursor. To get the
	 * surrounding meta information about that Mask of interest, use
	 * spine[0] or more successive vertebra of the spine if information
	 * higher up the chain is needed.
	 */
	readonly element: X.Mask;
	
	readonly isAscending: boolean;
}

/** */
type WalkDirective =
	// recurse into children, continue normally
	void |
	// don't visit children, continue to next sibling
	"skip" |
	// halt the entire walk
	"stop";

/**
 * Performs a full walk of the Mask objects that have been layered over the specified Tape.
 * The traversal does not visit tokens or other non-mask values that reside in properties
 * inside Mask objects.
 */
export function walkTape(tape: X.Tape, visitFn: (cursor: ICursor) => WalkDirective)
{
	walkTapeInner(tape, [], visitFn);
}

/**
 * Walks a single Tape (recursing into any child Tapes found within
 * the tokensCovered of its masks, per the directive returned for
 * that mask), at whatever spine depth it was reached.
 * 
 * Returns "stop" if the callback requested that the entire walk
 * halt, in which case the caller must stop iterating and propagate
 * "stop" further up. Returns void otherwise.
 */
function walkTapeInner(
	tape: X.Tape,
	spine: readonly Vertebra[],
	visitFn: (cursor: ICursor) => WalkDirective): "stop" | void
{
	for (const tapeCursor of tape.walkCursor())
	{
		if (!tapeCursor.mask)
			continue;
		
		const directive = walkMask(tapeCursor.mask, spine, visitFn);
		
		if (directive === "stop")
			return "stop";
		
		if (directive === "skip")
			continue;
		
		// directive is void here. Descend into any child Tapes subsumed
		// by this mask (e.g. the contents of an EnclosureMask),
		// continuing at the same spine depth — the enclosure mask itself
		// doesn't add a Vertebra, since a Vertebra represents passage
		// through a *field*, and descending into covered tokens isn't a
		// field traversal.
		if (tapeCursor.tokensCovered)
			for (const covered of tapeCursor.tokensCovered)
				if (covered instanceof X.Tape)
					if (walkTapeInner(covered, spine, visitFn) === "stop")
						return "stop";
	}
}
 
/**
 * Visits a single Mask: invokes the callback in capture phase,
 * recurses into its fields (unless told to skip), then invokes
 * the callback again in bubble phase.
 * 
 * Returns "stop" if the walk should halt entirely. Returns "skip"
 * if downward traversal (both into fields and into any child tapes
 * the caller may also descend into) should be suppressed. Returns
 * void otherwise.
 */
function walkMask(
	mask: X.Mask,
	spine: readonly Vertebra[],
	visitFn: (cursor: ICursor) => WalkDirective): WalkDirective
{
	const captureDirective = visitFn({ spine, element: mask, isAscending: false });
	
	if (captureDirective === "stop")
		return "stop";
	
	if (captureDirective !== "skip")
		if (walkMaskFields(mask, spine, visitFn) === "stop")
			return "stop";
	
	const bubbleDirective = visitFn({ spine, element: mask, isAscending: true });
	
	if (bubbleDirective === "stop")
		return "stop";
	
	// "skip" returned on the way up still suppresses the caller's
	// further downward traversal (i.e. descending into tokensCovered
	// child tapes for this same mask), consistent with "skip" on the
	// way down. Either phase returning "skip" is sufficient.
	return (captureDirective === "skip" || bubbleDirective === "skip") ?
		"skip" :
		undefined;
}
 
/**
 * Scans a mask's own schema fields, and for every nested Mask value
 * found (whether sitting directly on a singular field, or as an
 * element inside an array-valued field), builds the appropriate
 * Vertebra and recurses into it via walkMask.
 * 
 * Returns "stop" if the walk should halt entirely, in which case the
 * caller must stop iterating fields and propagate "stop" further up.
 * Returns void otherwise (this function never itself produces "skip" -
 * that directive is consumed per-mask by walkMask).
 */
function walkMaskFields(
	mask: X.Mask,
	spine: readonly Vertebra[],
	visitFn: (cursor: ICursor) => WalkDirective): "stop" | void
{
	for (const reflected of mask.queryFields())
	{
		const { value, field } = reflected;
		
		if (Array.isArray(value))
		{
			for (let i = -1; ++i < value.length;)
			{
				const element = value[i];
				if (!(element instanceof X.Mask))
					continue;
				
				const vertebra: Vertebra = { mask: element, index: i, schemaField: field };
				if (walkMask(element, [vertebra, ...spine], visitFn) === "stop")
					return "stop";
			}
		}
		else if (value instanceof X.Mask)
		{
			const vertebra: Vertebra = { mask: value, index: -1, schemaField: field };
			if (walkMask(value, [vertebra, ...spine], visitFn) === "stop")
				return "stop";
		}
	}
}