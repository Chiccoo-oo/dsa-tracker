import React, { useState, useRef, useEffect } from 'react';
import { Nav } from './Dashboard';
import { DSA_PLAN } from '../data/problems';

// ─── Gather all problems for the search dropdown ───────────────────────────
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

// ─── Stage config ──────────────────────────────────────────────────────────
const STAGES = [
  {
    id: 'hint1',
    label: 'Hint #1',
    icon: '💡',
    color: '#ffd166',
    desc: 'Subtle nudge — direction only',
    btnText: 'Give me a hint',
    btnColor: '#ffd166',
  },
  {
    id: 'hint2',
    label: 'Hint #2',
    icon: '🔍',
    color: '#ff9f43',
    desc: 'Stronger hint — key insight',
    btnText: 'Still stuck — another hint',
    btnColor: '#ff9f43',
  },
  {
    id: 'pattern',
    label: 'Pattern + Visual',
    icon: '🧠',
    color: '#7c6af7',
    desc: 'Full pattern explanation with diagrams',
    btnText: 'Teach me the pattern',
    btnColor: '#7c6af7',
  },
  {
    id: 'complexity',
    label: 'Complexity',
    icon: '📊',
    color: '#5cecc8',
    desc: 'Time & Space complexity breakdown',
    btnText: 'Explain complexity',
    btnColor: '#5cecc8',
  },
  {
    id: 'solution',
    label: 'Full Solution',
    icon: '✅',
    color: '#06d6a0',
    desc: 'Complete walkthrough with C++ code',
    btnText: 'Show full solution',
    btnColor: '#06d6a0',
  },
];

// ─── Build Claude prompt for each stage ───────────────────────────────────
function buildPrompt(stage, problem, conversationSoFar) {
  const context = conversationSoFar.length > 0
    ? `\nPrevious hints given:\n${conversationSoFar.map(m => `[${m.stage}]: ${m.content.substring(0, 200)}...`).join('\n')}\n`
    : '';

  const base = `You are a DSA tutor helping a beginner C++ programmer solve LeetCode problems.
Problem: #${problem.id} - ${problem.title} (${problem.difficulty})
${context}`;

  if (stage === 'hint1') return `${base}
Give ONE subtle hint. 
Rules:
- DO NOT reveal the algorithm or data structure name
- DO NOT show any code
- Ask a guiding question or give a tiny observation to nudge thinking
- Max 3 sentences
- End with "Think about it for 5 more minutes! 🤔"
Format as plain text only.`;

  if (stage === 'hint2') return `${base}
Give a stronger second hint.
Rules:
- You CAN mention the general approach/technique name (e.g. "two pointers" or "hash map")
- DO NOT show code yet
- Give 2-3 key observations that unlock the solution
- Mention what edge cases to watch for
- End with "You're close! Try coding it now 💪"
Format as plain text only.`;

  if (stage === 'pattern') return `${base}
Teach the PATTERN used to solve this problem in detail. Structure your response EXACTLY like this:

## 🧩 Pattern Name
[Name of the pattern/technique]

## 🎯 When to Use This Pattern
[2-3 bullet points of when this pattern applies]

## 🔢 Visual Example
[Create an ASCII art / text-based diagram showing the pattern step by step with a simple example array or structure. Use arrows (->), brackets [], indices, and multiple lines to show the algorithm visually. Make it clear and educational.]

## 📋 Algorithm Steps
[Numbered steps of the algorithm in plain English]

## 💡 Key Insight
[The "aha moment" — what makes this pattern click]

## 🔗 Related Problems
[3 similar problems that use same pattern]

Be detailed, educational, and use the visual heavily. Target a beginner who has never seen this pattern.`;

  if (stage === 'complexity') return `${base}
Explain the Time and Space complexity for this problem. Structure EXACTLY like this:

## ⏱️ Time Complexity: O(?)

**Answer: O([complexity])**

**Why?**
[Step-by-step explanation of WHY it's this complexity. Count operations. Show the math. Use a concrete example with n=5 or n=10 to count actual operations.]

## 🗄️ Space Complexity: O(?)

**Answer: O([complexity])**

**Why?**
[Explain what extra memory is used and why]

## 📊 Complexity Comparison Table
[Show a text table comparing naive approach vs optimized approach complexities]

## 🧮 How to Analyze Any Problem
[3-4 general tips for figuring out time/space complexity yourself]

Be very clear and use concrete numbers to prove the complexity.`;

  if (stage === 'solution') return `${base}
Give a complete solution walkthrough. Structure EXACTLY like this:

## 🎯 Approach
[1-2 sentences on the overall strategy]

## 📋 Step-by-Step Walkthrough
[Walk through the algorithm on a concrete example, step by step, showing variable values]

## 💻 C++ Solution
\`\`\`cpp
// Add detailed comments explaining each line
[Complete, clean C++ solution with comments]
\`\`\`

## 🔍 Dry Run
[Trace through the code with a small example, showing what each variable equals at each step]

## ⚠️ Edge Cases
[List the important edge cases and how the code handles them]

## ⏱️ Complexity
- Time: O(?) — [one line why]
- Space: O(?) — [one line why]`;
}

// ─── Markdown-ish renderer ─────────────────────────────────────────────────
function RenderContent({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let codeBlock = [];
  let inCode = false;
  let codeKey = 0;

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={`code-${codeKey++}`} style={{
            background: '#0d0d14',
            border: '1px solid #2a2a3a',
            borderRadius: 8,
            padding: '16px',
            overflowX: 'auto',
            fontSize: 13,
            lineHeight: 1.6,
            margin: '12px 0',
            fontFamily: "'Space Mono', monospace",
            color: '#e8e8f0',
          }}>
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBlock.push(line);
      return;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: 16, fontWeight: 700, marginTop: 20, marginBottom: 8, color: '#e8e8f0', borderBottom: '1px solid #2a2a3a', paddingBottom: 6 }}>
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} style={{ fontWeight: 700, color: '#7c6af7', margin: '8px 0 4px', fontSize: 14 }}>
          {line.replace(/\*\*/g, '')}
        </p>
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, margin: '4px 0', paddingLeft: 8, fontSize: 14, color: '#c8c8e0', lineHeight: 1.6 }}>
          <span style={{ color: '#7c6af7', flexShrink: 0 }}>▸</span>
          <span>{line.replace(/^[-•] /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}</span>
        </div>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)[1];
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 10, margin: '6px 0', paddingLeft: 8, fontSize: 14, color: '#c8c8e0', lineHeight: 1.6 }}>
          <span style={{ color: '#5cecc8', fontFamily: 'monospace', fontWeight: 700, minWidth: 20, flexShrink: 0 }}>{num}.</span>
          <span>{line.replace(/^\d+\. /, '').replace(/\*\*([^*]+)\*\*/g, '$1')}</span>
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      // Inline bold
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      elements.push(
        <p key={i} style={{ fontSize: 14, color: '#c8c8e0', lineHeight: 1.7, margin: '3px 0' }}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} style={{ color: '#e8e8f0' }}>{part}</strong> : part)}
        </p>
      );
    }
  });

  return <div>{elements}</div>;
}

// ─── Main Component ────────────────────────────────────────────────────────
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = ALL_PROBLEMS.filter(p =>
    search.length > 0 && (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      String(p.id).includes(search)
    )
  ).slice(0, 12);

  const selectProblem = (prob) => {
    setSelectedProblem(prob);
    setSearch(prob.title);
    setShowDropdown(false);
    setMessages([]);
    setCurrentStageIdx(0);
    setError('');
  };

  const callClaude = async (stage, customQuestion = null) => {
    if (!selectedProblem) return;
    setLoading(true);
    setError('');

    const prompt = customQuestion
      ? `You are a DSA tutor. Problem: #${selectedProblem.id} - ${selectedProblem.title} (${selectedProblem.difficulty}).
Student asks: "${customQuestion}"
Answer clearly and helpfully. Use markdown formatting. If relevant, include code examples in \`\`\`cpp blocks.`
      : buildPrompt(stage, selectedProblem, messages);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const content = data.content?.[0]?.text || 'No response received.';
      const stageInfo = customQuestion
        ? { id: 'custom', label: 'Your Question', icon: '💬', color: '#ff6b6b' }
        : STAGES[currentStageIdx];

      setMessages(prev => [...prev, {
        stage: stageInfo.label,
        stageIcon: stageInfo.icon,
        stageColor: stageInfo.color,
        content,
        isCustom: !!customQuestion,
        question: customQuestion,
      }]);

      if (!customQuestion && currentStageIdx < STAGES.length - 1) {
        setCurrentStageIdx(prev => prev + 1);
      }
    } catch (err) {
      setError(`API Error: ${err.message}. Make sure you're running through the Claude.ai interface.`);
    }
    setLoading(false);
  };

  const handleCustomQ = () => {
    if (!customQ.trim()) return;
    callClaude(null, customQ.trim());
    setCustomQ('');
  };

  const reset = () => {
    setMessages([]);
    setCurrentStageIdx(0);
    setError('');
  };

  const nextStage = STAGES[currentStageIdx];
  const allStagesDone = currentStageIdx >= STAGES.length;

  return (
    <div>
      <Nav navigate={navigate} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,106,247,0.12)', border: '1px solid rgba(124,106,247,0.25)',
            borderRadius: 100, padding: '4px 14px', marginBottom: 12,
            fontSize: 12, fontWeight: 600, color: '#7c6af7', fontFamily: 'monospace',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
            🤖 AI Hint Engine
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
            Stuck? I'll teach you.
          </h2>
          <p style={{ color: '#7070a0', fontSize: 14 }}>
            Select a problem → get progressive hints → learn the pattern → understand complexity
          </p>
        </div>

        {/* ── STAGE ROADMAP ── */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 24,
          background: '#12121a', border: '1px solid #2a2a3a',
          borderRadius: 12, padding: 12, overflowX: 'auto',
        }}>
          {STAGES.map((s, i) => {
            const done = i < currentStageIdx && messages.some(m => m.stage === s.label);
            const active = i === currentStageIdx;
            const locked = i > currentStageIdx;
            return (
              <div key={s.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, minWidth: 80, flex: 1, opacity: locked ? 0.4 : 1,
                transition: 'opacity 0.3s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: done ? s.color : active ? `${s.color}22` : '#1a1a25',
                  border: `2px solid ${done ? s.color : active ? s.color : '#2a2a3a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: done ? 14 : 16,
                  boxShadow: active ? `0 0 12px ${s.color}55` : 'none',
                  transition: 'all 0.3s',
                }}>
                  {done ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: 10, color: active ? s.color : '#7070a0', fontWeight: active ? 700 : 400, textAlign: 'center', lineHeight: 1.2, fontFamily: 'monospace' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── PROBLEM SELECTOR ── */}
        <div style={{
          background: '#12121a', border: '1px solid #2a2a3a',
          borderRadius: 12, padding: 16, marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7070a0', marginBottom: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
            Step 1 — Select Problem
          </div>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by problem name or number... (e.g. '15' or 'Two Sum')"
              style={{
                width: '100%', background: '#1a1a25', border: '1px solid #2a2a3a',
                borderRadius: 8, padding: '10px 14px', color: '#e8e8f0',
                fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) selectProblem(filtered[0]); }}
            />
            {showDropdown && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                background: '#12121a', border: '1px solid #2a2a3a',
                borderRadius: 8, marginTop: 4, maxHeight: 320, overflowY: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {filtered.map(prob => (
                  <div
                    key={prob.id}
                    onClick={() => selectProblem(prob)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      borderBottom: '1px solid #1a1a25',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1a1a25'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#7070a0', minWidth: 36 }}>#{prob.id}</span>
                    <span style={{ flex: 1, fontSize: 14, color: '#e8e8f0' }}>{prob.title}</span>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                      background: prob.difficulty === 'Easy' ? 'rgba(6,214,160,0.15)' : prob.difficulty === 'Medium' ? 'rgba(255,209,102,0.15)' : 'rgba(239,68,68,0.15)',
                      color: prob.difficulty === 'Easy' ? '#06d6a0' : prob.difficulty === 'Medium' ? '#ffd166' : '#ef4444',
                    }}>{prob.difficulty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected problem card */}
          {selectedProblem && (
            <div style={{
              marginTop: 12, padding: '12px 16px',
              background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.25)',
              borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#7070a0' }}>#{selectedProblem.id}</span>
              <span style={{ fontWeight: 600, flex: 1, fontSize: 15 }}>{selectedProblem.title}</span>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700,
                background: selectedProblem.difficulty === 'Easy' ? 'rgba(6,214,160,0.15)' : selectedProblem.difficulty === 'Medium' ? 'rgba(255,209,102,0.15)' : 'rgba(239,68,68,0.15)',
                color: selectedProblem.difficulty === 'Easy' ? '#06d6a0' : selectedProblem.difficulty === 'Medium' ? '#ffd166' : '#ef4444',
              }}>{selectedProblem.difficulty}</span>
              <a href={selectedProblem.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: '#7c6af7', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Open ↗
              </a>
              {messages.length > 0 && (
                <button onClick={reset} style={{
                  background: 'none', border: '1px solid #2a2a3a', borderRadius: 6,
                  color: '#7070a0', fontSize: 12, padding: '4px 10px', cursor: 'pointer',
                }}>Reset</button>
              )}
            </div>
          )}
        </div>

        {/* ── CHAT MESSAGES ── */}
        {messages.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                background: '#12121a', border: `1px solid ${msg.stageColor}33`,
                borderRadius: 12, marginBottom: 12, overflow: 'hidden',
                animation: 'fadeUp 0.4s ease both',
              }}>
                {/* Message header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderBottom: `1px solid ${msg.stageColor}22`,
                  background: `${msg.stageColor}0d`,
                }}>
                  <span style={{ fontSize: 18 }}>{msg.stageIcon}</span>
                  <span style={{ fontWeight: 700, color: msg.stageColor, fontSize: 14 }}>{msg.stage}</span>
                  {msg.question && (
                    <span style={{ color: '#7070a0', fontSize: 13, fontStyle: 'italic' }}>
                      — "{msg.question}"
                    </span>
                  )}
                </div>
                {/* Message content */}
                <div style={{ padding: '16px 20px' }}>
                  <RenderContent text={msg.content} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{
            background: '#12121a', border: '1px solid #2a2a3a',
            borderRadius: 12, padding: '24px', marginBottom: 16, textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{
                width: 20, height: 20, border: '2px solid #2a2a3a',
                borderTopColor: '#7c6af7', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ color: '#7070a0', fontSize: 14 }}>
                {nextStage ? `Generating ${nextStage.label}...` : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ef4444', fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── ACTION BUTTONS ── */}
        {selectedProblem && !loading && (
          <div style={{
            background: '#12121a', border: '1px solid #2a2a3a',
            borderRadius: 12, padding: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7070a0', marginBottom: 12, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 2 — {allStagesDone ? 'All stages complete!' : 'Get Help'}
            </div>

            {/* Progressive stage buttons */}
            {!allStagesDone && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <button
                  onClick={() => callClaude(nextStage.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 22px', borderRadius: 8, border: 'none',
                    background: nextStage.btnColor, color: '#000',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: `0 4px 20px ${nextStage.btnColor}44`,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${nextStage.btnColor}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${nextStage.btnColor}44`; }}
                >
                  <span>{nextStage.icon}</span> {nextStage.btnText}
                </button>

                {/* Skip ahead buttons */}
                {STAGES.slice(currentStageIdx + 1).map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => { setCurrentStageIdx(currentStageIdx + 1 + i); callClaude(s.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '10px 16px', borderRadius: 8,
                      border: `1px solid ${s.color}44`,
                      background: `${s.color}11`, color: s.color,
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${s.color}22`; e.currentTarget.style.borderColor = s.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${s.color}11`; e.currentTarget.style.borderColor = `${s.color}44`; }}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            )}

            {allStagesDone && (
              <div style={{
                padding: '12px 16px', background: 'rgba(6,214,160,0.08)',
                border: '1px solid rgba(6,214,160,0.2)', borderRadius: 8,
                color: '#06d6a0', fontSize: 14, fontWeight: 600, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                🎉 You've completed all learning stages for this problem!
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid #2a2a3a', paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: '#7070a0', marginBottom: 8, fontFamily: 'monospace' }}>
                ASK ANYTHING about this problem ↓
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={customQ}
                  onChange={e => setCustomQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomQ()}
                  placeholder={`e.g. "Why use a hash map here?" or "What if array has duplicates?"`}
                  style={{
                    flex: 1, background: '#1a1a25', border: '1px solid #2a2a3a',
                    borderRadius: 8, padding: '10px 14px', color: '#e8e8f0',
                    fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  }}
                />
                <button
                  onClick={handleCustomQ}
                  disabled={!customQ.trim() || loading}
                  style={{
                    padding: '10px 18px', borderRadius: 8, border: 'none',
                    background: customQ.trim() ? '#7c6af7' : '#2a2a3a',
                    color: customQ.trim() ? '#fff' : '#7070a0',
                    fontWeight: 600, cursor: customQ.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 14, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ask →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!selectedProblem && (
          <div style={{
            background: '#12121a', border: '1px dashed #2a2a3a',
            borderRadius: 12, padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>AI Hint Engine</div>
            <div style={{ color: '#7070a0', fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
              Search for any problem from your plan above.
              I'll guide you from subtle hints → pattern explanation → full solution → complexity analysis.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
              {['#1 Two Sum', '#15 3Sum', '#200 Number of Islands', '#322 Coin Change'].map(s => (
                <button key={s} onClick={() => {
                  const [idPart, ...titleParts] = s.replace('#', '').split(' ');
                  const found = ALL_PROBLEMS.find(p => String(p.id) === idPart);
                  if (found) { selectProblem(found); setSearch(found.title); }
                }}
                  style={{
                    background: '#1a1a25', border: '1px solid #2a2a3a',
                    borderRadius: 8, padding: '8px 14px', color: '#7070a0',
                    fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c6af7'; e.currentTarget.style.color = '#7c6af7'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.color = '#7070a0'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />

        {/* Keyframe styles */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
