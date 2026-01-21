'use client';

import Link from 'next/link';
import { Category, CategoryScore, DomainId } from '@/lib/types';
import { getRiskLevel, getScoreColor } from '@/lib/risk-levels';
import { getDomainInfo } from '@/lib/scoring';

interface MekkoChartProps {
  categories: Category[];
  scores: Record<string, CategoryScore>;
  domainScores: Record<DomainId, number>;
}

interface DomainData {
  id: DomainId;
  name: string;
  score: number;
  categories: Array<{
    id: string;
    name: string;
    score: number;
    trend: string;
  }>;
}

export default function MekkoChart({ categories, scores, domainScores }: MekkoChartProps) {
  const domains: DomainId[] = ['rule-of-law', 'operating-economic', 'societal-institutional'];

  const domainData: DomainData[] = domains.map((domainId) => {
    const domainInfo = getDomainInfo(domainId);
    const domainCategories = categories
      .filter((c) => c.domain === domainId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        score: scores[c.id]?.score ?? 0,
        trend: scores[c.id]?.trend ?? 'stable',
      }));

    return {
      id: domainId,
      name: domainInfo.name,
      score: domainScores[domainId],
      categories: domainCategories,
    };
  });

  // Calculate total categories for width proportions
  const totalCategories = categories.length;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      default: return '→';
    }
  };

  return (
    <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 overflow-hidden">
      <div className="p-4 border-b border-navy/10">
        <h2 className="text-lg font-semibold text-navy dark:text-cream">
          Risk by Domain & Category
        </h2>
        <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
          Click any category to view details
        </p>
      </div>

      <div className="flex min-h-[400px]">
        {domainData.map((domain) => {
          const widthPercent = (domain.categories.length / totalCategories) * 100;

          return (
            <div
              key={domain.id}
              className="border-r border-navy/10 last:border-r-0 flex flex-col"
              style={{ width: `${widthPercent}%` }}
            >
              {/* Domain Header */}
              <div className="p-3 bg-navy/5 dark:bg-cream/5 border-b border-navy/10">
                <div className="text-xs font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider mb-1">
                  {domain.name}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(domain.score) }}
                  >
                    {domain.score.toFixed(1)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${getScoreColor(domain.score)}20`,
                      color: getScoreColor(domain.score),
                    }}
                  >
                    {getRiskLevel(domain.score)}
                  </span>
                </div>
              </div>

              {/* Category Blocks */}
              <div className="flex-1 flex flex-col">
                {domain.categories.map((category) => {
                  const color = getScoreColor(category.score);
                  const intensity = Math.min(0.15 + (category.score / 10) * 0.35, 0.5);

                  return (
                    <Link
                      key={category.id}
                      href={`/category/${category.id}`}
                      className="flex-1 p-3 border-b border-navy/5 last:border-b-0 hover:bg-navy/5 dark:hover:bg-cream/5 transition-colors group relative"
                      style={{
                        backgroundColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-navy dark:text-cream truncate group-hover:text-navy-700 dark:group-hover:text-white">
                            {category.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className="text-lg font-bold"
                            style={{ color }}
                          >
                            {category.score}
                          </span>
                          <span
                            className={`text-sm ${
                              category.trend === 'increasing'
                                ? 'text-red-500'
                                : category.trend === 'decreasing'
                                ? 'text-green-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {getTrendIcon(category.trend)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="mt-2 h-1.5 rounded-full bg-navy/10 dark:bg-cream/10 overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${category.score * 10}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-3 bg-navy/5 dark:bg-cream/5 border-t border-navy/10 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22c55e' }} />
          <span className="text-navy/60 dark:text-cream/60">Low (1-2.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#eab308' }} />
          <span className="text-navy/60 dark:text-cream/60">Moderate (3-4.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f97316' }} />
          <span className="text-navy/60 dark:text-cream/60">Elevated (5-6.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-navy/60 dark:text-cream/60">High (7-8.9)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#991b1b' }} />
          <span className="text-navy/60 dark:text-cream/60">Severe (9-10)</span>
        </div>
      </div>
    </div>
  );
}
