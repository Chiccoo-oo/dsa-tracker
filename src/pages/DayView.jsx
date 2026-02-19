import React, { useState } from 'react';
import { Nav } from './Dashboard';

export default function DayView({ day, progress, notes, toggleProblem, updateNote, navigate }) {
  const [note, setNote] = useState(notes[day.day] || '');
  const solved = day.problems.filter(p => progress[`${day.day}-${p.id}`]).length;
  const total = day.problems.length;
  const pct = Math.round((solved / total) * 100);

  const themeColor = day.theme === 'yellow' ? 'var(--yellow)' : day.theme === 'blue' ? 'var(--accent2)' : 'var(--green)';

  const handleNote = (e) => {
    setNote(e.target.value);
    updateNote(day.day, e.target.value);
  };

  // Difficulty counts
  const easy = day.problems.filter(p => p.difficulty === 'Easy').length;
  const medium = day.problems.filter(p => p.difficulty === 'Medium').length;
  const hard = day.problems.filter(p => p.difficulty === 'Hard').length;

  return (
    <div>
      <Nav navigate={navigate} />
      <div className="page">
        {/* DAY HEADER */}
        <div className="day-header fade-up">
          <button className="back-btn" onClick={() => navigate('plan')}>
            ← Back to Plan
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 14,
              background: `rgba(${day.theme === 'yellow' ? '255,209,102' : day.theme === 'blue' ? '92,236,200' : '6,214,160'},0.15)`,
              border: `1px solid rgba(${day.theme === 'yellow' ? '255,209,102' : day.theme === 'blue' ? '92,236,200' : '6,214,160'},0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
              color: themeColor, flexShrink: 0,
            }}>
              D{day.day}
            </div>
            <div style={{ flex: 1 }}>
              <h2>{day.dayTitle}</h2>
              <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                {easy > 0 && <span style={{ color: 'var(--easy)' }}>● {easy} Easy</span>}
                {medium > 0 && <span style={{ color: 'var(--medium)' }}>● {medium} Medium</span>}
                {hard > 0 && <span style={{ color: 'var(--hard)' }}>● {hard} Hard</span>}
              </div>
              <div className="concept-chips">
                {day.concepts.map((c, i) => (
                  <span key={i} className="concept-chip">{c}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: themeColor }}>{pct}%</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{solved}/{total} done</div>
            </div>
          </div>

          <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: themeColor }} />
          </div>

          {day.theory && (
            <div className="theory-box">
              <span>📚 Theory:</span> {day.theory}
            </div>
          )}
        </div>

        <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
          {/* PROBLEMS */}
          <div className="fade-up fade-up-1">
            <div className="section-title" style={{ marginBottom: 12 }}>Problems — {solved}/{total} Solved</div>
            <div className="problem-list">
              {day.problems.map((problem) => {
                const key = `${day.day}-${problem.id}`;
                const isSolved = !!progress[key];
                return (
                  <div key={key} className={`problem-item ${isSolved ? 'solved' : ''}`}>
                    <div
                      className={`checkbox ${isSolved ? 'checked' : ''}`}
                      onClick={() => toggleProblem(day.day, problem.id)}
                    />
                    <span className="problem-id">#{problem.id}</span>
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="problem-title"
                    >
                      {problem.title}
                    </a>
                    <span className={`diff-badge diff-${problem.difficulty}`}>{problem.difficulty}</span>
                  </div>
                );
              })}
            </div>

            {solved === total && (
              <div style={{
                marginTop: 16,
                padding: '16px',
                background: 'rgba(6,214,160,0.08)',
                border: '1px solid rgba(6,214,160,0.25)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--easy)',
                fontSize: 14,
                fontWeight: 600,
              }}>
                🎉 Day Complete! Amazing work!
              </div>
            )}
          </div>

          {/* NOTES + QUICK ACTIONS */}
          <div className="fade-up fade-up-2">
            <div className="card">
              <div className="card-title">📝 My Notes</div>
              <textarea
                className="notes-area"
                placeholder={`Notes for Day ${day.day}...\n\nE.g. key insights, patterns noticed, mistakes made...`}
                value={note}
                onChange={handleNote}
                rows={10}
              />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'right' }}>Auto-saved</div>
            </div>

            <div className="card">
              <div className="card-title">⚡ Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => {
                    day.problems.forEach(p => {
                      if (!progress[`${day.day}-${p.id}`]) toggleProblem(day.day, p.id);
                    });
                  }}
                >
                  ✅ Mark All Complete
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => {
                    day.problems.forEach(p => {
                      if (progress[`${day.day}-${p.id}`]) toggleProblem(day.day, p.id);
                    });
                  }}
                >
                  🔄 Reset Day
                </button>
                <a
                  href={`https://leetcode.com/problemset/all/?difficulty=${day.problems[0]?.difficulty}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start' }}
                >
                  🔗 Open LeetCode
                </a>
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="card">
              <div className="card-title">📈 Difficulty Breakdown</div>
              {[
                { label: 'Easy', count: easy, color: 'var(--easy)', key: 'Easy' },
                { label: 'Medium', count: medium, color: 'var(--medium)', key: 'Medium' },
                { label: 'Hard', count: hard, color: 'var(--hard)', key: 'Hard' },
              ].filter(d => d.count > 0).map(d => {
                const dSolved = day.problems.filter(p => p.difficulty === d.key && progress[`${day.day}-${p.id}`]).length;
                return (
                  <div key={d.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: d.color, fontWeight: 600 }}>{d.label}</span>
                      <span style={{ color: 'var(--muted)' }}>{dSolved}/{d.count}</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 6 }}>
                      <div className="progress-bar-fill" style={{
                        width: d.count ? `${(dSolved / d.count) * 100}%` : '0%',
                        background: d.color,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
