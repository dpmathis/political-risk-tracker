// Risk level classifications
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Severe';

// Trend directions
export type Trend = 'increasing' | 'stable' | 'decreasing';

// Domain identifiers
export type DomainId = 'rule-of-law' | 'operating-economic' | 'societal-institutional';

// Rubric scoring tiers
export interface Rubric {
  '1-2': string;
  '3-4': string;
  '5-6': string;
  '7-8': string;
  '9-10': string;
}

// Category metadata (static)
export interface Category {
  id: string;
  name: string;
  domain: DomainId;
  domainName: string;
  description: string;
  rubric: Rubric;
}

// Categories data file structure
export interface CategoriesData {
  categories: Category[];
}

// Individual category score
export interface CategoryScore {
  score: number;
  trend: Trend;
  keyFindings: string[];
  sources?: string[];
  lastUpdated: string;
}

// Domain scores mapping
export interface DomainScores {
  'rule-of-law': number;
  'operating-economic': number;
  'societal-institutional': number;
}

// Current assessment data structure
export interface CurrentAssessment {
  assessmentDate: string;
  assessmentPeriod: string;
  scores: Record<string, CategoryScore>;
  domainScores: DomainScores;
  overallScore: number;
  riskLevel: RiskLevel;
}

// Historical data point for a single category
export interface HistoricalDataPoint {
  date: string;
  score: number;
  riskLevel: RiskLevel;
}

// Historical snapshot (stored per date)
export interface HistoricalSnapshot {
  date: string;
  scores: Record<string, number>;
  domainScores: DomainScores;
  overallScore: number;
  riskLevel: RiskLevel;
}

// Chart data point for Recharts
export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

// Domain display info
export interface DomainInfo {
  id: DomainId;
  name: string;
  categories: string[];
}

// State-level risk data
export interface StateRiskData {
  stateCode: string;
  stateName: string;
  overallRisk: number;
  trend: Trend;
  categories: Record<string, number>;
}

// States data file structure
export interface StatesData {
  states: StateRiskData[];
}
