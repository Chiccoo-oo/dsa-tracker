import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import PlanView from './pages/PlanView';
import DayView from './pages/DayView';
import StatsPage from './pages/StatsPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dsa_progress') || '{}');
    } catch { return {}; }
  });
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dsa_notes') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('dsa_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('dsa_notes', JSON.stringify(notes));
  }, [notes]);

  const toggleProblem = (dayNum, problemId) => {
    const key = `${dayNum}-${problemId}`;
    setProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNote = (dayNum, note) => {
    setNotes(prev => ({ ...prev, [dayNum]: note }));
  };

  const navigate = (p, day = null, week = null) => {
    setPage(p);
    setSelectedDay(day);
    setSelectedWeek(week);
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      {page === 'dashboard' && (
        <Dashboard progress={progress} navigate={navigate} />
      )}
      {page === 'plan' && (
        <PlanView progress={progress} navigate={navigate} selectedWeek={selectedWeek} />
      )}
      {page === 'day' && selectedDay !== null && (
        <DayView
          day={selectedDay}
          progress={progress}
          notes={notes}
          toggleProblem={toggleProblem}
          updateNote={updateNote}
          navigate={navigate}
        />
      )}
      {page === 'stats' && (
        <StatsPage progress={progress} navigate={navigate} />
      )}
    </div>
  );
}
