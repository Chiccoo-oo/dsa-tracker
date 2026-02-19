import React, { useState } from 'react';
import { DSA_PLAN } from '../data/problems';
import { Nav } from './Dashboard';

export default function PlanView({ progress, navigate, selectedWeek }) {
  const [openMonth, setOpenMonth] = useState(selectedWeek || 1);

  const getDayBadgeClass = (theme) => {
    if (theme === 'yellow') return 'badge-yellow';
    if (theme === 'blue') return 'badge-blue';
    return 'badge-green';
  };

  return (
    <div>
      <Nav navigate={navigate} />
      <div className="page">
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">Full Study Plan</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>5-Month DSA Roadmap</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Click any day to start solving problems</p>
        </div>

        {DSA_PLAN.map(month => {
          const monthSolved = month.weeks.flatMap(w => w.days.flatMap(d => d.problems.filter(p => progress[`${d.day}-${p.id}`]))).length;
          const monthTotal = month.weeks.flatMap(w => w.days.flatMap(d => d.problems)).length;
          const mPct = Math.round((monthSolved / monthTotal) * 100) || 0;

          return (
            <div key={month.month} style={{ marginBottom: 24 }}>
              <div
                className="month-header"
                onClick={() => setOpenMonth(openMonth === month.month ? null : month.month)}
              >
                <div className="month-num">M{month.month}</div>
                <div className="month-info">
                  <h3>Month {month.month}: {month.monthTitle}</h3>
                  <p>{month.monthSubtitle}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>{mPct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{monthSolved}/{monthTotal}</div>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 18, transition: 'transform 0.2s', transform: openMonth === month.month ? 'rotate(90deg)' : 'none' }}>›</div>
                </div>
              </div>

              {openMonth === month.month && (
                <div style={{ paddingLeft: 8 }}>
                  {month.weeks.map(week => {
                    const weekSolved = week.days.flatMap(d => d.problems.filter(p => progress[`${d.day}-${p.id}`])).length;
                    const weekTotal = week.days.flatMap(d => d.problems).length;
                    const wPct = Math.round((weekSolved / weekTotal) * 100) || 0;

                    return (
                      <div key={week.week} style={{ marginBottom: 16 }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px',
                          background: 'var(--bg3)',
                          borderRadius: 8,
                          marginBottom: 8,
                          borderLeft: '3px solid var(--accent)'
                        }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>WEEK {week.week}</span>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{week.weekTitle}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{weekSolved}/{weekTotal} <span style={{ color: 'var(--accent)' }}>({wPct}%)</span></span>
                        </div>

                        <div className="day-list">
                          {week.days.map(day => {
                            const solved = day.problems.filter(p => progress[`${day.day}-${p.id}`]).length;
                            const total = day.problems.length;
                            const complete = solved === total;
                            return (
                              <div
                                key={day.day}
                                className="day-item"
                                style={complete ? { borderColor: 'rgba(6,214,160,0.3)', background: 'rgba(6,214,160,0.04)' } : {}}
                                onClick={() => navigate('day', day, week)}
                              >
                                <div className={`day-num-badge ${getDayBadgeClass(day.theme)}`}>
                                  {complete ? '✓' : `D${day.day}`}
                                </div>
                                <div className="day-info">
                                  <h5>{day.dayTitle}</h5>
                                  <p>{day.concepts.join(' · ')}</p>
                                </div>
                                <div className="day-count">
                                  <span>{solved}</span>/{total}
                                </div>
                                <div style={{ color: 'var(--muted)', fontSize: 14 }}>›</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
