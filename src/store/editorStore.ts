import { create } from 'zustand';
import { BaseBlock, PageBuilderSchema, LayoutSettings, SpacingSettings, TypographySettings, BorderSettings, ShadowSettings, AnimationSettings, VisibilityRules } from '../types/builder';
import { generateSecureId } from '../lib/security/uuid';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface EditorState {
  schema: PageBuilderSchema | null;
  selectedBlockId: string | null;
  viewportMode: ViewportMode;
  isDragging: boolean;
  history: PageBuilderSchema[];
  historyIndex: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;

  initSchema: (schema: PageBuilderSchema) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setSelectedBlockId: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;

  addBlock: (block: BaseBlock, parentId: string, index?: number) => void;
  updateBlock: (blockId: string, updates: Partial<BaseBlock>) => void;
  updateBlockProps: (blockId: string, props: Record<string, any>) => void;
  updateBlockLayout: (blockId: string, layout: Partial<LayoutSettings>) => void;
  updateBlockSpacing: (blockId: string, spacing: Partial<SpacingSettings>) => void;
  updateBlockTypography: (blockId: string, typography: Partial<TypographySettings>) => void;
  updateBlockBorder: (blockId: string, border: Partial<BorderSettings>) => void;
  updateBlockShadow: (blockId: string, shadow: Partial<ShadowSettings>) => void;
  updateBlockAnimation: (blockId: string, animation: Partial<AnimationSettings>) => void;
  updateBlockVisibility: (blockId: string, visibility: Partial<VisibilityRules>) => void;
  
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetParentId: string, targetIndex: number) => void;

  undo: () => void;
  redo: () => void;
  pushToHistory: (schema: PageBuilderSchema) => void;
  markSaved: () => void;
  setSaving: (isSaving: boolean) => void;
}

const cloneSchemaWithStructuralSharing = (schema: PageBuilderSchema, mutatedBlockId?: string): PageBuilderSchema => {
  const nextBlocks = { ...schema.blocks };

  if (mutatedBlockId && nextBlocks[mutatedBlockId]) {
    nextBlocks[mutatedBlockId] = {
      ...nextBlocks[mutatedBlockId],
      layout: { ...nextBlocks[mutatedBlockId].layout },
      spacing: { ...nextBlocks[mutatedBlockId].spacing },
      typography: { ...nextBlocks[mutatedBlockId].typography },
      border: { ...nextBlocks[mutatedBlockId].border },
      shadow: { ...nextBlocks[mutatedBlockId].shadow },
      animation: { ...nextBlocks[mutatedBlockId].animation },
      visibility: { ...nextBlocks[mutatedBlockId].visibility },
      props: { ...nextBlocks[mutatedBlockId].props },
    };
  } else {
    return JSON.parse(JSON.stringify(schema));
  }

  return {
    ...schema,
    seo: { ...schema.seo },
    theme: { ...schema.theme },
    blocks: nextBlocks,
  };
};

export const useEditorStore = create<EditorState>((set, get) => ({
  schema: null,
  selectedBlockId: null,
  viewportMode: 'desktop',
  isDragging: false,
  history: [],
  historyIndex: -1,
  hasUnsavedChanges: false,
  isSaving: false,

  initSchema: (schema) => {
    set({
      schema,
      history: [cloneSchemaWithStructuralSharing(schema)],
      historyIndex: 0,
      selectedBlockId: null,
      hasUnsavedChanges: false,
    });
  },

  setViewportMode: (viewportMode) => set({ viewportMode }),
  
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),
  
  setDragging: (isDragging) => set({ isDragging }),

  pushToHistory: (newSchema) => {
    const { history, historyIndex } = get();
    const updatedHistory = history.slice(0, historyIndex + 1);
    
    updatedHistory.push(JSON.parse(JSON.stringify(newSchema)));

    if (updatedHistory.length > 50) {
      updatedHistory.shift();
    }

    set({
      schema: newSchema,
      history: updatedHistory,
      historyIndex: updatedHistory.length - 1,
      hasUnsavedChanges: true,
    });
  },

  addBlock: (block, parentId, index) => {
    const { schema, pushToHistory } = get();
    if (!schema) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema);
    const parent = nextSchema.blocks[parentId];
    if (!parent) return;

    block.parentId = parentId;
    nextSchema.blocks[block.id] = block;

    if (index !== undefined) {
      parent.children.splice(index, 0, block.id);
    } else {
      parent.children.push(block.id);
    }

    pushToHistory(nextSchema);
  },

  updateBlock: (blockId, updates) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId] = {
      ...nextSchema.blocks[blockId],
      ...updates,
    };

    pushToHistory(nextSchema);
  },

  updateBlockProps: (blockId, props) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].props = {
      ...nextSchema.blocks[blockId].props,
      ...props,
    };

    pushToHistory(nextSchema);
  },

  updateBlockLayout: (blockId, layout) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].layout = {
      ...nextSchema.blocks[blockId].layout,
      ...layout,
    };

    pushToHistory(nextSchema);
  },

  updateBlockSpacing: (blockId, spacing) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].spacing = {
      ...nextSchema.blocks[blockId].spacing,
      ...spacing,
    };

    pushToHistory(nextSchema);
  },

  updateBlockTypography: (blockId, typography) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].typography = {
      ...nextSchema.blocks[blockId].typography,
      ...typography,
    };

    pushToHistory(nextSchema);
  },

  updateBlockBorder: (blockId, border) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].border = {
      ...nextSchema.blocks[blockId].border,
      ...border,
    };

    pushToHistory(nextSchema);
  },

  updateBlockShadow: (blockId, shadow) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].shadow = {
      ...nextSchema.blocks[blockId].shadow,
      ...shadow,
    };

    pushToHistory(nextSchema);
  },

  updateBlockAnimation: (blockId, animation) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].animation = {
      ...nextSchema.blocks[blockId].animation,
      ...animation,
    };

    pushToHistory(nextSchema);
  },

  updateBlockVisibility: (blockId, visibility) => {
    const { schema, pushToHistory } = get();
    if (!schema || !schema.blocks[blockId]) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema, blockId);
    nextSchema.blocks[blockId].visibility = {
      ...nextSchema.blocks[blockId].visibility,
      ...visibility,
    };

    pushToHistory(nextSchema);
  },

  deleteBlock: (blockId) => {
    const { schema, selectedBlockId, pushToHistory } = get();
    if (!schema || blockId === schema.rootBlockId) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema);
    const blockToDelete = nextSchema.blocks[blockId];
    if (!blockToDelete) return;

    const parentId = blockToDelete.parentId;
    if (parentId && nextSchema.blocks[parentId]) {
      nextSchema.blocks[parentId].children = nextSchema.blocks[parentId].children.filter(
        (id) => id !== blockId
      );
    }

    const deleteRecursively = (id: string) => {
      const b = nextSchema.blocks[id];
      if (b) {
        b.children.forEach((childId) => deleteRecursively(childId));
        delete nextSchema.blocks[id];
      }
    };

    deleteRecursively(blockId);

    const nextSelected = selectedBlockId === blockId ? null : selectedBlockId;

    set({ selectedBlockId: nextSelected });
    pushToHistory(nextSchema);
  },

  duplicateBlock: (blockId) => {
    const { schema, pushToHistory } = get();
    if (!schema || blockId === schema.rootBlockId) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema);
    const sourceBlock = nextSchema.blocks[blockId];
    if (!sourceBlock || !sourceBlock.parentId) return;

    const parent = nextSchema.blocks[sourceBlock.parentId];
    if (!parent) return;

    const cloneBlock = (id: string, newParentId: string | null): string => {
      const original = nextSchema.blocks[id];
      // Use cryptographically secure ID generation
      const newId = generateSecureId(original.type);
      
      const clone: BaseBlock = {
        ...JSON.parse(JSON.stringify(original)),
        id: newId,
        parentId: newParentId,
        children: [],
      };

      nextSchema.blocks[newId] = clone;

      original.children.forEach((childId) => {
        const clonedChildId = cloneBlock(childId, newId);
        clone.children.push(clonedChildId);
      });

      return newId;
    };

    const clonedRootId = cloneBlock(blockId, sourceBlock.parentId);
    
    const index = parent.children.indexOf(blockId);
    if (index !== -1) {
      parent.children.splice(index + 1, 0, clonedRootId);
    } else {
      parent.children.push(clonedRootId);
    }

    pushToHistory(nextSchema);
  },

  moveBlock: (blockId, targetParentId, targetIndex) => {
    const { schema, pushToHistory } = get();
    if (!schema || blockId === schema.rootBlockId) return;

    const nextSchema = cloneSchemaWithStructuralSharing(schema);
    const block = nextSchema.blocks[blockId];
    const sourceParentId = block.parentId;
    const targetParent = nextSchema.blocks[targetParentId];

    if (!block || !sourceParentId || !targetParent) return;

    let curr: string | null | undefined = targetParentId;
    while (curr) {
      if (curr === blockId) return;
      curr = nextSchema.blocks[curr]?.parentId;
    }

    const sourceParent = nextSchema.blocks[sourceParentId];
    if (sourceParent) {
      sourceParent.children = sourceParent.children.filter((id) => id !== blockId);
    }

    block.parentId = targetParentId;
    targetParent.children.splice(targetIndex, 0, blockId);

    pushToHistory(nextSchema);
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        schema: cloneSchemaWithStructuralSharing(history[prevIndex]),
        historyIndex: prevIndex,
        hasUnsavedChanges: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        schema: cloneSchemaWithStructuralSharing(history[nextIndex]),
        historyIndex: nextIndex,
        hasUnsavedChanges: true,
      });
    }
  },

  markSaved: () => {
    set({ hasUnsavedChanges: false, isSaving: false });
  },

  setSaving: (isSaving) => {
    set({ isSaving });
  },
}));
