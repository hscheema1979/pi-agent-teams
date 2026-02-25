/**
 * OMC Types - Core data structures for OMC engines
 */

export interface OMCTask {
  id: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
}

export interface OMCTeam {
  name: string;
  mode: "manual" | "autopilot" | "verified" | "rawr" | "swarm";
  members: string[];
  status: "active" | "idle" | "complete";
  tasks: OMCTask[];
  createdAt: Date;
}

export interface VerificationResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    details?: string;
  }[];
  iteration: number;
  maxIterations: number;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  parallelGroups: ExecutionStep[][];
  estimatedTime: number;
}

export interface ExecutionStep {
  id: string;
  name: string;
  dependsOn?: string[];
  parallelizable: boolean;
}

export interface SwarmConfig {
  teamCount: number;
  agentsPerTeam: number;
  coordinationMode: "sequential" | "parallel" | "adaptive";
  emergenceThreshold: number;
}

export interface OMCEngineConfig {
  mode: "autopilot" | "verified" | "rawr" | "swarm";
  maxIterations?: number;
  parallelLevel?: number;
  verificationStrict?: boolean;
}
