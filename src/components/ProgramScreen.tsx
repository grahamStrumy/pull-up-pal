import { formatShortWeekday, formatWorkoutLabel, getCompletionLabel } from '../lib/program'
import type { ProgramDay } from '../types/program'

export function ProgramScreen({
  programWeeks,
  completedDays,
  totalTrainingDays,
}: {
  programWeeks: Array<{ week: number; days: ProgramDay[] }>
  completedDays: number
  totalTrainingDays: number
}) {
  return (
    <section className="stack-card">
      <div className="card-header">
        <div>
          <p className="section-label">Full Program</p>
          <h2>8 week planner</h2>
        </div>
        <span className="status-pill status-pill-neutral">
          {completedDays}/{totalTrainingDays} done
        </span>
      </div>

      <div className="program-groups">
        {programWeeks.map((week) => (
          <section className="program-week" key={week.week}>
            <div className="program-week-header">
              <div>
                <p className="section-label">Week {week.week}</p>
                <h3>{formatWorkoutLabel(week.days.find((day) => day.workout)?.workout)}</h3>
              </div>
              <span className="week-status">
                {week.days.filter((day) => day.type === 'training' && day.status === 'complete').length}{' '}
                complete
              </span>
            </div>
            <div className="week-list">
              {week.days.map((day) => (
                <article className="week-item" key={day.id}>
                  <div>
                    <p className="week-day">
                      {formatShortWeekday(day.date)} | {day.date} | Week {day.week}
                    </p>
                    <p className="week-detail">{formatWorkoutLabel(day.workout)}</p>
                  </div>
                  <div className="week-item-meta">
                    <span
                      className={
                        day.type === 'training'
                          ? 'status-pill status-pill-train'
                          : 'status-pill status-pill-rest'
                      }
                    >
                      {day.type === 'training' ? 'Training' : 'Rest'}
                    </span>
                    <span className="week-status">{getCompletionLabel(day.status)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
