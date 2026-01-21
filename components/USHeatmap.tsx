'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { StateRiskData } from '@/lib/types';
import { getRiskLevel, getScoreColor, getTrendIcon, getTrendColor } from '@/lib/risk-levels';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USHeatmapProps {
  states: StateRiskData[];
}

interface TooltipData {
  name: string;
  risk: number;
  trend: string;
  x: number;
  y: number;
}

export default function USHeatmap({ states }: USHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selectedState, setSelectedState] = useState<StateRiskData | null>(null);

  const statesByName = states.reduce((acc, state) => {
    acc[state.stateName] = state;
    return acc;
  }, {} as Record<string, StateRiskData>);

  const handleMouseEnter = (geo: { properties: { name: string } }, event: React.MouseEvent) => {
    const stateName = geo.properties.name;
    const stateData = statesByName[stateName];
    if (stateData) {
      setTooltip({
        name: stateName,
        risk: stateData.overallRisk,
        trend: stateData.trend,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleClick = (geo: { properties: { name: string } }) => {
    const stateName = geo.properties.name;
    const stateData = statesByName[stateName];
    if (stateData) {
      setSelectedState(selectedState?.stateName === stateName ? null : stateData);
    }
  };

  const categoryNames: Record<string, string> = {
    'elections': 'Elections',
    'rule-of-law': 'Rule of Law',
    'national-security': 'National Security',
    'regulatory-stability': 'Regulatory Stability',
    'trade-policy': 'Trade Policy',
    'government-contracts': 'Gov\'t Contracts',
    'fiscal-policy': 'Fiscal Policy',
    'media-freedom': 'Media Freedom',
    'civil-discourse': 'Civil Discourse',
    'institutional-integrity': 'Institutional Integrity',
  };

  return (
    <div className="bg-white dark:bg-navy-600 rounded-xl shadow-ln-medium border border-navy/10 overflow-hidden">
      <div className="p-4 border-b border-navy/10">
        <h2 className="text-lg font-semibold text-navy dark:text-cream">
          State-Level Risk Assessment
        </h2>
        <p className="text-sm text-navy/60 dark:text-cream/60 mt-1">
          Click on a state to view detailed breakdown
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Map */}
        <div className="flex-1 relative">
          <ComposableMap
            projection="geoAlbersUsa"
            className="w-full h-auto"
            projectionConfig={{ scale: 1000 }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name;
                  const stateData = statesByName[stateName];
                  const fillColor = stateData
                    ? getScoreColor(stateData.overallRisk)
                    : '#e5e5e5';
                  const isSelected = selectedState?.stateName === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => handleMouseEnter(geo, e)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleClick(geo)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isSelected ? '#0E2344' : '#fff',
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        hover: {
                          fill: fillColor,
                          stroke: '#0E2344',
                          strokeWidth: 1.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: '#0E2344',
                          strokeWidth: 2,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 bg-navy text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
              style={{
                left: tooltip.x + 10,
                top: tooltip.y - 40,
              }}
            >
              <div className="font-semibold">{tooltip.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ color: getScoreColor(tooltip.risk) }}>
                  {tooltip.risk.toFixed(1)}
                </span>
                <span className="text-cream/60">
                  {getRiskLevel(tooltip.risk)}
                </span>
                <span className={getTrendColor(tooltip.trend as 'increasing' | 'stable' | 'decreasing')}>
                  {getTrendIcon(tooltip.trend as 'increasing' | 'stable' | 'decreasing')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* State Detail Panel */}
        {selectedState && (
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-navy/10 p-4 bg-cream/50 dark:bg-navy-700/50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-navy dark:text-cream">
                  {selectedState.stateName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getScoreColor(selectedState.overallRisk) }}
                  >
                    {selectedState.overallRisk.toFixed(1)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${getScoreColor(selectedState.overallRisk)}20`,
                      color: getScoreColor(selectedState.overallRisk),
                    }}
                  >
                    {getRiskLevel(selectedState.overallRisk)}
                  </span>
                  <span className={`${getTrendColor(selectedState.trend)}`}>
                    {getTrendIcon(selectedState.trend)} {selectedState.trend}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedState(null)}
                className="text-navy/40 hover:text-navy dark:text-cream/40 dark:hover:text-cream"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-navy/60 dark:text-cream/60 uppercase tracking-wider mb-2">
                Category Breakdown
              </div>
              {Object.entries(selectedState.categories).map(([categoryId, score]) => (
                <div key={categoryId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-navy dark:text-cream truncate">
                      {categoryNames[categoryId] || categoryId}
                    </div>
                  </div>
                  <div
                    className="w-16 h-1.5 rounded-full bg-navy/10 dark:bg-cream/10 overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${score * 10}%`,
                        backgroundColor: getScoreColor(score),
                      }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium w-6 text-right"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
