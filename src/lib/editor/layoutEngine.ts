export interface BoundingBox {
  id: string;
  x: number; // Absolute canvas X coordinate (pixels)
  y: number; // Absolute canvas Y coordinate (pixels)
  width: number;
  height: number;
  parentId?: string | null;
}

export interface SnapGuide {
  orientation: 'VERTICAL' | 'HORIZONTAL';
  coordinate: number;
  matchedBlockId: string;
  type: 'EDGE' | 'CENTER' | 'SPACING';
}

export type ConstraintAnchor = 'START' | 'END' | 'CENTER' | 'STRETCH';

export interface BoxConstraints {
  horizontal: ConstraintAnchor;
  vertical: ConstraintAnchor;
}

export type ResizeHandleType = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';

export class VisualLayoutEngine {
  private static SNAP_THRESHOLD = 5; // Pixels distance pull-zone for magnetic snapping
  private static MIN_ELEMENT_SIZE = 30; // Min size in pixels during resizing to prevent element collapsing
  private static SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96]; // Design token spacing scale in pixels

  /**
   * 1. FIGMA-STYLE CONSTRAINT SOLVER
   */
  public static solveConstraints(
    child: Omit<BoundingBox, 'id'>,
    parent: BoundingBox,
    constraints: BoxConstraints
  ): { left: string; right: string; top: string; bottom: string; width: string; height: string } {
    const relX = child.x - parent.x;
    const relY = child.y - parent.y;

    let left = '0px';
    let right = 'auto';
    let top = '0px';
    let bottom = 'auto';
    let width = `${child.width}px`;
    let height = `${child.height}px`;

    switch (constraints.horizontal) {
      case 'START':
        left = `${relX}px`;
        break;
      case 'END':
        const rightOffset = parent.width - (relX + child.width);
        right = `${rightOffset}px`;
        left = 'auto';
        break;
      case 'CENTER':
        const childCenterX = relX + child.width / 2;
        const parentCenterX = parent.width / 2;
        const offsetFromCenter = childCenterX - parentCenterX;
        left = `calc(50% + ${offsetFromCenter}px - ${child.width / 2}px)`;
        break;
      case 'STRETCH':
        left = `${relX}px`;
        const rightDist = parent.width - (relX + child.width);
        right = `${rightDist}px`;
        width = 'auto';
        break;
    }

    switch (constraints.vertical) {
      case 'START':
        top = `${relY}px`;
        break;
      case 'END':
        const bottomOffset = parent.height - (relY + child.height);
        bottom = `${bottomOffset}px`;
        top = 'auto';
        break;
      case 'CENTER':
        const childCenterY = relY + child.height / 2;
        const parentCenterY = parent.height / 2;
        const offsetFromCenterY = childCenterY - parentCenterY;
        top = `calc(50% + ${offsetFromCenterY}px - ${child.height / 2}px)`;
        break;
      case 'STRETCH':
        top = `${relY}px`;
        const bottomDist = parent.height - (relY + child.height);
        bottom = `${bottomDist}px`;
        height = 'auto';
        break;
    }

    return { left, right, top, bottom, width, height };
  }

  /**
   * 2. FLUID RESIZING ENGINE (Frictionless Resize UX)
   * Calculates new width, height, X, and Y boundaries based on dragged handles
   * while strictly enforcing minimum size constraints and aspect ratio preservation rules.
   */
  public static solveResize(
    handle: ResizeHandleType,
    currentBox: BoundingBox,
    deltaX: number,
    deltaY: number,
    preserveAspectRatio = false
  ): { x: number; y: number; width: number; height: number } {
    let nextX = currentBox.x;
    let nextY = currentBox.y;
    let nextWidth = currentBox.width;
    let nextHeight = currentBox.height;

    const originalRatio = currentBox.width / currentBox.height;

    // Apply delta adjustments depending on handle direction
    if (handle.includes('LEFT')) {
      const potentialWidth = currentBox.width - deltaX;
      if (potentialWidth > this.MIN_ELEMENT_SIZE) {
        nextWidth = potentialWidth;
        nextX = currentBox.x + deltaX;
      }
    } else if (handle.includes('RIGHT')) {
      nextWidth = Math.max(this.MIN_ELEMENT_SIZE, currentBox.width + deltaX);
    }

    if (handle.includes('TOP')) {
      const potentialHeight = currentBox.height - deltaY;
      if (potentialHeight > this.MIN_ELEMENT_SIZE) {
        nextHeight = potentialHeight;
        nextY = currentBox.y + deltaY;
      }
    } else if (handle.includes('BOTTOM')) {
      nextHeight = Math.max(this.MIN_ELEMENT_SIZE, currentBox.height + deltaY);
    }

    // Preserve Aspect Ratio (for images or vector widgets to prevent distortion)
    if (preserveAspectRatio) {
      if (handle.includes('LEFT') || handle.includes('RIGHT')) {
        nextHeight = nextWidth / originalRatio;
      } else {
        nextWidth = nextHeight * originalRatio;
      }
    }

    return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
  }

  /**
   * 3. SMOOTH DRAGGING INTERPOLATION (Zero-Lag UX Feedback)
   * Uses Linear Interpolation (LERP) physics with damping to smooth cursor movement
   * on low refresh rate monitors, ensuring buttery smooth drag transitions (<16ms).
   */
  public static interpolateDragCoordinates(
    current: { x: number; y: number },
    target: { x: number; y: number },
    dampingFactor = 0.25 // Standard UI spring damping factor (0.1 to 1.0)
  ): { x: number; y: number } {
    const x = current.x + (target.x - current.x) * dampingFactor;
    const y = current.y + (target.y - current.y) * dampingFactor;
    return { x, y };
  }

  /**
   * 4. SMART SNAPPING PHYSICS WITH MAGNETIC ATTRACTION
   * Evaluates proximity of dragged boundaries to active siblings, locking the cursor
   * onto snap lines when entering the static magnetic threshold pull zone.
   */
  public static solveSmartSnapping(
    dragged: Omit<BoundingBox, 'id'>,
    siblings: BoundingBox[]
  ): { snapX: number | null; snapY: number | null; guides: SnapGuide[] } {
    let snapX: number | null = null;
    let snapY: number | null = null;
    const guides: SnapGuide[] = [];

    const dL = dragged.x;
    const dR = dragged.x + dragged.width;
    const dCX = dragged.x + dragged.width / 2;

    const dT = dragged.y;
    const dB = dragged.y + dragged.height;
    const dCY = dragged.y + dragged.height / 2;

    siblings.forEach((sibling) => {
      const sL = sibling.x;
      const sR = sibling.x + sibling.width;
      const sCX = sibling.x + sibling.width / 2;

      const sT = sibling.y;
      const sB = sibling.y + sibling.height;
      const sCY = sibling.y + sibling.height / 2;

      // Magnetic Vertical Snapping Checks
      if (Math.abs(dL - sL) < this.SNAP_THRESHOLD) {
        snapX = sL; // Locks left edge
        guides.push({ orientation: 'VERTICAL', coordinate: sL, matchedBlockId: sibling.id, type: 'EDGE' });
      } else if (Math.abs(dR - sR) < this.SNAP_THRESHOLD) {
        snapX = sR - dragged.width; // Locks right edge
        guides.push({ orientation: 'VERTICAL', coordinate: sR, matchedBlockId: sibling.id, type: 'EDGE' });
      } else if (Math.abs(dCX - sCX) < this.SNAP_THRESHOLD) {
        snapX = sCX - dragged.width / 2; // Locks vertical center axis
        guides.push({ orientation: 'VERTICAL', coordinate: sCX, matchedBlockId: sibling.id, type: 'CENTER' });
      }

      // Magnetic Horizontal Snapping Checks
      if (Math.abs(dT - sT) < this.SNAP_THRESHOLD) {
        snapY = sT; // Locks top edge
        guides.push({ orientation: 'HORIZONTAL', coordinate: sT, matchedBlockId: sibling.id, type: 'EDGE' });
      } else if (Math.abs(dB - sB) < this.SNAP_THRESHOLD) {
        snapY = sB - dragged.height; // Locks bottom edge
        guides.push({ orientation: 'HORIZONTAL', coordinate: sB, matchedBlockId: sibling.id, type: 'EDGE' });
      } else if (Math.abs(dCY - sCY) < this.SNAP_THRESHOLD) {
        snapY = sCY - dragged.height / 2; // Locks horizontal center axis
        guides.push({ orientation: 'HORIZONTAL', coordinate: sCY, matchedBlockId: sibling.id, type: 'CENTER' });
      }

      // Spacing Snapping to Design Token gutters
      this.SPACING_SCALE.forEach((scaleGutter) => {
        if (Math.abs(dT - (sB + scaleGutter)) < this.SNAP_THRESHOLD) {
          snapY = sB + scaleGutter;
          guides.push({ orientation: 'HORIZONTAL', coordinate: sB + scaleGutter, matchedBlockId: sibling.id, type: 'SPACING' });
        }
        if (Math.abs(dB - (sT - scaleGutter)) < this.SNAP_THRESHOLD) {
          snapY = sT - scaleGutter - dragged.height;
          guides.push({ orientation: 'HORIZONTAL', coordinate: sT - scaleGutter, matchedBlockId: sibling.id, type: 'SPACING' });
        }
        if (Math.abs(dL - (sR + scaleGutter)) < this.SNAP_THRESHOLD) {
          snapX = sR + scaleGutter;
          guides.push({ orientation: 'VERTICAL', coordinate: sR + scaleGutter, matchedBlockId: sibling.id, type: 'SPACING' });
        }
        if (Math.abs(dR - (sL - scaleGutter)) < this.SNAP_THRESHOLD) {
          snapX = sL - scaleGutter - dragged.width;
          guides.push({ orientation: 'VERTICAL', coordinate: sL - scaleGutter, matchedBlockId: sibling.id, type: 'SPACING' });
        }
      });
    });

    return { snapX, snapY, guides };
  }

  /**
   * 5. ADAPTIVE RESPONSIVE REASONING
   */
  public static reasonResponsiveStyles(
    desktopBox: BoundingBox,
    targetViewportWidth: number
  ): { width: string; left: string; isResponsiveWrapRequired: boolean } {
    const percentageWidth = (desktopBox.width / 1440) * 100;
    const leftPercentage = (desktopBox.x / 1440) * 100;

    let resolvedWidth = `${percentageWidth}%`;
    let resolvedLeft = `${leftPercentage}%`;
    let isResponsiveWrapRequired = false;

    const projectedPixelWidth = (percentageWidth / 100) * targetViewportWidth;
    if (projectedPixelWidth < 120 || targetViewportWidth < 480) {
      resolvedWidth = '100%';
      resolvedLeft = '0px';
      isResponsiveWrapRequired = true;
    }

    return {
      width: resolvedWidth,
      left: resolvedLeft,
      isResponsiveWrapRequired,
    };
  }
}
