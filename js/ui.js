/* ══════════════════════════════════
   محنك الأنمي - واجهة المستخدم
   رسم الشاشات والأزرار
   ══════════════════════════════════ */

// ═══ التبديل بين الشاشات ═══
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

// ═══ تفريغ عنصر ═══
function clearElement(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

// ═══ عرض قائمة الممالك ═══
function renderKingdoms() {
  const container = document.getElementById('kingdoms-list');
  if (!container) return;
  clearElement(container);

  const meta = getKingdomsMeta();
  const scoreEl = document.getElementById('score-display');
  if (scoreEl) scoreEl.textContent = gameState.totalScore;

  meta.forEach(k => {
    const unlocked = isKingdomUnlocked(k.id);
    const card = document.createElement('div');
    card.className = 'kingdom-card' + (unlocked ? '' : ' locked');
    if (gameState.rewards.includes(k.id)) card.classList.add('completed');

    // حساب التقدم
    let doneProvinces = 0;
    for (let p = 1; p <= k.provinces; p++) {
      if (isProvinceComplete(k.id, p)) doneProvinces++;
    }

    card.innerHTML = `
      <div class="kingdom-icon">${k.icon}</div>
      <div class="kingdom-info">
        <div class="kingdom-name">${k.name}</div>
        <div class="kingdom-desc">${k.desc}</div>
        <div class="kingdom-progress">${doneProvinces} / ${k.provinces} إقليم</div>
      </div>
    `;

    if (unlocked) {
      card.addEventListener('click', () => {
        sfxClick();
        openKingdom(k.id);
      });
    }
    container.appendChild(card);
  });
}

// ═══ فتح مملكة (عرض الأقاليم) ═══
let currentKingdomId = 1;
function openKingdom(kingdomId) {
  currentKingdomId = kingdomId;
  const meta = getKingdomsMeta();
  const k = meta.find(x => x.id === kingdomId);
  if (!k) return;

  document.getElementById('province-title').textContent = k.name;
  renderProvinces(kingdomId, k.provinces);
  showScreen('screen-provinces');
}

// ═══ عرض الأقاليم ═══
function renderProvinces(kingdomId, totalProvinces) {
  const container = document.getElementById('provinces-list');
  if (!container) return;
  clearElement(container);

  for (let p = 1; p <= totalProvinces; p++) {
    const unlocked = isProvinceUnlocked(kingdomId, p);
    const complete = isProvinceComplete(kingdomId, p);

    const card = document.createElement('div');
    card.className = 'province-card' +
      (unlocked ? '' : ' locked') +
      (complete ? ' completed' : '');

    card.innerHTML = `
      <span class="province-number">${getProvinceName(kingdomId, p)}</span>
      <span class="province-status">${complete ? '✅' : (unlocked ? '▶️' : '🔒')}</span>
    `;

    if (unlocked) {
      card.addEventListener('click', () => {
        sfxClick();
        openProvince(kingdomId, p);
      });
    }
    container.appendChild(card);
  }
}

// ═══ فتح إقليم (عرض المراحل) ═══
let currentProvinceId = 1;
function openProvince(kingdomId, provinceId) {
  currentProvinceId = provinceId;
  document.getElementById('level-title').textContent =
    getProvinceName(kingdomId, provinceId);
  renderLevels(kingdomId, provinceId);
  showScreen('screen-levels');
}

// ═══ عرض المراحل ═══
function renderLevels(kingdomId, provinceId) {
  const container = document.getElementById('levels-list');
  if (!container) return;
  clearElement(container);

  const progress = getLevelsProgress(kingdomId, provinceId);

  for (let l = 1; l <= 5; l++) {
    const unlocked = isLevelUnlocked(kingdomId, provinceId, l);
    const complete = progress[l - 1] === true;

    const card = document.createElement('div');
    card.className = 'level-card' +
      (unlocked ? '' : ' locked') +
      (complete ? ' completed' : '');

    card.textContent = complete ? '⭐' : l;

    if (unlocked && !complete) {
      card.classList.add('current');
      card.addEventListener('click', () => {
        sfxClick();
        launchQuiz(kingdomId, provinceId, l);
      });
    }
    container.appendChild(card);
  }
}

// ═══ بدء عرض سؤال ═══
function renderQuestion() {
  const q = getCurrentQuestion();
  if (!q) return;

  const questionArea = document.getElementById('question-area');
  const answersArea = document.getElementById('answers-area');
  clearElement(questionArea);
  clearElement(answersArea);

  // شريط التقدم
  document.getElementById('q-counter').textContent =
    `${session.currentIndex + 1} / ${session.totalQuestions}`;
  const pct = ((session.currentIndex) / session.totalQuestions) * 100;
  document.getElementById('q-progress').style.width = pct + '%';
  document.getElementById('quiz-score').textContent = session.correctCount;

  // نوع السؤال
  if (q.type === 'image') {
    const img = document.createElement('img');
    img.src = q.image;
    img.className = 'question-image';
    img.alt = '';
    questionArea.appendChild(img);
  }

  const text = document.createElement('div');
  text.className = 'question-text';
  text.textContent = q.question;
  questionArea.appendChild(text);

  // حسب نوع السؤال
  if (q.type === 'syllables') {
    renderSyllables(q, answersArea);
  } else {
    renderChoices(q, answersArea);
  }
}

// ═══ عرض اختيارات (نوع 1) ═══
function renderChoices(q, container) {
  const choices = shuffleArray(q.choices);
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => handleChoiceAnswer(btn, choice, q.answer));
    container.appendChild(btn);
  });
}

// ═══ معالجة إجابة اختيار ═══
function handleChoiceAnswer(btn, choice, answer) {
  const allBtns = document.querySelectorAll('.answer-btn');
  allBtns.forEach(b => b.classList.add('disabled'));

  if (choice === answer) {
    btn.classList.add('correct');
    sfxCorrect();
    registerCorrect();
  } else {
    btn.classList.add('wrong');
    sfxWrong();
    // إظهار الإجابة الصحيحة
    allBtns.forEach(b => {
      if (b.textContent === answer) b.classList.add('correct');
    });
  }

  setTimeout(() => proceedNext(), 1400);
}

// ═══ عرض مقاطع (نوع 2) ═══
function renderSyllables(q, container) {
  // شريط الإجابة الفاضية
  const answerBar = document.createElement('div');
  answerBar.className = 'syllable-answer';
  answerBar.id = 'syllable-answer';
  container.appendChild(answerBar);

  // حوض المقاطع
  const pool = document.createElement('div');
  pool.className = 'syllables-pool';
  pool.id = 'syllables-pool';
  container.appendChild(pool);

  // زر تأكيد
  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.style.margin = '0 16px';
  confirmBtn.textContent = 'تأكيد';
  confirmBtn.disabled = true;
  confirmBtn.id = 'syllable-confirm';
  container.appendChild(confirmBtn);

  const chosen = [];

  // خلط المقاطع
  const shuffled = shuffleArray(q.syllables);
  shuffled.forEach((syl, i) => {
    const s = document.createElement('div');
    s.className = 'syllable';
    s.textContent = syl;
    s.dataset.index = i;
    s.addEventListener('click', () => {
      if (s.classList.contains('used')) return;
      sfxClick();
      s.classList.add('used');
      chosen.push({ el: s, text: syl });
      renderChosen();
    });
    pool.appendChild(s);
  });

  function renderChosen() {
    clearElement(answerBar);
    chosen.forEach((item, idx) => {
      const slot = document.createElement('div');
      slot.className = 'syllable-slot';
      slot.textContent = item.text;
      slot.addEventListener('click', () => {
        // إزالة المقطع
        sfxClick();
        item.el.classList.remove('used');
        chosen.splice(idx, 1);
        renderChosen();
      });
      answerBar.appendChild(slot);
    });
    confirmBtn.disabled = chosen.length === 0;
  }

  confirmBtn.addEventListener('click', () => {
    const userAnswer = chosen.map(c => c.text).join('');
    const correctAnswer = q.answer;
    confirmBtn.disabled = true;

    if (userAnswer === correctAnswer) {
      sfxCorrect();
      registerCorrect();
      answerBar.style.borderColor = 'var(--success)';
    } else {
      sfxWrong();
      answerBar.style.borderColor = 'var(--danger)';
      // إظهار الإجابة الصحيحة
      clearElement(answerBar);
      const correct = document.createElement('div');
      correct.style.cssText = 'color: var(--success); font-weight: 900; font-size: 20px; padding: 10px;';
      correct.textContent = correctAnswer;
      answerBar.appendChild(correct);
    }

    setTimeout(() => proceedNext(), 1600);
  });
}

// ═══ الانتقال للسؤال التالي ═══
function proceedNext() {
  if (nextQuestion()) {
    renderQuestion();
  } else {
    finishLevel();
  }
}

// ═══ عرض شاشة النتيجة ═══
function showResult(correct, total, passed) {
  const title = document.getElementById('result-title');
  const content = document.getElementById('result-content');
  const nextBtn = document.getElementById('btn-next');

  title.textContent = passed ? '🎉 نجحت!' : '😅 حاول تاني';
  content.innerHTML = `
    <p style="font-size: 22px; font-weight: 900; margin: 10px 0;">
      إجابات صحيحة: <span style="color: var(--gold);">${correct} / ${total}</span>
    </p>
    <p style="color: var(--text-dim);">
      ${passed ? 'كسبت نجمة واتقدمت للمرحلة الجاية' : 'لازم تجيب 60% على الأقل'}
    </p>
  `;

  nextBtn.textContent = passed ? 'تمام' : 'حاول تاني';
  nextBtn.onclick = () => {
    sfxClick();
    if (passed) {
      // نرجع للمراحل
      renderLevels(session.kingdomId, session.provinceId);
      showScreen('screen-levels');
    } else {
      // نعيد المرحلة
      launchQuiz(session.kingdomId, session.provinceId, session.levelId);
    }
  };

  showScreen('screen-result');
}

// ═══ بدء المرحلة (ربط المحرك بالواجهة) ═══
function launchQuiz(kingdomId, provinceId, levelId) {
  startLevel(kingdomId, provinceId, levelId, (correct, total, passed) => {
    showResult(correct, total, passed);
  });
  showScreen('screen-quiz');
  renderQuestion();
}

// ═══ تحديث الجوائز ═══
function renderRewardsBar() {
  // يظهر لاحقًا في شاشة الممالك
}
