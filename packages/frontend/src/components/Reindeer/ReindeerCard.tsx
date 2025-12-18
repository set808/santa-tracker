import type { ReindeerStatus } from 'shared-types';
import ProgressBar from '../UI/ProgressBar';
import StatusBadge from '../UI/StatusBadge';

interface ReindeerCardProps {
  reindeer: ReindeerStatus;
}

export default function ReindeerCard({ reindeer }: ReindeerCardProps) {
  const getReindeerEmoji = (name: string) => {
    if (name === 'Rudolph') return '🦌🔴'; // Rudolph with red nose
    return '🦌';
  };

  const getPositionBadge = (position: string) => {
    const badges = {
      lead: { emoji: '⭐', label: 'Lead', color: 'bg-yellow-500' },
      middle: { emoji: '➡️', label: 'Middle', color: 'bg-blue-500' },
      rear: { emoji: '🔙', label: 'Rear', color: 'bg-gray-500' },
    };
    const badge = badges[position as keyof typeof badges];
    return (
      <span className={`${badge.color} text-white text-xs px-2 py-0.5 rounded-full`}>
        {badge.emoji} {badge.label}
      </span>
    );
  };

  const getHealthColor = (value: number): 'green' | 'gold' | 'red' => {
    if (value >= 70) return 'green';
    if (value >= 40) return 'gold';
    return 'red';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{getReindeerEmoji(reindeer.name)}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{reindeer.name}</h3>
            {getPositionBadge(reindeer.position)}
          </div>
        </div>
        <StatusBadge
          status={reindeer.status}
          type="health"
          size="sm"
        />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Energy */}
        <ProgressBar
          value={reindeer.energy}
          label="Energy"
          showPercentage
          color={getHealthColor(reindeer.energy)}
          size="sm"
        />

        {/* Health */}
        <ProgressBar
          value={reindeer.health}
          label="Health"
          showPercentage
          color={getHealthColor(reindeer.health)}
          size="sm"
        />

        {/* Morale */}
        <ProgressBar
          value={reindeer.morale}
          label="Morale"
          showPercentage
          color={getHealthColor(reindeer.morale)}
          size="sm"
        />
      </div>

      {/* Speed Contribution */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Speed Contribution</span>
          <span className="text-newrelic-green font-semibold">
            {reindeer.speedContribution?.toFixed(1) ?? '0.0'}%
          </span>
        </div>
      </div>

      {/* Special Ability (Rudolph) */}
      {reindeer.specialAbility && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">💡</span>
            <div className="flex-1">
              <p className="text-xs text-gray-400">Special Ability</p>
              <p className="text-sm text-christmas-gold font-semibold">
                {reindeer.specialAbility}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning indicators */}
      {(reindeer.energy < 30 || reindeer.health < 30 || reindeer.morale < 30) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <span>⚠️</span>
            <span>
              {reindeer.status === 'exhausted' ? 'Needs immediate rest!' : 'Monitoring closely'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
