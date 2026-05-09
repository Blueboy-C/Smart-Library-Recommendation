export interface StudentProfile {
  student_id: string;
  grade: string;
  major: string;
  interest_keywords: [string, number][];
  domain_weights: Record<string, number>;
  time_preference: string;
  reading_depth: number;
  reading_breadth: number;
  interest_stability: number;
  borrow_count: number;
  course_count: number;
  cross_domain_signal: boolean;
  analysis?: { type: string; strength: string };
}

export interface RecommendItem {
  item_id: string;
  item_type: 'book' | 'course' | 'activity';
  title: string;
  reason: string;
  score: number;
  available: boolean;
}

export interface RecommendResponse {
  student_id: string;
  items: RecommendItem[];
}

export interface FeedbackStats {
  total_feedback: number;
  useful: number;
  skipped: number;
  adoption_rate: number;
}

export interface FeedbackRecord {
  item_id: string;
  title: string;
  item_type: 'book' | 'course' | 'activity';
  score: number;
  reason: string;
  recommended_at: string;
  feedback?: 'useful' | 'skip';
}
