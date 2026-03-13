import React, { useState, useRef, useEffect } from 'react';
import { Nav } from './Dashboard';
import { DSA_PLAN } from '../data/problems';

const ALL_PROBLEMS = [];
DSA_PLAN.forEach(month => {
  month.weeks.forEach(week => {
    week.days.forEach(day => {
      day.problems.forEach(prob => {
        if (!ALL_PROBLEMS.find(p => p.id === prob.id)) {
          ALL_PROBLEMS.push({ ...prob, dayTitle: day.dayTitle, weekTitle: week.weekTitle, monthTitle: month.monthTitle });
        }
      });
    });
  });
});
ALL_PROBLEMS.sort((a, b) => a.id - b.id);

const STAGES = [
  { id: 'hint1', label: 'Hint #1', icon: '💡', color: '#ffd166', btnText: 'Give me a hint', btnColor: '#ffd166' },
  { id: 'hint2', label: 'Hint #2', icon: '🔍', color: '#ff9f43', btnText: 'Still stuck — another hint', btnColor: '#ff9f43' },
  { id: 'pattern', label: 'Pattern + Visual', icon: '🧠', color: '#7c6af7', btnText: 'Teach me the pattern', btnColor: '#7c6af7' },
  { id: 'complexity', label: 'Complexity', icon: '📊', color: '#5cecc8', btnText: 'Explain complexity', btnColor: '#5cecc8' },
  { id: 'solution', label: 'Full Solution', icon: '✅', color: '#06d6a0', btnText: 'Show full solution', btnColor: '#06d6a0' },
];

function buildPrompt(stage, problem, history) {
  const ctx = history.length > 0
    ? `\nHints already given:\n${history.map(m => `[${m.stage}]: ${m.content.substring(0, 200)}`).join('\n')}\n`
    : '';
  const base = `You are a DSA tutor helping a beginner C++ programmer.\nProblem: #${problem.id} - ${problem.title} (${problem.difficulty})\n${ctx}`;

  if (stage === 'hint1') return `${base}
Give ONE subtle hint. Rules:
- Do NOT reveal algorithm or data structure name
- Do NOT show any code
- Ask a guiding question or give a tiny nudge
- Max 3 sentences
- End with "Think about it for 5 more minutes! 🤔"`;

  if (stage === 'hint2') return `${base}
Give a stronger second hint. Rules:
- You CAN name the general technique (e.g. "two pointers", "hash map")
- Do NOT show code yet
- Give 2-3 key observations that unlock the solution
- Mention edge cases to watch for
- End with "You're close! Try coding it now 💪"`;

  if (stage === 'pattern') return `${base}
Teach the PATTERN used. Use EXACTLY this structure:

## 🧩 Pattern Name
[Name of pattern/technique]

## 🎯 When to Use This Pattern
[2-3 bullet points]

## 🔢 Visual Step-by-Step Example
[ASCII art diagram showing the algorithm on a small example. Use arrows ->, brackets [], indices, multiple lines. Show each step.]

## 📋 Algorithm Steps
[Numbered plain-English steps]

## 💡 Key Insight
[The "aha moment" in one paragraph]

## 🔗 Similar Problems
[3 problems using the same pattern]`;

  if (stage === 'complexity') return `${base}
Explain Time and Space complexity. Use EXACTLY this structure:

## ⏱️ Time Complexity

**Answer: O(?)**

**Why? (step by step)**
[Count operations with a concrete example where n=5. Show the math.]

## 🗄️ Space Complexity

**Answer: O(?)**

**Why?**
[What extra memory is used and why]

## 📊 Naive vs Optimised
[Text table comparing brute force vs optimal]

## 🧮 How to Analyse Any Problem
[3 general tips for computing TC/SC yourself]`;

  if (stage === 'solution') return `${base}
Give complete solution. Use EXACTLY this structure:

## 🎯 Approach
[1-2 sentences on strategy]

## 📋 Step-by-Step on Example
[Walk through a small example showing variable values at each step]

## 💻 C++ Solution
\`\`\`cpp
// Detailed comments on every important line
[Complete clean C++ code]
\`\`\`

## 🔍 Dry Run
[Trace code with a small input, showing variable values each iteration]

## ⚠️ Edge Cases
[Important edge cases and how the code handles them]

## ⏱️ Complexity
- Time: O(?) — [one-line reason]
- Space: O(?) — [one-line reason]`;
}

function RenderContent({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let codeLines = [], inCode = false, codeKey = 0;

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={`c${codeKey++}`} style={{ background: '#0d0d14', border: '1px solid #2a2a3a', borderRadius: 8, padding: 16, overflowX: 'auto', fontSize: 13, lineHeight: 1.6, margin: '12px 0', fontFamily: "'Space Mono',monospace", color: '#e8e8f0' }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = []; inCode = false;
      } else { inCode = true; }
      return;
    }
    if (inCode) { codeLines.push(line); return; }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8, color: '#e8e8f0', borderBottom: '1px solid #2a2a3a', paddingBottom: 6 }}>{line.replace('## ', '')}</h3>);
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={i} style={{ fontWeight: 700, color: '#7c6af7', margin: '8px 0 4px', fontSize: 14 }}>{line.replace(/\*\*/g, '')}</p>);
    } else if (line.match(/^[-•] /)) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, margin: '4px 0', paddingLeft: 8, fontSize: 14, color: '#c8c8e0', lineHeight: 1.6 }}>
          <span style={{ color: '#7c6af7', flexShrink: 0 }}>▸</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-•] /, '').replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e8e8f0">$1</strong>') }} />
        </div>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 10, margin: '5px 0', paddingLeft: 8, fontSize: 14, color: '#c8c8e0', lineHeight: 1.6 }}>
          <span style={{ color: '#5cecc8', fontFamily: 'monospace', fontWeight: 700, minWidth: 20, flexShrink: 0 }}>{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '').replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e8e8f0">$1</strong>') }} />
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 14, color: '#c8c8e0', lineHeight: 1.7, margin: '3px 0' }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#e8e8f0">$1</strong>').replace(/`([^`]+)`/g, '<code style="background:#1a1a25;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#5cecc8">$1</code>') }}
        />
      );
    }
  });
  return <div>{elements}</div>;
}

export default function HintEngine({ navigate }) {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customQ, setCustomQ] = useState('');
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    const fn = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filtered = ALL_PROBLEMS.filter(p =>
    search.length > 0 && (p.title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search))
  ).slice(0, 12);

  const selectProblem = (prob) => {
    setSelectedProblem(prob); setSearch(prob.title);
    setShowDropdown(false); setMessages([]);
    setCurrentStageIdx(0); setError('');
  };

  const callAPI = async (stageId, customQuestion = null) => {
    if (!selectedProblem) return;
    setLoading(true); setError('');

    const prompt = customQuestion
      ? `You are a DSA tutor. Problem: #${selectedProblem.id} - ${selectedProblem.title} (${selectedProblem.difficulty}).\nStudent asks: "${customQuestion}"\nAnswer clearly. Use markdown. Include \`\`\`cpp code blocks where helpful.`
      : buildPrompt(stageId, selectedProblem, messages);

    try {
      // Calls /api/hint — your Vercel serverless function (NOT Anthropic directly)
      const response = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, max_tokens: 1500 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      const stageInfo = customQuestion
        ? { label: 'Your Question', icon: '💬', color: '#ff6b6b' }
        : STAGES.find(s => s.id === stageId) || STAGES[currentStageIdx];

      setMessages(prev => [...prev, {
        stage: stageInfo.label, stageIcon: stageInfo.icon,
        stageColor: stageInfo.color, content: data.content,
        isCustom: !!customQuestion, question: customQuestion,
      }]);

      if (!customQuestion && currentStageIdx < STAGES.length - 1) {
        setCurrentStageIdx(prev => prev + 1);
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('⚠️ AI hints only work on your Vercel URL — not on localhost. Push to GitHub → deploy → add GEMINI_API_KEY in Vercel settings!');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const handleCustomQ = () => { if (!customQ.trim()) return; callAPI(null, customQ.trim()); setCustomQ(''); };
  const reset = () => { setMessages([]); setCurrentStageIdx(0); setError(''); };
  const nextStage = STAGES[currentStageIdx];
  const allDone = currentStageIdx >= STAGES.length;

  return (
    <div>
      <Nav navigate={navigate} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)', borderRadius: 100, padding: '4px 14px', marginBottom: 12, fontSize: 12, fontWeight: 600, color: '#7c6af7', fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
            🤖 AI Hint Engine
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>Stuck? I'll teach you.</h2>
          <p style={{ color: '#7070a0', fontSize: 14 }}>Select a problem → get progressive hints → learn the pattern → understand complexity</p>
        </div>

        {/* STAGE ROADMAP */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 12, overflowX: 'auto' }}>
          {STAGES.map((s, i) => {
            const done = i < currentStageIdx && messages.some(m => m.stage === s.label);
            const active = i === currentStageIdx;
            return (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80, flex: 1, opacity: i > currentStageIdx ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? s.color : active ? `${s.color}22` : '#1a1a25', border: `2px solid ${done || active ? s.color : '#2a2a3a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: done ? 14 : 18, boxShadow: active ? `0 0 14px ${s.color}66` : 'none', transition: 'all 0.3s' }}>
                  {done ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: 10, color: active ? s.color : '#7070a0', fontWeight: active ? 700 : 400, textAlign: 'center', fontFamily: 'monospace' }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* PROBLEM SELECTOR */}
        <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7070a0', marginBottom: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>Step 1 — Select Problem</div>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or number… e.g. '15' or 'Two Sum'"
              style={{ width: '100%', background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) selectProblem(filtered[0]); }}
            />
            {showDropdown && filtered.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 8, marginTop: 4, maxHeight: 280, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {filtered.map(prob => (
                  <div key={prob.id} onClick={() => selectProblem(prob)}
                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1a1a25' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a25'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7070a0', minWidth: 36 }}>#{prob.id}</span>
                    <span style={{ flex: 1, fontSize: 14, color: '#e8e8f0' }}>{prob.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: prob.difficulty === 'Easy' ? 'rgba(6,214,160,0.15)' : prob.difficulty === 'Medium' ? 'rgba(255,209,102,0.15)' : 'rgba(239,68,68,0.15)', color: prob.difficulty === 'Easy' ? '#06d6a0' : prob.difficulty === 'Medium' ? '#ffd166' : '#ef4444' }}>{prob.difficulty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedProblem && (
            <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.25)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#7070a0' }}>#{selectedProblem.id}</span>
              <span style={{ fontWeight: 600, flex: 1, fontSize: 15 }}>{selectedProblem.title}</span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, background: selectedProblem.difficulty === 'Easy' ? 'rgba(6,214,160,0.15)' : selectedProblem.difficulty === 'Medium' ? 'rgba(255,209,102,0.15)' : 'rgba(239,68,68,0.15)', color: selectedProblem.difficulty === 'Easy' ? '#06d6a0' : selectedProblem.difficulty === 'Medium' ? '#ffd166' : '#ef4444' }}>{selectedProblem.difficulty}</span>
              <a href={selectedProblem.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#7c6af7', textDecoration: 'none' }}>Open ↗</a>
              {messages.length > 0 && <button onClick={reset} style={{ background: 'none', border: '1px solid #2a2a3a', borderRadius: 6, color: '#7070a0', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>Reset</button>}
            </div>
          )}
        </div>

        {/* MESSAGES */}
        {messages.map((msg, i) => (
          <div key={i} style={{ background: '#12121a', border: `1px solid ${msg.stageColor}33`, borderRadius: 12, marginBottom: 12, overflow: 'hidden', animation: 'fadeUp 0.35s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: `1px solid ${msg.stageColor}22`, background: `${msg.stageColor}0d` }}>
              <span style={{ fontSize: 18 }}>{msg.stageIcon}</span>
              <span style={{ fontWeight: 700, color: msg.stageColor, fontSize: 14 }}>{msg.stage}</span>
              {msg.question && <span style={{ color: '#7070a0', fontSize: 13, fontStyle: 'italic' }}>— "{msg.question}"</span>}
            </div>
            <div style={{ padding: '16px 20px' }}><RenderContent text={msg.content} /></div>
          </div>
        ))}

        {loading && (
          <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 24, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ width: 20, height: 20, border: '2px solid #2a2a3a', borderTopColor: '#7c6af7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: '#7070a0', fontSize: 14 }}>Thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ef4444', fontSize: 13, lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        {selectedProblem && !loading && (
          <div style={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7070a0', marginBottom: 12, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 2 — {allDone ? 'All stages complete! 🎉' : 'Get Help'}
            </div>
            {!allDone && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <button onClick={() => callAPI(nextStage.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 8, border: 'none', background: nextStage.btnColor, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: `0 4px 20px ${nextStage.btnColor}44`, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {nextStage.icon} {nextStage.btnText}
                </button>
                {STAGES.slice(currentStageIdx + 1).map((s, idx) => (
                  <button key={s.id} onClick={() => { setCurrentStageIdx(currentStageIdx + 1 + idx); callAPI(s.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: `1px solid ${s.color}44`, background: `${s.color}11`, color: s.color, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${s.color}22`; e.currentTarget.style.borderColor = s.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${s.color}11`; e.currentTarget.style.borderColor = `${s.color}44`; }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            )}
            {allDone && (
              <div style={{ padding: '12px 16px', background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)', borderRadius: 8, color: '#06d6a0', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                🎉 All learning stages complete for this problem!
              </div>
            )}
            <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: '#7070a0', marginBottom: 8, fontFamily: 'monospace' }}>ASK ANYTHING about this problem ↓</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={customQ} onChange={e => setCustomQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCustomQ()}
                  placeholder={`e.g. "Why use a hash map?" or "Explain the two pointer approach"`}
                  style={{ flex: 1, background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
                />
                <button onClick={handleCustomQ} disabled={!customQ.trim() || loading}
                  style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: customQ.trim() ? '#7c6af7' : '#2a2a3a', color: customQ.trim() ? '#fff' : '#7070a0', fontWeight: 600, cursor: customQ.trim() ? 'pointer' : 'not-allowed', fontSize: 14, fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  Ask →
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedProblem && (
          <div style={{ background: '#12121a', border: '1px dashed #2a2a3a', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI Hint Engine</div>
            <div style={{ color: '#7070a0', fontSize: 14, maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
              Search any problem above. I'll guide you from subtle hints → pattern → full solution → complexity.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {[{ id: 1, title: 'Two Sum' }, { id: 15, title: '3Sum' }, { id: 200, title: 'Number of Islands' }, { id: 322, title: 'Coin Change' }].map(s => (
                <button key={s.id} onClick={() => { const f = ALL_PROBLEMS.find(p => p.id === s.id); if (f) selectProblem(f); }}
                  style={{ background: '#1a1a25', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 14px', color: '#7070a0', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.color = '#7c6af7'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#7070a0'; }}
                >
                  #{s.id} {s.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  );
}
