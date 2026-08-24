export type GoalPriority = "high" | "medium" | "low";
export type GoalColor = "mint" | "blush" | "lilac" | "butter";

export interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;               // lucide icon name
  color: GoalColor;
  priority: GoalPriority;
  saved: number;
  target: number;
  monthlyContribution: number;
  motivation: string;
  date: string;               // YYYY-MM-DD
}
