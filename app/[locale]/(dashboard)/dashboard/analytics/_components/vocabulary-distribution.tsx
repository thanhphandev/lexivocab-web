interface VocabularyDistributionProps {
  activeWords: number;
  masteredWords: number;
  totalWords: number;
  t: (key: string) => string;
}

export function VocabularyDistribution({
  activeWords,
  masteredWords,
  totalWords,
  t,
}: VocabularyDistributionProps) {
  const activePercentage = (activeWords / Math.max(totalWords, 1)) * 100;
  const masteredPercentage = (masteredWords / Math.max(totalWords, 1)) * 100;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-semibold mb-4">{t("distribution")}</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{t("activeLearning")}</span>
            <span className="font-medium">{activeWords}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{t("mastered")}</span>
            <span className="font-medium">{masteredWords}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-emerald-500 rounded-full h-2"
              style={{ width: `${masteredPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
