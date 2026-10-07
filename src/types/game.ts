export type AgeGroup = 'kid' | 'teenager' | 'adult';

export type GameCategory =
  | 'All'
  | 'Math & Logic'
  | 'Equations'
  | 'Memory & Recall'
  | 'Vocabulary'
  | 'Focus & Speed'
  | 'Practical Life';

export interface GameInfo {
  id: string;
  title: string;
  category: Exclude<GameCategory, 'All'>;
  description: string;
  tagline: string;
  skillsTrained: string[];
  instructions: string[];
  difficultyInfo: {
    kid: string;
    teenager: string;
    adult: string;
  };
  tags: string[];
  popular?: boolean;
  accentColor: string;
  rating: number;
  usersTrained: string;
}
