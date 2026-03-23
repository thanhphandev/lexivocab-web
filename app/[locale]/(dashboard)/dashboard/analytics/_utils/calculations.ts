export function calculateMasteryRate(mastered: number, total: number): number {
  return Math.round((mastered / Math.max(total, 1)) * 100);
}

export function calculatePercentage(value: number, total: number): number {
  return (value / Math.max(total, 1)) * 100;
}
