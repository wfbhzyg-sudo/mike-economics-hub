import {unitCourse} from '../homework/subject-catalog.js';
import {lessonFocus} from '../homework/lesson-focus.js';
import {expandedLessonFocus} from './lesson-focus-data.mjs';
import {lessonExamples} from './lesson-mcq-data.mjs';

export function topicLesson(unitId, topic) {
  if (!topic) return null;
  const key = unitCourse(unitId) + ':' + topic.id;
  const original = lessonFocus[key];
  const compiled = original && {
    ...original,
    ...expandedLessonFocus[key],
    examples: lessonExamples[key] || [],
  };
  const saved = topic.focus;
  // Older imports put a short directory summary in this field, not a lesson document.
  if (typeof saved === 'string') {
    return compiled || (saved.trim() ? {goal: saved.trim()} : null);
  }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return compiled || null;
  const fields = Object.entries(saved).filter(([, value]) =>
    value != null && (typeof value !== 'string' || value.trim()) && (!Array.isArray(value) || value.length));
  return fields.length ? {...compiled, ...Object.fromEntries(fields)} : compiled || null;
}
