import { PageBuilderSchema, BaseBlock } from '../../types/builder';
import { IncrementalGraphCompiler } from './incrementalCompiler';

export class TransitiveDependencyInvalidator {
  private static parentMap = new Map<string, string>(); // childId -> parentId

  /**
   * Scans and builds a memory map of parent-child linkages of the block graph.
   * This represents the layout structural edges of our AST Graph.
   */
  public static buildParentMap(schema: PageBuilderSchema): void {
    this.parentMap.clear();

    Object.entries(schema.blocks).forEach(([parentId, block]) => {
      if (block.children && block.children.length > 0) {
        block.children.forEach((childId) => {
          this.parentMap.set(childId, parentId);
        });
      }
    });
  }

  /**
   * Propagates a dirty state change upwards (Transitive Invalidation) from a leaf block
   * to all its parent layout containers up to the root block node.
   * Ensures that parents are rebuild and re-compiled to correctly compute children layout adjustments.
   */
  public static invalidateBlockAndAncestors(blockId: string, schema: PageBuilderSchema): string[] {
    // 1. Ensure the parent linkage map is fully built
    this.buildParentMap(schema);

    const invalidatedIds: string[] = [];
    let currentId: string | undefined = blockId;

    // 2. Walk upwards from node to root
    while (currentId) {
      invalidatedIds.push(currentId);
      
      // Invalidate the specific node inside our Incremental Compiler's cache
      IncrementalGraphCompiler.invalidateNode(currentId);

      // Fetch parent node id
      currentId = this.parentMap.get(currentId);
    }

    return invalidatedIds;
  }

  /**
   * Performs dynamic graph pruning.
   * Identifies orphaned or disconnected block nodes that are no longer part of the root tree hierarchy
   * and purges them from the memory compilers to avoid memory leaks.
   */
  public static pruneDisconnectedNodes(schema: PageBuilderSchema): number {
    let prunedCount = 0;
    const reachableNodes = new Set<string>();

    // Recursive helper to traverse reachable nodes starting from root
    const traverse = (id: string) => {
      reachableNodes.add(id);
      const block = schema.blocks[id];
      if (block && block.children) {
        block.children.forEach((childId) => {
          if (!reachableNodes.has(childId)) {
            traverse(childId);
          }
        });
      }
    };

    // Begin traversing from Root layout node
    if (schema.rootBlockId && schema.blocks[schema.rootBlockId]) {
      traverse(schema.rootBlockId);
    }

    // Identify cached nodes that are no longer reachable and evict them
    // Access static caches via invalidation trigger loops
    Object.keys(schema.blocks).forEach((blockId) => {
      if (!reachableNodes.has(blockId)) {
        IncrementalGraphCompiler.invalidateNode(blockId);
        prunedCount++;
      }
    });

    return prunedCount;
  }
}
