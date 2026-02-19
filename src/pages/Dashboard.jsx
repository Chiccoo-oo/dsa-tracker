import React from 'react';
import { DSA_PLAN, getTotalStats } from '../data/problems';

function Nav({ navigate }) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate('dashboard')}>{'</>'} DSA Tracker</div>
      <button className="nav-btn" onClick={() => navigate('dashboard')}>Home</button>
      <button className="nav-btn" onClick={() => navigate('plan')}>Plan</button>
      <button className="nav-btn" onClick={() => navigate('stats')}>Stats</button>
    </nav>
  );
}

export { Nav };

export default function Dashboard({ progress, navigate }) {
  const { totalProblems, solvedProblems, totalDays } = getTotalStats(progress);
  const pct = Math.round((solvedProblems / totalProblems) * 100) || 0;

  // Find today's suggested day (first incomplete day)
  let suggestedDay = null;
  outer: for (const month of DSA_PLAN) {
    for (const week of month.weeks) {
      for (const day of week.days) {
        const solved = day.problems.filter(p => progress[`${day.day}-${p.id}`]).length;
        if (solved < day.problems.length) {
          suggestedDay = { day, week, month };
          break outer;
        }
      }
    }
  }

  // Heatmap: all days
  const allDays = [];
  DSA_PLAN.forEach(m => m.weeks.forEach(w => w.days.forEach(d => allDays.push(d))));

  const getDayCompletion = (day) => {
    const solved = day.problems.filter(p => progress[`${day.day}-${p.id}`]).length;
    const total = day.problems.length;
    const pct = total > 0 ? solved / total : 0;
    if (pct === 0) return 'done-0';
    if (pct < 0.25) return 'done-0';
    if (pct < 0.5) return 'done-25';
    if (pct < 0.75) return 'done-50';
    if (pct < 1) return 'done-75';
    return 'done-100';
  };

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (pct / 100) * circumference;

  const diffStats = { Easy: 0, Medium: 0, Hard: 0, EasyTotal: 0, MediumTotal: 0, HardTotal: 0 };
  allDays.forEach(day => {
    day.problems.forEach(p => {
      diffStats[p.difficulty + 'Total'] = (diffStats[p.difficulty + 'Total'] || 0) + 1;
      if (progress[`${day.day}-${p.id}`]) {
        diffStats[p.difficulty] = (diffStats[p.difficulty] || 0) + 1;
      }
    });
  });

  return (
    <div>
      <Nav navigate={navigate} />
      <div className="page">
        {/* HERO */}
        <div className="hero fade-up" style={{ paddingTop: 40, paddingBottom: 32 }}>
          <div className="hero-badge">5-Month DSA Plan • C++</div>
          <h1>Your DSA <span>Journey</span><br />Starts Here</h1>
          <p>Track every problem, every day. From arrays to DP — own the grind.</p>
          {suggestedDay && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('day', suggestedDay.day, suggestedDay.week)}
            >
              ▶ Continue — Day {suggestedDay.day.day}: {suggestedDay.day.dayTitle}
            </button>
          )}
        </div>

        {/* STATS ROW */}
        <div className="stats-row fade-up fade-up-1">
          <div className="stat-card">
            <div className="stat-num">{solvedProblems}</div>
            <div className="stat-label">Solved</div>
            <div className="progress-bar-wrap" style={{ marginTop: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{pct}% of {totalProblems}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--easy)' }}>{diffStats.Easy}</div>
            <div className="stat-label">Easy Solved</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>of {diffStats.EasyTotal}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--medium)' }}>{diffStats.Medium}</div>
            <div className="stat-label">Medium Solved</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>of {diffStats.MediumTotal}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: 'var(--hard)' }}>{diffStats.Hard}</div>
            <div className="stat-label">Hard Solved</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>of {diffStats.HardTotal}</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalDays}</div>
            <div className="stat-label">Total Days</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>In Plan</div>
          </div>
        </div>

        {/* RING + HEATMAP */}
        <div className="grid-2 fade-up fade-up-2" style={{ marginBottom: 32 }}>
          <div className="card">
            <div className="card-title">📊 Overall Progress</div>
            <div className="ring-wrap">
              <svg viewBox="0 0 120 120" width="120" height="120">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c6af7" />
                    <stop offset="100%" stopColor="#5cecc8" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="60" cy="60" r="50" />
                <circle
                  className="ring-fg"
                  cx="60" cy="60" r="50"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="ring-text">
                {pct}%<small>complete</small>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
              {solvedProblems} / {totalProblems} problems solved
            </div>
          </div>
          <div className="card">
            <div className="card-title">🗓️ Day Completion Map</div>
            <div className="heatmap">
              {allDays.map(day => {
                const cls = getDayCompletion(day);
                const solved = day.problems.filter(p => progress[`${day.day}-${p.id}`]).length;
                return (
                  <div key={day.day} className="tooltip-wrap">
                    <div
                      className={`heatmap-cell ${cls}`}
                      onClick={() => {
                        const weekData = null;
                        navigate('day', day, weekData);
                      }}
                    />
                    <span className="tooltip-text">Day {day.day}: {solved}/{day.problems.length}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, fontSize: 11, color: 'var(--muted)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Less</span>
              {['done-0','done-25','done-50','done-75','done-100'].map(c => (
                <div key={c} className={`heatmap-cell ${c}`} style={{ width: 12, height: 12, aspectRatio: 'auto', borderRadius: 3 }} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="fade-up fade-up-3">
          <div className="section-title">Quick Access — All Months</div>
          {DSA_PLAN.map((month) => {
            const monthSolved = month.weeks.flatMap(w => w.days.flatMap(d => d.problems.filter(p => progress[`${d.day}-${p.id}`]))).length;
            const monthTotal = month.weeks.flatMap(w => w.days.flatMap(d => d.problems)).length;
            const mPct = Math.round((monthSolved / monthTotal) * 100) || 0;
            return (
              <div key={month.month}>
                <div className="month-header" onClick={() => navigate('plan', null, month.month)}>
                  <div className="month-num">M{month.month}</div>
                  <div className="month-info">
                    <h3>{month.monthTitle}</h3>
                    <p>{month.monthSubtitle}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>{mPct}%</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{monthSolved}/{monthTotal}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
