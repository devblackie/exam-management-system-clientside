// clientside/src/app/demo/components/types.ts

export type NodeType = "ACADEMIC" | "STATUS_CHANGE" | "CARRY_FORWARD" | "GRADUATION";

export interface TimelineChallenges {
  supplementary: string[];
  retakes: string[];
  stayouts: string[];
  specials: string[];
  carryForwards: string[];
  deferred: string[];
  incomplete: string[];
}

export interface MockTimelineNode {
  type: NodeType;
  yearOfStudy?: number;
  academicYear: string;
  status?: string;
  annualMean?: number;
  weight?: number;
  totalUnits?: number;
  qualifierSuffix?: string;
  isRepeat?: boolean;
  isCurrent?: boolean;
  challenges?: TimelineChallenges;
  toStatus?: string;
  fromStatus?: string;
  reason?: string;
  cfUnits?: string[];
  qualifier?: string;
}

export interface MockStudent {
  regNo: string;
  name: string;
  program: string;
  status: string;
  currentYear: number;
  cumulativeMean: string;
  classification: string;
  admissionYear: string;
  intake: string;
  totalTimeOutYears: number;
  timeline: MockTimelineNode[];
}

export interface MockPromoStudent {
  regNo: string;
  name: string;
  status: "PASS" | "SUPP" | "REPEAT" | "STAYOUT" | "LEAVE";
  details: string;
  mean: string;
  passed: number;
  failed: number;
  total: number;
}

export type ScreenId = "journey" | "promotion" | "engine";