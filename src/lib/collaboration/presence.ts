export interface ClientPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  cursor: { x: number; y: number };
  activeBlockId: string | null;
  lastActiveAt: number;
}

export interface BlockLockState {
  blockId: string;
  lockedByUserId: string;
  lockedByUserName: string;
  expiresAt: number;
}

export class CollaborationPresenceEngine {
  private static activePresenceMap = new Map<string, ClientPresence>();
  private static blockLocks = new Map<string, BlockLockState>();
  
  // Lock lease timeout: 30 seconds before auto-releasing a block lock
  private static LOCK_LEASE_MS = 30 * 1000;

  /**
   * Registers or updates a designer's real-time presence (cursor tracking and active section selection)
   */
  public static updatePresence(userId: string, presenceData: Omit<ClientPresence, 'lastActiveAt'>): void {
    this.activePresenceMap.set(userId, {
      ...presenceData,
      lastActiveAt: Date.now(),
    });
  }

  /**
   * Retrieves all active designers currently collaborating in the page builder workspace
   */
  public static getActiveCollaborators(): ClientPresence[] {
    const now = Date.now();
    const activeList: ClientPresence[] = [];

    // Filter out users who have gone idle/silent for over 15 seconds
    for (const [userId, presence] of this.activePresenceMap.entries()) {
      if (now - presence.lastActiveAt < 15000) {
        activeList.push(presence);
      } else {
        this.activePresenceMap.delete(userId); // Garbage collection
      }
    }

    return activeList;
  }

  /**
   * Attempts to lock a block for exclusive editing (preventing concurrent modify override conflicts)
   * Implements Figma-style lock leases
   */
  public static acquireBlockLock(blockId: string, userId: string, userName: string): { success: boolean; holder?: string } {
    const now = Date.now();
    const currentLock = this.blockLocks.get(blockId);

    // If block is locked by another active designer and the lease hasn't expired
    if (currentLock && currentLock.lockedByUserId !== userId && currentLock.expiresAt > now) {
      return {
        success: false,
        holder: currentLock.lockedByUserName,
      };
    }

    // Set or renew the lock lease
    this.blockLocks.set(blockId, {
      blockId,
      lockedByUserId: userId,
      lockedByUserName: userName,
      expiresAt: now + this.LOCK_LEASE_MS,
    });

    return { success: true };
  }

  /**
   * Explicitly releases a block lock once editing of properties is finished or deselected
   */
  public static releaseBlockLock(blockId: string, userId: string): void {
    const currentLock = this.blockLocks.get(blockId);
    if (currentLock && currentLock.lockedByUserId === userId) {
      this.blockLocks.delete(blockId);
    }
  }

  /**
   * Performs housekeeping to flush expired locks
   */
  public static cleanExpiredLocks(): void {
    const now = Date.now();
    for (const [blockId, lock] of this.blockLocks.entries()) {
      if (lock.expiresAt < now) {
        this.blockLocks.delete(blockId);
      }
    }
  }
}

// Set up periodic automated locks cleanup every 10 seconds
setInterval(() => {
  CollaborationPresenceEngine.cleanExpiredLocks();
}, 10000);
