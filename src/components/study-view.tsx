"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { catalog } from "@/lib/catalog";

export function StudyView({ onOpen }: { onOpen: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  useEffect(() => { const saved = localStorage.getItem("tfg-study"); if (saved) { const value = JSON.parse(saved); setIndex(Math.min(value.index ?? 0, catalog.quizPrompts.length - 1)); setScore(value.score ?? 0); } }, []);
  const quiz = catalog.quizPrompts[index];
  const choose = (choice: string) => { if (answer) return; setAnswer(choice); const nextScore = score + (choice === quiz.answer ? 1 : 0); setScore(nextScore); localStorage.setItem("tfg-study", JSON.stringify({ index, score: nextScore })); };
  const next = () => { const nextIndex = (index + 1) % catalog.quizPrompts.length; setIndex(nextIndex); setAnswer(null); localStorage.setItem("tfg-study", JSON.stringify({ index: nextIndex, score })); };
  return <><div className="section-head"><div><h2>Guided study</h2><p>Practice contained formulas, family progressions, ingredient changes, and herb counts.</p></div><button className="filter" onClick={() => { setIndex(0); setScore(0); setAnswer(null); localStorage.removeItem("tfg-study"); }}><RotateCcw size={14} /> Reset</button></div><div className="progress" aria-label={`Question ${index + 1} of ${catalog.quizPrompts.length}`}><span style={{ width: `${((index + 1) / catalog.quizPrompts.length) * 100}%` }} /></div><section className="panel study-card"><small>Question {index + 1} of {catalog.quizPrompts.length} · score {score}</small><h3>{quiz.prompt}</h3><div className="answers">{quiz.choices.map((choice) => <button key={choice} className={`answer ${answer ? choice === quiz.answer ? "correct" : choice === answer ? "wrong" : "" : ""}`} onClick={() => choose(choice)}>{choice}</button>)}</div>{answer && <div><p>{answer === quiz.answer ? "Correct." : `The reviewed answer is ${quiz.answer}.`}</p><div className="filters"><button className="filter active" onClick={next}>Next question</button><button className="filter" onClick={() => onOpen(quiz.formulaId)}>Review formula</button></div></div>}</section></>;
}
