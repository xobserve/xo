import _isEqual from 'lodash/isEqual';
import _memoize from 'lodash/memoize';

import { KeyValuePair, Span, SpanData, Trace, TraceData } from './types';
import TreeNode from 'src/core/library/utils/treeNode';

/**
 * NOTE: Mutates `data` - Transform the HTTP response data into the form the app
 * generally requires.
 */
export default function transformTraceData(data: TraceData & { spans: SpanData[] }): Trace | null {
    let { traceID } = data;
    if (!traceID) {
      return null;
    }
    traceID = traceID.toLowerCase();
  
    let traceEndTime = 0;
    let traceStartTime = Number.MAX_SAFE_INTEGER;
    const spanIdCounts = new Map();
    const spanMap = new Map<string, Span>();
    // filter out spans with empty start times
    // eslint-disable-next-line no-param-reassign
    data.spans = data.spans.filter(span => Boolean(span.startTime));
  
    const max = data.spans.length; 
    for (let i = 0; i < max; i++) {
      const span: Span = data.spans[i] as Span;
      const { startTime, duration, processID } = span;
      //
      let spanID = span.spanID;
      // check for start / end time for the trace
      if (startTime < traceStartTime) {
        traceStartTime = startTime;
      }
      if (startTime + duration > traceEndTime) {
        traceEndTime = startTime + duration;
      }
      // make sure span IDs are unique
      const idCount = spanIdCounts.get(spanID);
      if (idCount != null) {
        // eslint-disable-next-line no-console
        console.warn(`Dupe spanID, ${idCount + 1} x ${spanID}`, span, spanMap.get(spanID));
        if (_isEqual(span, spanMap.get(spanID))) {
          // eslint-disable-next-line no-console
          console.warn('\t two spans with same ID have `isEqual(...) === true`');
        }
        spanIdCounts.set(spanID, idCount + 1);
        spanID = `${spanID}_${idCount}`;
        span.spanID = spanID;
      } else {
        spanIdCounts.set(spanID, 1);
      }
      span.process = data.processes[processID];
      spanMap.set(spanID, span);
    }
    // tree is necessary to sort the spans, so children follow parents, and
    // siblings are sorted by start time
    const tree = getTraceSpanIdsAsTree(data);
    const spans: Span[] = [];
    const svcCounts: Record<string, number> = {};
  
    tree.walk((spanID: string, node: TreeNode, depth: number = 0) => {
      if (spanID === '__root__') {
        return;
      }
      const span = spanMap.get(spanID) as Span;
      if (!span) {
        return;
      }
      const { serviceName } = span.process;
      svcCounts[serviceName] = (svcCounts[serviceName] || 0) + 1;
      span.relativeStartTime = span.startTime - traceStartTime;
      span.depth = depth - 1;
      span.hasChildren = node.children.length > 0;
      span.warnings = span.warnings || [];
      span.tags = span.tags || [];
      span.references = span.references || [];
      const tagsInfo = deduplicateTags(span.tags);
      // use undefined to replace 'getConfigValue('topTagPrefixes')' in jaeger ui
      span.tags = orderTags(tagsInfo.tags, undefined);
      span.warnings = span.warnings.concat(tagsInfo.warnings);
      span.references.forEach((ref, index) => {
        const refSpan = spanMap.get(ref.spanID) as Span;
        if (refSpan) {
          // eslint-disable-next-line no-param-reassign
          ref.span = refSpan;
          if (index > 0) {
            // Don't take into account the parent, just other references.
            refSpan.subsidiarilyReferencedBy = refSpan.subsidiarilyReferencedBy || [];
            refSpan.subsidiarilyReferencedBy.push({
              spanID,
              traceID,
              span,
              refType: ref.refType,
            });
          }
        }
      });
      spans.push(span);
    });
    const traceName = getTraceName(spans);
    const services = Object.keys(svcCounts).map(name => ({ name, numberOfSpans: svcCounts[name] }));
    return {
      services,
      spans,
      traceID,
      traceName,
      // can't use spread operator for intersection types
      // repl: https://goo.gl/4Z23MJ
      // issue: https://github.com/facebook/flow/issues/1511
      processes: data.processes,
      duration: traceEndTime - traceStartTime,
      startTime: traceStartTime,
      endTime: traceEndTime,
    };
  }
  

  // exported for tests
export function deduplicateTags(spanTags: KeyValuePair[]) {
    const warningsHash: Map<string, string> = new Map<string, string>();
    const tags: KeyValuePair[] = spanTags.reduce<KeyValuePair[]>((uniqueTags, tag) => {
      if (!uniqueTags.some(t => t.key === tag.key && t.value === tag.value)) {
        uniqueTags.push(tag);
      } else {
        warningsHash.set(`${tag.key}:${tag.value}`, `Duplicate tag "${tag.key}:${tag.value}"`);
      }
      return uniqueTags;
    }, []);
    const warnings = Array.from(warningsHash.values());
    return { tags, warnings };
  }

// exported for tests
export function orderTags(spanTags: KeyValuePair[], topPrefixes?: string[]) {
    const orderedTags: KeyValuePair[] = spanTags.slice();
    const tp = (topPrefixes || []).map((p: string) => p.toLowerCase());
  
    orderedTags.sort((a, b) => {
      const aKey = a.key.toLowerCase();
      const bKey = b.key.toLowerCase();
  
      for (let i = 0; i < tp.length; i++) {
        const p = tp[i];
        if (aKey.startsWith(p) && !bKey.startsWith(p)) {
          return -1;
        }
        if (!aKey.startsWith(p) && bKey.startsWith(p)) {
          return 1;
        }
      }
  
      if (aKey > bKey) {
        return 1;
      }
      if (aKey < bKey) {
        return -1;
      }
      return 0;
    });
  
    return orderedTags;
  }



  export function _getTraceNameImpl(spans: Span[]) {
    // Use a span with no references to another span in given array
    // prefering the span with the fewest references
    // using start time as a tie breaker
    let candidateSpan: Span | undefined;
    const allIDs: Set<string> = new Set(spans.map(({ spanID }) => spanID));
  
    for (let i = 0; i < spans.length; i++) {
      const hasInternalRef =
        spans[i].references &&
        spans[i].references.some(({ traceID, spanID }) => traceID === spans[i].traceID && allIDs.has(spanID));
      if (hasInternalRef) continue;
  
      if (!candidateSpan) {
        candidateSpan = spans[i];
        continue;
      }
  
      const thisRefLength = (spans[i].references && spans[i].references.length) || 0;
      const candidateRefLength = (candidateSpan.references && candidateSpan.references.length) || 0;
  
      if (
        thisRefLength < candidateRefLength ||
        (thisRefLength === candidateRefLength && spans[i].startTime < candidateSpan.startTime)
      ) {
        candidateSpan = spans[i];
      }
    }
    return candidateSpan ? `${candidateSpan.process.serviceName}: ${candidateSpan.operationName}` : '';
  }
  
  export const getTraceName = _memoize(_getTraceNameImpl, (spans: Span[]) => {
    if (!spans.length) return 0;
    return spans[0].traceID;
  });


  export const TREE_ROOT_ID = '__root__';

  /**
 * Build a tree of { value: spanID, children } items derived from the
 * `span.references` information. The tree represents the grouping of parent /
 * child relationships. The root-most node is nominal in that
 * `.value === TREE_ROOT_ID`. This is done because a root span (the main trace
 * span) is not always included with the trace data. Thus, there can be
 * multiple top-level spans, and the root node acts as their common parent.
 *
 * The children are sorted by `span.startTime` after the tree is built.
 *
 * @param  {Trace} trace The trace to build the tree of spanIDs.
 * @return {TreeNode}    A tree of spanIDs derived from the relationships
 *                       between spans in the trace.
 */
export function getTraceSpanIdsAsTree(trace) {
    const nodesById = new Map(trace.spans.map(span => [span.spanID, new TreeNode(span.spanID)]));
    const spansById = new Map(trace.spans.map(span => [span.spanID, span]));
    const root = new TreeNode(TREE_ROOT_ID);
    trace.spans.forEach(span => {
      const node = nodesById.get(span.spanID);
      if (Array.isArray(span.references) && span.references.length) {
        const { refType, spanID: parentID } = span.references[0];
        if (refType === 'CHILD_OF' || refType === 'FOLLOWS_FROM') {
          const parent:any = nodesById.get(parentID) || root;
          parent.children.push(node);
        } else {
          throw new Error(`Unrecognized ref type: ${refType}`);
        }
      } else {
        root.children.push(node);
      }
    });
    const comparator = (nodeA, nodeB) => {
      const a:any = spansById.get(nodeA.value);
      const b:any = spansById.get(nodeB.value);
      return +(a.startTime > b.startTime) || +(a.startTime === b.startTime) - 1;
    };
    trace.spans.forEach(span => {
      const node:any = nodesById.get(span.spanID);
      if (node.children.length > 1) {
        node.children.sort(comparator);
      }
    });
    root.children.sort(comparator);
    return root;
  }