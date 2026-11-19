import {courseLabel} from './course-scope.js';

export function mistakeNavigation(link, h, {current, subjects, subject}) {
  return `<div class="mistake-navigation">
    <nav class="mistake-views" aria-label="复习视图">
      ${link('mistakes','错题',current === 'mistakes' ? 'mistake-current' : '')}
      ${link('mistakes/bookmarks','我的书签',current === 'bookmarks' ? 'mistake-current' : '')}
    </nav>
    ${subjects.length > 1 ? `<label class="mistake-course"><span class="sr-only">学科</span>
      <select aria-label="学科" data-mistake-course>${subjects.map(c =>
        `<option value="${h(c)}"${c === subject ? ' selected' : ''}>${h(courseLabel(c))}</option>`).join('')}</select></label>` :
      `<span class="mistake-course-name">${h(courseLabel(subject))}</span>`}
  </div>`;
}

export function bindMistakeNavigation(root) {
  root.querySelector('.mistake-current')?.setAttribute('aria-current','page');
}
