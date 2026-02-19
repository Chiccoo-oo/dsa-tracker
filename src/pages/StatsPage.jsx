import React from 'react';
import { DSA_PLAN, getTotalStats } from '../data/problems';
import { Nav } from './Dashboard';

export default function StatsPage({ progress, navigate }) {
  const { totalProblems, solvedProblems } = getTotalStats(progress);
  const pct = Math.round((solvedProblems / totalProblems) * 100) || 0;

  const allDays = [];
  DSA_PLAN.forEach(m => m.weeks.forEach(w => w.days.forEach(d => allDays.push({ ...d, month: m.monthTitle, week: w.weekTitle }))));

  // Per-month stats
  const monthStats = DSA_PLAN.map(month => {
    const days = month.weeks.flatMap(w => w.days);
    const solved = days.flatMap(d => d.problems.filter(p => progress[`${d.day}-${p.id}`])).length;
    const total = days.flatMap(d => d.problems).length;
    return { ...month, solved, total, pct: Math.round((solved / total) * 100) || 0 };
  });

  // Problem difficulty stats
  let easy = 0, medium = 0, hard = 0, easyT = 0, medT = 0, hardT = 0;
  allDays.forEach(day => {
    day.problems.forEach(p => {
      if (p.difficulty === 'Easy') { easyT++; if (progress[`${day.day}-${p.id}`]) easy++; }
      if (p.difficulty === 'Medium') { medT++; if (progress[`${day.day}-${p.id}`]) medium++; }
      if (p.difficulty === 'Hard') { hardT++; if (progress[`${day.day}-${p.id}`]) hard++; }
    });
  });

  // Completed days
  const completedDays = allDays.filter(d => {
    return d.problems.every(p => progress[`${d.day}-${p.id}`]);
  }).length;

  // Most solved in a day
  const dayBests = allDays.map(d => ({
    day: d.day,
    title: d.dayTitle,
    solved: d.problems.filter(p => progress[`${d.day}-${p.id}`]).length,
    total: d.problems.length,
  })).sort((a, b) => b.solved - a.solved).slice(0, 5);

  return (
    <div>
      <Nav navigate={navigate} />
      <div className="page">
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">Analytics</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Your Stats</h2>
        </div>

        {/* OVERVIEW */}
        <div className="stats-row fade-up">
          <div className="stat-card">
            <div className="stat-num">{solvedProblems}</div>
            <div className="stat-label">Total Solved</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{pct}%</div>
            <div className="stat-label">Completion</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{completedDays}</div>
            <div className="stat-label">Days Finished</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{allDays.length - completedDays}</div>
            <div className="stat-label">Days Remaining</div>
          </div>
        </div>

        <div className="grid-2 fade-up fade-up-1" style={{ marginBottom: 20 }}>
          {/* DIFFICULTY */}
          <div className="card">
            <div className="card-title">🎯 By Difficulty</div>
            {[
              { label: 'Easy', solved: easy, total: easyT, color: 'var(--easy)' },
              { label: 'Medium', solved: medium, total: medT, color: 'var(--medium)' },
              { label: 'Hard', solved: hard, total: hardT, color: 'var(--hard)' },
            ].map(d => (
              <div key={d.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    <span style={{ color: d.color }}>{d.solved}</span>
                    <span style={{ color: 'var(--muted)' }}>/{d.total}</span>
                  </span>
                </div>
                <div className="progress-bar-wrap" style={{ height: 10 }}>
                  <div className="progress-bar-fill" style={{
                    width: d.total ? `${(d.solved / d.total) * 100}%` : '0%',
                    background: d.color,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                  {d.total ? Math.round((d.solved / d.total) * 100) : 0}% complete
                </div>
              </div>
            ))}
          </div>

          {/* TOP DAYS */}
          <div className="card">
            <div className="card-title">🏆 Most Solved Days</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dayBests.map((d, i) => (
                <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: i === 0 ? 'rgba(255,209,102,0.2)' : 'var(--bg3)',
                    border: `1px solid ${i === 0 ? 'rgba(255,209,102,0.4)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: i === 0 ? 'var(--yellow)' : 'var(--muted)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Day {d.day}: {d.title}
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 4, marginTop: 4 }}>
                      <div className="progress-bar-fill" style={{ width: `${(d.solved / d.total) * 100}%` }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', flexShrink: 0 }}>
                    {d.solved}/{d.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MONTH BREAKDOWN */}
        <div className="card fade-up fade-up-2">
          <div className="card-title">📅 Month by Month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {monthStats.map(m => (
              <div key={m.month}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Month {m.month}: {m.monthTitle}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{m.monthSubtitle}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    <span style={{ color: 'var(--accent)' }}>{m.solved}</span>
                    <span style={{ color: 'var(--muted)' }}>/{m.total} ({m.pct}%)</span>
                  </span>
                </div>
                <div className="progress-bar-wrap" style={{ height: 12 }}>
                  <div className="progress-bar-fill" style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOTIVATION */}
        <div className="card fade-up fade-up-3" style={{ textAlign: 'center', padding: '32px 24px' }}>
          {pct === 0 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Ready to Begin?</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>Start with Day 1 — every expert was once a beginner.</div>
            </>
          )}
          {pct > 0 && pct < 25 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💪</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Great Start! Keep Going!</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>You've solved {solvedProblems} problems. Consistency is the key!</div>
            </>
          )}
          {pct >= 25 && pct < 50 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>You're On Fire!</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>25%+ done. Most people quit here — you're different.</div>
            </>
          )}
          {pct >= 50 && pct < 75 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Halfway There!</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>You've crossed the halfway mark. The hardest part is done.</div>
            </>
          )}
          {pct >= 75 && pct < 100 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Almost There!</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>75%+ complete. You're interview-ready. Finish strong!</div>
            </>
          )}
          {pct === 100 && (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎓</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>You Did It!!!</div>
              <div style={{ color: 'var(--muted)', fontSize: 14 }}>100% complete! Go crush those interviews!</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
