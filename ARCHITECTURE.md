# 🦄 Unicorn-Grade Platform Architecture Specification

This document provides a highly technical, deep architectural analysis of the **SaaS Landing Page Builder & Website Operating System**. It describes the mathematical models, distributed system paradigms, and performance optimizations engineered into the codebase.

---

## 1. Layout Intelligence Engine (Framer-Tier Geometry Solver)

A world-class visual page builder cannot rely on absolute pixel positioning or simple layout rules. Instead, it must represent the layout space as a **Constraint Graph**, which is solved in real time to adapt to responsive viewports.

### 1.1 Mathematical Model of the Constraint Solver
The `solveConstraints` engine implements a spring-and-anchor layout model resembling the Cassowary linear programming solver. Let:
- $W_p$ and $H_p$ represent the width and height of the parent bounding container box.
- $W_c$ and $H_c$ represent the absolute width and height of the child block.
- $X_c$ and $Y_c$ represent the absolute canvas coordinates of the child block.
- $L_c, R_c, T_c,$ and $B_c$ represent the final computed Left, Right, Top, and Bottom layout boundaries.

The system solves the system of linear equations as follows based on the anchor constraints:

$$\begin{aligned}
\text{If } \text{Horizontal} = \text{START}: \quad & L_c = X_c - X_p, \quad R_c = \text{auto}, \quad W_c = \text{fixed} \\
\text{If } \text{Horizontal} = \text{END}: \quad & R_c = W_p - (L_c + W_c), \quad L_c = \text{auto}, \quad W_c = \text{fixed} \\
\text{If } \text{Horizontal} = \text{CENTER}: \quad & L_c = \frac{W_p}{2} + \Delta X_{\text{center}} - \frac{W_c}{2} \\
\text{If } \text{Horizontal} = \text{STRETCH}: \quad & L_c = X_c - X_p, \quad R_c = W_p - (L_c + W_c), \quad W_c = \text{fluid}
\end{aligned}$$

This ensures that fluid percentages or fixed constraints are resolved dynamically with sub-pixel accuracy, preventing layout overlap across mobile and tablet breakpoints.

---

## 2. Collaborative Conflict-Free Replicated Data Types (CRDT Engine)

To support seamless multiplayer co-authoring without a central master locking state, the system employs a hybrid **Last-Write-Wins (LWW) Element-Set and Logical Lamport Vector Clock** replication model.

### 2.1 Causal Ordering & Clock Comparison
Let a Vector Clock $V$ be represented as a map of Actor IDs to sequence numbers: $V = \{ a_1: s_1, a_2: s_2, \dots, a_n: s_n \}$.
For any two concurrent operations $Op_1$ and $Op_2$ with clocks $V_1$ and $V_2$:

1. $V_1$ **dominates** $V_2$ ($V_1 > V_2$) if and only if:
   $$\forall k \in \text{Actors}, \quad V_1[k] \geq V_2[k] \quad \land \quad \exists k \in \text{Actors}, \quad V_1[k] > V_2[k]$$
2. If neither clock dominates, $Op_1$ and $Op_2$ are considered **concurrent** ($V_1 \parallel V_2$). In this event, we fall back to a physical write-timestamp tie-breaker:
   $$\text{Winner} = \begin{cases}
   Op_1, & \text{if } t_1 > t_2 \\
   Op_2, & \text{if } t_2 > t_1 \\
   \text{Deterministic ID compare}, & \text{if } t_1 = t_2
   \end{cases}$$

---

## 3. High-Performance Compiler & AST Rendering Pipeline

Our rendering architecture breaks away from slow, runtime React hydration engines. It compiles page JSON directly into an **Abstract Syntax Tree (AST)**, extracts and minifies scoped styling rules, and streams optimized static markup to clients.

```
       [ Page Builder JSON ]
                 │
                 ▼
         [ Build AST Graph ] ──► [ Asset Dependency Graph ] (Preload/Font preconnect)
                 │
                 ▼
       [ CSS Atomic Extractor ] (Extract rules, inject c-1, c-2 class markers)
                 │
                 ▼
    [ Incremental Graph Compiler ] (Skip untouched nodes, compile only dirty branches)
                 │
                 ▼
  [ standalone index.html Stream ] ──► [ Global Edge KV Store ] (Serving in <10ms TTFB)
```

---

## 4. Distributed Resilient Infrastructure (Autoscaling & Self-Healing)

The background worker fleet is designed to be completely decoupled and self-healing.

### 4.1 Heartbeat Mesh & Node Discovery
- Worker instances register themselves to `saas:fleet:discovery` with a Time-To-Live (TTL) lease of 10 seconds.
- Every 3 seconds, nodes invoke `pingHeartbeat` with current resource utilization metrics (CPU, Memory).
- A centralized stalled job daemon scans the active leases. If a node fails to ping before the TTL expires (e.g. process crashes or container is terminated), it is automatically evicted from the cluster, and its assigned, uncompleted build jobs are safely re-queued with exponential backoff.

### 4.2 Workload Auto-scaling (KEDA Formula)
The autoscaler monitors both CPU pressure and total Redis queue backlog sizes. The target replica worker container count $R_t$ is computed dynamically using:

$$R_t = \min\left( R_{\text{max}}, \max\left( R_{\text{min}}, \left\lceil \frac{J_{\text{backlog}}}{J_{\text{threshold}}} \right\rceil \right) \right)$$

Where:
- $J_{\text{backlog}}$ is the total number of pending jobs in Redis queues.
- $J_{\text{threshold}}$ is the desired jobs backlog density per worker (default: 25).
- $R_{\text{min}}$ and $R_{\text{max}}$ represent cluster scaling boundaries.
