import { BookOpen, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PerformanceAnalysis, PerformanceLevel } from "@/data/mockMetrics";

interface PerformanceReadingProps {
  analysis: PerformanceAnalysis;
  performanceLevel: PerformanceLevel;
}

const levelColors = {
  good: "text-emerald-600 dark:text-emerald-400",
  medium: "text-amber-600 dark:text-amber-400",
  improve: "text-red-600 dark:text-red-400",
};

const levelBgColors = {
  good: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
  medium: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
  improve: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
};

export function PerformanceReading({ analysis, performanceLevel }: PerformanceReadingProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Lecture de la performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className={`p-4 rounded-lg border ${levelBgColors[performanceLevel]}`}>
          <p className={`font-medium ${levelColors[performanceLevel]}`}>
            {analysis.summary}
          </p>
        </div>

        {/* Explanations */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Pourquoi ?</p>
          {analysis.explanations.map((explanation, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium">{index + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        {analysis.recommendation && (
          <>
            <Separator />
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary mb-1">Suggestion</p>
                <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for cards
export function PerformanceReadingCompact({ analysis, performanceLevel }: PerformanceReadingProps) {
  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`p-3 rounded-lg border ${levelBgColors[performanceLevel]}`}>
        <p className={`text-sm font-medium ${levelColors[performanceLevel]}`}>
          {analysis.summary}
        </p>
      </div>

      {/* First explanation only */}
      {analysis.explanations.length > 0 && (
        <p className="text-sm text-muted-foreground pl-1">
          {analysis.explanations[0]}
        </p>
      )}

      {/* Recommendation hint */}
      {analysis.recommendation && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <Lightbulb className="h-3 w-3" />
          <span>Voir la suggestion</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
