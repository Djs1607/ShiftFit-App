import { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { useStore } from '../lib/store';
import { uid } from '../lib/storage';
import { localISO } from '../lib/schedule';
import { PLANS } from '../lib/plans';
import { WORKOUT_LIBRARY } from '../lib/library';
import { Badge, Button, Card, EmptyState } from '../components/ds';

export default function Plan() {
  const { user, userWorkouts, userActivePlan, dispatch } = useStore();

  if (!user) return null;

  const activePlan = userActivePlan ? PLANS.find((p) => p.id === userActivePlan.planId) ?? null : null;

  // Progress is driven by actual completed sessions tagged with this plan,
  // not by wall-clock time — starting a plan and never training it stays at 0%.
  const progress = useMemo(() => {
    if (!activePlan) return null;
    const totalSessions = activePlan.weeks * activePlan.sessionsPerWeek;
    const completedSessions = Math.min(
      totalSessions,
      userWorkouts.filter((w) => w.planId === activePlan.id && w.completed).length
    );
    const week = Math.min(activePlan.weeks, Math.floor(completedSessions / activePlan.sessionsPerWeek) + 1);
    const pct = totalSessions === 0 ? 0 : (completedSessions / totalSessions) * 100;
    const nextLibId = activePlan.sessionTemplate[completedSessions % activePlan.sessionsPerWeek];
    const nextUp = WORKOUT_LIBRARY.find((l) => l.id === nextLibId) ?? null;
    return { week, totalSessions, completedSessions, pct, nextUp, isComplete: completedSessions >= totalSessions };
  }, [activePlan, userWorkouts]);

  function startPlan(planId: string) {
    dispatch({ type: 'startPlan', record: { id: uid(), userId: user!.id, planId, startedAt: localISO(new Date()) } });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-fg-primary">Plan</h1>

      {activePlan && progress ? (
        <Card tone="default" padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-surface-inset">
                <activePlan.icon size={18} strokeWidth={2} className="text-fg-secondary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[17px] font-semibold text-fg-primary truncate">{activePlan.name}</p>
                <p className="text-[13px] text-fg-tertiary">Week {progress.week} of {activePlan.weeks}</p>
              </div>
            </div>
            <Badge tone="neutral">{progress.isComplete ? 'Complete' : 'Active'}</Badge>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Sessions</span>
              <span className="font-mono text-[13px] font-medium text-fg-secondary">
                {progress.completedSessions} of {progress.totalSessions}
              </span>
            </div>
            <div className="overflow-hidden rounded-pill bg-data-track" style={{ height: 8 }}>
              <div
                className="h-full rounded-pill bg-fg-tertiary transition-[width] duration-slow ease-mechanical"
                style={{ width: `${progress.pct}%` }}
              />
            </div>
          </div>

          {!progress.isComplete && progress.nextUp && (
            <p className="text-[13px] text-fg-secondary">
              Next up on Today: <span className="text-fg-primary font-medium">{progress.nextUp.name}</span>
            </p>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No plan selected"
          message="Pick a training block and it will adapt to your shift pattern automatically."
          action={
            <Button
              variant="accent"
              onClick={() => document.getElementById('plan-browser')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Browse plans
            </Button>
          }
        />
      )}

      <div id="plan-browser" className="space-y-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-fg-tertiary">Training blocks</h2>
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const isActive = plan.id === userActivePlan?.planId;
            return (
              <Card key={plan.id} tone="default" padding="lg" className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-surface-inset">
                    <plan.icon size={18} strokeWidth={2} className="text-fg-secondary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-[16px] font-bold text-fg-primary truncate">{plan.name}</p>
                      {isActive && <Badge tone="neutral">Active</Badge>}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[12px] text-fg-tertiary">
                      <span>{plan.weeks} {plan.weeks === 1 ? 'week' : 'weeks'}</span>
                      <span aria-hidden>·</span>
                      <span>{plan.frequencyLabel}</span>
                    </p>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed text-fg-secondary">{plan.description}</p>
                <Button variant="accent" fullWidth disabled={isActive} onClick={() => startPlan(plan.id)}>
                  {isActive ? 'Current plan' : 'Start plan'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
