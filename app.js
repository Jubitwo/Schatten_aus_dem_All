const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const daySlider = $('#day-slider');
function updateDay() {
  const hour = Number(daySlider.value);
  const angle = (hour / 24) * Math.PI * 2;
  const x = 210 + 102 * Math.cos(angle);
  const y = 160 + 102 * Math.sin(angle);
  const isDay = hour > 6 && hour < 18;

  $('#day-value').textContent = `${String(hour).padStart(2, '0')}:00 Uhr`;
  $('#person-dot').setAttribute('cx', x);
  $('#person-dot').setAttribute('cy', y);
  $('#person-dot').setAttribute('fill', isDay ? '#fff' : '#ffc857');
  $('#day-feedback').textContent = isDay
    ? 'Der Ort liegt auf der beleuchteten Tagseite.'
    : 'Der Ort liegt auf der von der Sonne abgewandten Nachtseite.';
  $('#day-svg-label').textContent = `Ort: ${isDay ? 'Tag' : 'Nacht'}`;
}
daySlider.addEventListener('input', updateDay);
updateDay();

const phases = [
  'Neumond',
  'Zunehmende Sichel',
  'Erstes Viertel',
  'Zunehmender Mond',
  'Vollmond',
  'Abnehmender Mond',
  'Letztes Viertel',
  'Abnehmende Sichel',
];
const phaseFacts = [
  'Bei Neumond steht der Mond ungefähr zwischen Sonne und Erde; die beleuchtete Seite zeigt von uns weg.',
  'Wir sehen eine schmale, zunehmende Sichel der beleuchteten Mondhälfte.',
  'Etwa die Hälfte der sichtbaren Mondscheibe ist beleuchtet.',
  'Mehr als die Hälfte der sichtbaren Mondscheibe ist beleuchtet.',
  'Bei Vollmond ist die uns zugewandte Mondhälfte weitgehend beleuchtet.',
  'Mehr als die Hälfte der sichtbaren Mondscheibe ist beleuchtet; der Anteil nimmt ab.',
  'Etwa die Hälfte der sichtbaren Mondscheibe ist beleuchtet.',
  'Nur noch eine schmale, abnehmende Sichel der beleuchteten Mondhälfte ist sichtbar.',
];
const moonSlider = $('#moon-slider');

function updateMoon() {
  const index = Number(moonSlider.value);
  const theta = Math.PI - (index * Math.PI) / 4;
  const x = 220 + 123 * Math.cos(theta);
  const y = 185 + 123 * Math.sin(theta);
  const radius = 24;
  let shadowOffset;

  if (index <= 4) {
    shadowOffset = -radius * (1 - Math.cos((index * Math.PI) / 4));
  } else {
    shadowOffset = radius * (1 - Math.cos(((8 - index) * Math.PI) / 4));
  }

  $('#moon-body').setAttribute('cx', x);
  $('#moon-body').setAttribute('cy', y);
  $('#moonClipCircle').setAttribute('cx', x);
  $('#moonClipCircle').setAttribute('cy', y);
  $('#moon-shadow').setAttribute('cx', x + shadowOffset);
  $('#moon-shadow').setAttribute('cy', y);
  $('#moon-outline').setAttribute('cx', x);
  $('#moon-outline').setAttribute('cy', y);
  $('#moon-value').textContent = phases[index];
  $('#phase-label').textContent = phases[index];
  $('#moon-feedback').textContent = phaseFacts[index];
}
moonSlider.addEventListener('input', updateMoon);
updateMoon();

const seasons = [
  'Sommer auf der Nordhalbkugel',
  'Herbst auf der Nordhalbkugel',
  'Winter auf der Nordhalbkugel',
  'Frühling auf der Nordhalbkugel',
];
const seasonFacts = [
  'Die Nordhalbkugel ist zur Sonne geneigt: Die Tage sind länger und der Lichteinfall ist steiler.',
  'Die Nordhalbkugel neigt sich zunehmend von der Sonne weg; die Tage werden kürzer.',
  'Die Nordhalbkugel ist von der Sonne weg geneigt: Die Tage sind kürzer und der Lichteinfall ist flacher.',
  'Die Nordhalbkugel neigt sich zunehmend zur Sonne; die Tage werden länger.',
];
const seasonPositions = [
  [155, 280],
  [66, 115],
  [295, 50],
  [384, 215],
];
const seasonSlider = $('#season-slider');

function updateSeason() {
  const index = Number(seasonSlider.value);
  const [x, y] = seasonPositions[index];
  const earth = $('#season-earth');

  earth.setAttribute('transform', `translate(${x - 225} ${y - 40})`);
  earth.setAttribute('aria-label', seasons[index]);
  $('#season-rays').setAttribute('d', `M225 165 ${x} ${y}`);
  $('#season-rays-label').setAttribute('x', (225 + x) / 2 + 5);
  $('#season-rays-label').setAttribute('y', (165 + y) / 2 - 5);
  $('#season-value').textContent = seasons[index];
  $('#season-svg-label').textContent = `Nordhalbkugel: ${seasons[index].split(' ')[0]}`;
  $('#season-feedback').textContent = seasonFacts[index];
}
seasonSlider.addEventListener('input', updateSeason);
updateSeason();

function setEclipse(kind) {
  const isSolar = kind === 'solar';
  const middle = $('#eclipse-middle');
  const last = $('#eclipse-last');

  middle.setAttribute('fill', isSolar ? '#c8d1d1' : '#2d8b92');
  last.setAttribute('fill', isSolar ? '#2d8b92' : '#c8d1d1');
  $('#eclipse-shadow').setAttribute(
    'd',
    isSolar ? 'M166 107 352 96v28l-186-11z' : 'M184 96 338 105v10l-154 9z',
  );
  $('#middle-label').textContent = isSolar ? 'MOND' : 'ERDE';
  $('#last-label').textContent = isSolar ? 'ERDE' : 'MOND';
  $('#eclipse-sim').setAttribute(
    'aria-label',
    isSolar
      ? 'Sonnenfinsternis: Sonne, Mond, Erde; der Mond steht in der Mitte.'
      : 'Mondfinsternis: Sonne, Erde, Mond; die Erde steht in der Mitte.',
  );
  $('#eclipse-caption').textContent = isSolar
    ? 'Der Mond steht zwischen Sonne und Erde. Sein Schatten trifft bestimmte Gebiete der Erde.'
    : 'Die Erde steht zwischen Sonne und Mond. Der Mond gerät in den Erdschatten.';

  $$('.toggle').forEach((button) => {
    const active = button.dataset.eclipse === kind;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

$$('.toggle').forEach((button) => {
  button.addEventListener('click', () => setEclipse(button.dataset.eclipse));
});

$('#eclipse-choice').addEventListener('change', (event) => {
  const feedback = $('#eclipse-feedback');
  if (!event.target.value) {
    feedback.textContent = 'Tipp: Bei einer Mondfinsternis fällt der Erdschatten auf den Mond.';
  } else if (event.target.value === 'sun-earth-moon') {
    feedback.textContent = 'Richtig! Die Erde steht zwischen Sonne und Mond. Der Mond kann in den Erdschatten eintreten.';
  } else {
    feedback.textContent = 'Noch nicht. Überlege, welcher Himmelskörper den Schatten auf den Mond wirft.';
  }
});

const answerKey = { q1: 'b', q2: 'c', q3: 'a', q4: 'c', q5: 'b' };
const correctFeedback = {
  q1: 'Genau: Die Erdrotation führt Orte abwechselnd durch die beleuchtete und die dunkle Hälfte.',
  q2: 'Richtig: Die Mondhälfte bleibt von der Sonne beleuchtet; unsere Blickrichtung auf sie ändert sich.',
  q3: 'Genau: Achsenneigung und Umlauf ändern Sonnenstand und Tageslänge. Der Abstand ist nicht die Ursache.',
  q4: 'Richtig: Bei einer Sonnenfinsternis steht der Mond zwischen Sonne und Erde.',
  q5: 'Genau: Die Atmosphäre bricht und streut Sonnenlicht; rötliches Licht erreicht den Mond im Erdschatten.',
};
const hints = {
  q1: 'Tipp: Was dreht sich innerhalb eines Tages?',
  q2: 'Tipp: Bleibt eine Hälfte des Mondes von der Sonne beleuchtet?',
  q3: 'Tipp: Achte auf die geneigte Achse und die Tageslänge.',
  q4: 'Tipp: Der Mond muss seinen Schatten auf die Erde werfen.',
  q5: 'Tipp: Welcher Farbanteil des Sonnenlichts wird in der Atmosphäre stärker gestreut?',
};

$('#quiz-form').addEventListener('submit', (event) => {
  event.preventDefault();
  let score = 0;

  Object.keys(answerKey).forEach((question) => {
    const selected = $(`input[name="${question}"]:checked`);
    const feedback = $(`#f${question.slice(1)}`);

    if (!selected) {
      feedback.textContent = 'Noch offen – wähle eine Antwort.';
      feedback.style.color = '#9a5b12';
    } else if (selected.value === answerKey[question]) {
      score += 1;
      feedback.textContent = correctFeedback[question];
      feedback.style.color = '#147d79';
    } else {
      feedback.textContent = `${hints[question]} Du kannst es noch einmal versuchen.`;
      feedback.style.color = '#a44f41';
    }
  });

  $('#quiz-result').textContent = `${score} von 5 richtig. ${
    score === 5
      ? 'Stark – du hast alle Zusammenhänge sicher erkannt.'
      : score >= 3
        ? 'Guter Zwischenstand – lies die Hinweise und versuche es erneut.'
        : 'Schau dir die Erklärungen und Hilfekarten noch einmal an und probiere es erneut.'
  }`;
});

$('#quiz-form').addEventListener('reset', () => {
  window.setTimeout(() => {
    $$('.answer-feedback').forEach((feedback) => {
      feedback.textContent = '';
      feedback.style.color = '';
    });
    $('#quiz-result').textContent = '';
  }, 0);
});

$('#print-button').addEventListener('click', () => window.print());
