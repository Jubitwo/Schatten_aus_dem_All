const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateRangeText(input, value) {
  input.setAttribute('aria-valuetext', value);
}

function setupPrediction(name, getAnswer, correctMessage, hintMessage) {
  const select = $(`#${name}-prediction`);
  const button = $(`[data-check="${name}"]`);
  const feedback = $(`#${name}-prediction-feedback`);
  const solution = $(`[data-solution="${name}"]`);
  let attempts = 0;

  button.addEventListener('click', () => {
    if (!select.value) {
      feedback.textContent = 'Wähle erst eine Vorhersage aus und vergleiche sie dann mit dem Modell.';
      return;
    }

    if (select.value === getAnswer()) {
      feedback.textContent = correctMessage();
      feedback.classList.add('is-correct');
      feedback.classList.remove('is-hint');
      return;
    }

    attempts += 1;
    feedback.classList.remove('is-correct');
    feedback.classList.add('is-hint');
    feedback.textContent = attempts === 1
      ? hintMessage()
      : `${hintMessage()} Du kannst die Lösung jetzt mit Begründung aufklappen.`;
    if (attempts >= 2) solution.hidden = false;
  });

  select.addEventListener('change', () => {
    feedback.textContent = '';
    feedback.classList.remove('is-correct', 'is-hint');
  });
}

const daySlider = $('#day-slider');
function updateDay() {
  const hour = Number(daySlider.value);
  const isDay = hour >= 6 && hour < 18;
  const earthCenter = { x: 244, y: 157 };
  const pointRadius = 96;
  const angle = hour * Math.PI / 12;

  $('#earth-surface').setAttribute(
    'transform',
    `rotate(${hour * 15} ${earthCenter.x} ${earthCenter.y})`,
  );
  $('#person-dot').setAttribute('cx', earthCenter.x + pointRadius * Math.cos(angle));
  $('#person-dot').setAttribute('cy', earthCenter.y + pointRadius * Math.sin(angle));
  $('#person-dot').setAttribute('fill', isDay ? '#ffc857' : '#f3efe5');
  $('#day-value').textContent = `${String(hour).padStart(2, '0')}:00 Uhr`;
  $('#day-svg-label').textContent = `Ort: ${isDay ? 'Tag' : 'Nacht'}`;
  $('#day-feedback').textContent = isDay
    ? 'Dein Ort liegt auf der von der Sonne beleuchteten Tagseite.'
    : 'Dein Ort liegt auf der sonnenabgewandten Nachtseite.';
  $('#earth-svg-description').textContent = `Die Sonne beleuchtet die linke Erdhalbkugel. Der markierte Ort steht um ${hour} Uhr auf der ${isDay ? 'Tagseite' : 'Nachtseite'}.`;
  updateRangeText(daySlider, `${hour} Uhr, ${isDay ? 'Tag' : 'Nacht'}`);
}

daySlider.addEventListener('input', updateDay);
updateDay();

setupPrediction(
  'day',
  () => Number(daySlider.value) >= 6 && Number(daySlider.value) < 18 ? 'day' : 'night',
  () => `Stimmt: Um ${Number(daySlider.value)} Uhr steht der Ort auf der ${Number(daySlider.value) >= 6 && Number(daySlider.value) < 18 ? 'beleuchteten Tagseite' : 'dunklen Nachtseite'}.`,
  () => 'Tipp: Vergleiche den Ortspunkt mit der beleuchteten, zur Sonne gerichteten Erdseite.',
);

const phaseList = [
  { code: 'new', name: 'Neumond' },
  { code: 'waxing-crescent', name: 'Zunehmende Sichel' },
  { code: 'first-quarter', name: 'Erstes Viertel' },
  { code: 'waxing-gibbous', name: 'Zunehmender Mond' },
  { code: 'full', name: 'Vollmond' },
  { code: 'waning-gibbous', name: 'Abnehmender Mond' },
  { code: 'last-quarter', name: 'Letztes Viertel' },
  { code: 'waning-crescent', name: 'Abnehmende Sichel' },
];
const moonSlider = $('#moon-slider');
let moonTimer = null;

function getPhase(progress) {
  const p = progress / 100;
  const index = Math.floor((p * 8 + 0.5) % 8);
  return phaseList[index];
}

function makeEarthViewShadow(phase, fraction) {
  const cx = 110;
  const cy = 85;
  const radius = 47;
  if (fraction <= 0.005) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 0 ${cx} ${cy - radius} Z`;
  }
  if (fraction >= 0.995) return '';

  const waxing = phase.code === 'new'
    || phase.code === 'waxing-crescent'
    || phase.code === 'first-quarter'
    || phase.code === 'waxing-gibbous';
  const terminator = waxing
    ? radius * Math.cos(Math.PI * fraction)
    : -radius * Math.cos(Math.PI * fraction);
  const sweep = waxing ? 1 : 0;
  const d = waxing
    ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 ${sweep} ${cx} ${cy + radius} Q ${cx + terminator} ${cy} ${cx} ${cy - radius} Z`
    : `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 ${sweep} ${cx} ${cy + radius} Q ${cx + terminator} ${cy} ${cx} ${cy - radius} Z`;
  return d;
}

function updateMoon() {
  const progress = Number(moonSlider.value);
  const p = progress / 100;
  const angle = Math.PI - p * 2 * Math.PI;
  const orbitRadius = 69;
  const x = 210 + orbitRadius * Math.cos(angle);
  const y = 150 + orbitRadius * Math.sin(angle);
  const phase = getPhase(progress);
  const fraction = (1 + Math.cos(angle)) / 2;
  const topRadius = 15;
  const topLitPath = `M ${x} ${y - topRadius} A ${topRadius} ${topRadius} 0 0 0 ${x} ${y + topRadius} Z`;

  $('#moon-top-base').setAttribute('cx', x);
  $('#moon-top-base').setAttribute('cy', y);
  $('#moon-top-base').setAttribute('aria-label', `Mondposition: ${phase.name}`);
  $('#moon-top-lit').setAttribute('d', topLitPath);
  $('#moon-top-phase').textContent = `Position: ${phase.name}`;
  $('#moon-view-shadow').setAttribute('d', makeEarthViewShadow(phase, fraction));
  $('#moon-value').textContent = phase.name;
  $('#moon-earth-phase').textContent = phase.name;
  $('#moon-earth-description').textContent = `Von der Erde aus erscheint der Mond als ${phase.name.toLowerCase()}. Etwa ${Math.round(fraction * 100)} Prozent der sichtbaren Scheibe sind beleuchtet.`;
  $('#moon-top-description').textContent = `Die Sonne beleuchtet die Mondhälfte links. Der Mond steht an der Position ${phase.name} auf seiner Bahn.`;
  $('#moon-feedback').textContent = phase.code === 'new'
    ? 'Die Mondseite, die wir sehen, ist fast ganz dunkel. Die Sonne beleuchtet die von uns abgewandte Hälfte.'
    : phase.code === 'full'
      ? 'Die der Erde zugewandte Mondhälfte ist fast ganz beleuchtet. Die Sonne steht von der Erde aus gesehen gegenüber dem Mond.'
      : `${phase.name}: Von der Erde aus sehen wir ungefähr ${Math.round(fraction * 100)} Prozent der beleuchteten Mondhälfte.`;
  updateRangeText(moonSlider, `${phase.name}, ${progress} Prozent des Umlaufs`);
}

moonSlider.addEventListener('input', () => {
  stopMoonAnimation();
  updateMoon();
});
updateMoon();

setupPrediction(
  'moon',
  () => getPhase(Number(moonSlider.value)).code,
  () => `Richtig: Die aktuelle Stellung zeigt ${getPhase(Number(moonSlider.value)).name}.`,
  () => 'Tipp: Sieh zuerst von oben, ob der Mond auf der Sonnen- oder der gegenüberliegenden Erdseite steht. Vergleiche danach die beleuchtete Scheibe.',
);

function stopMoonAnimation() {
  if (!moonTimer) return;
  window.clearInterval(moonTimer);
  moonTimer = null;
  $('#moon-play').textContent = 'Umlauf abspielen';
  $('#moon-play').setAttribute('aria-label', 'Mondumlauf abspielen');
}

$('#moon-play').addEventListener('click', () => {
  if (moonTimer) {
    stopMoonAnimation();
    return;
  }
  if (Number(moonSlider.value) >= 100) moonSlider.value = '0';
  $('#moon-play').textContent = 'Pause';
  $('#moon-play').setAttribute('aria-label', 'Mondumlauf pausieren');
  moonTimer = window.setInterval(() => {
    const increment = reducedMotion.matches ? 0.6 : 1.6;
    const next = Number(moonSlider.value) + increment;
    if (next >= 100) {
      moonSlider.value = '100';
      updateMoon();
      stopMoonAnimation();
      return;
    }
    moonSlider.value = String(next);
    updateMoon();
  }, 250);
});

$('#moon-reset').addEventListener('click', () => {
  stopMoonAnimation();
  moonSlider.value = '0';
  updateMoon();
});

const seasonSlider = $('#season-slider');
const seasonNames = ['Sommer', 'Herbst', 'Winter', 'Frühling'];
const southSeasonNames = ['Winter', 'Frühling', 'Sommer', 'Herbst'];
const latitude = 49;
const orbitCenter = { x: 250, y: 165 };
const orbitRadius = 126;

function seasonIndex(progress) {
  return Math.floor((((progress + 12.5) % 100) / 25)) % 4;
}

function pathPoint(center, radius, angle) {
  return {
    x: center.x + radius * Math.cos(angle),
    y: center.y + radius * Math.sin(angle),
  };
}

function describeDayArc(hours) {
  const radius = 43;
  const span = (hours / 24) * 360;
  const startAngle = (270 - span / 2) * Math.PI / 180;
  const endAngle = (270 + span / 2) * Math.PI / 180;
  const start = pathPoint({ x: 60, y: 60 }, radius, startAngle);
  const end = pathPoint({ x: 60, y: 60 }, radius, endAngle);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function seasonEvent(progress) {
  const events = [
    { at: 0, name: 'Sommersonnenwende auf der Nordhalbkugel' },
    { at: 25, name: 'Tag-und-Nacht-Gleiche im Herbst auf der Nordhalbkugel' },
    { at: 50, name: 'Wintersonnenwende auf der Nordhalbkugel' },
    { at: 75, name: 'Tag-und-Nacht-Gleiche im Frühling auf der Nordhalbkugel' },
  ];
  return events.find((event) => {
    const distance = Math.min(Math.abs(progress - event.at), 100 - Math.abs(progress - event.at));
    return distance <= 1;
  })?.name;
}

function updateSeason() {
  const progress = Number(seasonSlider.value);
  const p = progress / 100;
  const angle = (113.5 * Math.PI / 180) - p * 2 * Math.PI;
  const earthPosition = pathPoint(orbitCenter, orbitRadius, angle);
  const index = seasonIndex(progress);
  const declination = 23.5 * Math.cos(p * 2 * Math.PI);
  const sunAltitude = 90 - Math.abs(latitude - declination);
  const hourAngleCosine = -Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180);
  const dayHours = hourAngleCosine <= -1
    ? 24
    : hourAngleCosine >= 1
      ? 0
      : (24 / Math.PI) * Math.acos(hourAngleCosine);
  const localSunX = orbitCenter.x - earthPosition.x;
  const localSunY = orbitCenter.y - earthPosition.y;
  const distance = Math.hypot(localSunX, localSunY);
  const directionX = localSunX / distance;
  const directionY = localSunY / distance;

  $('#season-earth').setAttribute(
    'transform',
    `translate(${earthPosition.x} ${earthPosition.y})`,
  );
  $('#season-earth-light').setAttribute('x1', -26 * directionX);
  $('#season-earth-light').setAttribute('y1', -26 * directionY);
  $('#season-earth-light').setAttribute('x2', 26 * directionX);
  $('#season-earth-light').setAttribute('y2', 26 * directionY);
  $('#season-earth-disk').setAttribute(
    'aria-label',
    `Erde: beleuchtete Seite zeigt zur Sonne. Erdachse bleibt geneigt und parallel.`,
  );

  const perpendicularX = -directionY;
  const perpendicularY = directionX;
  const rayGroup = $('#season-rays');
  const sunRadius = 32;
  const earthRadius = 30;
  rayGroup.querySelectorAll('path').forEach((ray, rayIndex) => {
    const offset = (rayIndex - 1) * 12;
    const startX = orbitCenter.x + directionX * sunRadius + perpendicularX * offset;
    const startY = orbitCenter.y + directionY * sunRadius + perpendicularY * offset;
    const endX = earthPosition.x - directionX * earthRadius + perpendicularX * offset;
    const endY = earthPosition.y - directionY * earthRadius + perpendicularY * offset;
    ray.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
  });

  $$('.season-mark').forEach((mark) => {
    mark.classList.toggle('is-current', Number(mark.dataset.seasonMark) === Math.round(progress / 25) * 25 % 100);
  });
  $$('.season-choice').forEach((button) => {
    const active = Number(button.dataset.season) === index * 25;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  $('#north-season').textContent = seasonNames[index];
  $('#south-season').textContent = southSeasonNames[index];
  $('#season-value').textContent = `${seasonNames[index]} · Nordhalbkugel`;
  updateRangeText(seasonSlider, `${seasonNames[index]} auf der Nordhalbkugel, ${Math.round(progress)} Prozent der Bahn`);
  $('#daylight-arc').setAttribute('d', describeDayArc(dayHours));
  $('#daylight-number').textContent = `${dayHours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h`;
  $('#daylight-description').textContent = dayHours > 14
    ? 'Langer Tag, kurze Nacht.'
    : dayHours < 10
      ? 'Kurzer Tag, lange Nacht.'
      : 'Tag und Nacht sind ungefähr gleich lang.';

  const altitudeRadians = sunAltitude * Math.PI / 180;
  const rayLength = 72;
  const impactX = 162;
  const impactY = 118;
  const startX = impactX - rayLength * Math.cos(altitudeRadians);
  const startY = impactY - rayLength * Math.sin(altitudeRadians);
  $('#sun-angle-dot').setAttribute('cx', startX);
  $('#sun-angle-dot').setAttribute('cy', startY);
  $('#sun-ray').setAttribute('d', `M ${startX} ${startY} L ${impactX} ${impactY}`);
  $('#sun-ray-arrow').setAttribute('d', `M ${startX - 12} ${startY - 5} L ${impactX - 12} ${impactY - 5}`);
  const arcRadius = 25;
  const arcEnd = {
    x: impactX - arcRadius * Math.cos(altitudeRadians),
    y: impactY - arcRadius * Math.sin(altitudeRadians),
  };
  $('#sun-angle-arc').setAttribute(
    'd',
    `M ${impactX - arcRadius} ${impactY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEnd.x} ${arcEnd.y}`,
  );
  const footprint = Math.min(140, 50 / Math.max(Math.sin(altitudeRadians), 0.18));
  $('#sun-footprint').setAttribute('x', impactX - footprint / 2);
  $('#sun-footprint').setAttribute('width', footprint);
  $('#sun-angle-value').textContent = `Sonnenhöhe: ${Math.round(sunAltitude)}°`;
  $('#sun-footprint-label').textContent = sunAltitude > 45
    ? 'Energie auf kleinerer Fläche'
    : 'Energie auf größerer Fläche';
  $('#sun-angle-desc').textContent = `Die Mittagssonne steht ${Math.round(sunAltitude)} Grad über dem Horizont. Die Strahlen verteilen sich ${sunAltitude > 45 ? 'auf eine kleinere' : 'auf eine größere'} Fläche.`;

  $('#season-feedback').textContent = seasonEvent(progress)
    ? `${seasonEvent(progress)}. Die Achse bleibt geneigt; Tageslänge und Sonnenhöhe ändern sich.`
    : `Nördlich: ${seasonNames[index]}. Südlich: ${southSeasonNames[index]}. In Stuttgart dauert der Tag etwa ${dayHours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Stunden.`;
  $('#season-orbit-description').textContent = `Die Erde steht an der ${seasonNames[index].toLowerCase()}-Position. Die Erdachse bleibt parallel ausgerichtet. Auf der Nordhalbkugel ist ${seasonNames[index].toLowerCase()}, auf der Südhalbkugel ${southSeasonNames[index].toLowerCase()}.`;
}

seasonSlider.addEventListener('input', updateSeason);
$$('.season-choice').forEach((button) => {
  button.addEventListener('click', () => {
    seasonSlider.value = button.dataset.season;
    updateSeason();
  });
});
updateSeason();

setupPrediction(
  'season',
  () => {
    const declination = 23.5 * Math.cos(Number(seasonSlider.value) / 100 * 2 * Math.PI);
    return declination > 0.7 ? 'north' : declination < -0.7 ? 'south' : 'neither';
  },
  () => {
    const answer = Number(seasonSlider.value) === 25 || Number(seasonSlider.value) === 75
      ? 'Genau an einer Tag-und-Nacht-Gleiche ist keine Halbkugel deutlich zur Sonne geneigt.'
      : 'Richtig: Die zur Sonne geneigte Halbkugel hat den höheren Sonnenstand und den längeren Tag.';
    return answer;
  },
  () => 'Tipp: Vergleiche Nord- und Südhalbkugel, die Tageslänge und den Sonnenstand. An den Tag-und-Nacht-Gleichen ist keine Seite zur Sonne geneigt.',
);
const eclipseSlider = $('#eclipse-slider');
let eclipseKind = 'solar';
let eclipseTimer = null;

function stopEclipseAnimation() {
  if (!eclipseTimer) return;
  window.clearInterval(eclipseTimer);
  eclipseTimer = null;
  $('#eclipse-play').textContent = 'Ablauf abspielen';
  $('#eclipse-play').setAttribute('aria-label', 'Finsternisablauf abspielen');
}

function updateEclipse() {
  const progress = Number(eclipseSlider.value) / 100;
  const output = $('#eclipse-value');
  const status = $('#eclipse-feedback');
  const description = $('#eclipse-svg-description');

  if (eclipseKind === 'solar') {
    const markerX = 359 + progress * 82;
    $('#solar-shadow-marker').setAttribute('cx', markerX);
    $('#solar-core-marker').setAttribute('cx', markerX);
    let phase;
    let text;
    if (progress < 0.12) {
      phase = 'Vor dem Kontakt';
      text = 'Der Mondschatten nähert sich der Erde.';
    } else if (progress < 0.34) {
      phase = 'Halbschatten';
      text = 'Der Halbschatten trifft die Erde: Von diesem Bereich aus beginnt eine partielle Sonnenfinsternis.';
    } else if (progress < 0.72) {
      phase = 'Kernschatten';
      text = 'Der dunkle Kernschatten wandert über einen kleinen Bereich der Erde. Dort ist eine totale Sonnenfinsternis sichtbar.';
    } else if (progress < 0.94) {
      phase = 'Finsternis klingt ab';
      text = 'Der Kernschatten zieht weiter; der Halbschatten bleibt kurz sichtbar.';
    } else {
      phase = 'Nach dem Kontakt';
      text = 'Der Mondschatten hat die Erde verlassen.';
    }
    output.textContent = phase;
    status.textContent = text;
    description.textContent = `Sonne, Mond und Erde stehen in einer Reihe. Der Mondschatten bewegt sich über einen begrenzten Bereich der Erde. Aktueller Abschnitt: ${phase}.`;
    $('#eclipse-kinds').innerHTML = '<strong>Sonnenfinsternis:</strong> Im Kernschatten kann die Sonne ganz verdeckt sein; im Halbschatten ist sie nur teilweise verdeckt.';
  } else {
    const moonY = 24 + progress * 226;
    const distanceFromAxis = Math.abs(moonY - 137);
    $('#lunar-moon').setAttribute('cy', moonY);
    $('#lunar-moon-clip-circle').setAttribute('cy', moonY);
    $('#lunar-penumbra-cover').setAttribute('cy', moonY);
    $('#lunar-shadow').setAttribute('cy', 137);
    let phase;
    let text;
    if (distanceFromAxis > 83) {
      phase = 'Außerhalb des Halbschattens';
      text = 'Der Mond liegt außerhalb der Schattenzonen.';
    } else if (distanceFromAxis > 48) {
      phase = 'Halbschatten';
      text = 'Der Mond liegt im Halbschatten. Seine Oberfläche wird etwas dunkler, aber der Kernschatten wird nicht berührt.';
    } else if (distanceFromAxis > 10) {
      phase = 'Partielle Mondfinsternis';
      text = 'Ein Teil des Mondes gerät in den Kernschatten der Erde.';
    } else {
      phase = 'Totale Mondfinsternis';
      text = 'Der Mond ist vollständig im Kernschatten. Gebrochenes rötliches Sonnenlicht kann ihn erreichen; er leuchtet nicht selbst und wird nicht heiß.';
    }

    const inUmbra = distanceFromAxis <= 48;
    const total = distanceFromAxis <= 10;
    $('#lunar-moon').setAttribute('fill', total ? '#b96755' : phase === 'Halbschatten' ? '#c8c0ac' : '#eee9da');
    $('#lunar-shadow').setAttribute('opacity', inUmbra ? total ? '0.42' : '0.9' : '0');
    $('#lunar-penumbra-cover').setAttribute('opacity', phase === 'Halbschatten' ? '0.45' : '0');
    $('#lunar-phase-label').textContent = phase;
    $('#lunar-moon').setAttribute('aria-label', `Mondposition: ${phase}`);
    output.textContent = phase;
    status.textContent = text;
    description.textContent = `Die Erde steht zwischen Sonne und Mond. Der Mond bewegt sich durch den Erdhalbschatten und Kernschatten. Aktueller Abschnitt: ${phase}.`;
    $('#eclipse-kinds').innerHTML = '<strong>Mondfinsternis:</strong> Halbschatten = nur etwas dunkler · partiell = ein Teil im Kernschatten · total = der ganze Mond im Kernschatten.';
  }

  updateRangeText(eclipseSlider, `${output.textContent}, ${Math.round(progress * 100)} Prozent des Ablaufs`);
}

function setEclipse(kind) {
  stopEclipseAnimation();
  eclipseKind = kind;
  eclipseSlider.value = '0';
  const solar = kind === 'solar';
  $('#solar-scene').setAttribute('display', solar ? 'inline' : 'none');
  $('#lunar-scene').setAttribute('display', solar ? 'none' : 'inline');
  $('#eclipse-svg-title').textContent = solar
    ? 'Sonnenfinsternis mit Halbschatten und Kernschatten'
    : 'Mondfinsternis mit Erdhalbschatten und Erdkernschatten';
  $$('.toggle').forEach((button) => {
    const active = button.dataset.eclipse === kind;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  updateEclipse();
}

$$('.toggle').forEach((button) => {
  button.addEventListener('click', () => setEclipse(button.dataset.eclipse));
});
eclipseSlider.addEventListener('input', () => {
  stopEclipseAnimation();
  updateEclipse();
});
$('#eclipse-play').addEventListener('click', () => {
  if (eclipseTimer) {
    stopEclipseAnimation();
    return;
  }
  if (Number(eclipseSlider.value) >= 100) eclipseSlider.value = '0';
  $('#eclipse-play').textContent = 'Pause';
  $('#eclipse-play').setAttribute('aria-label', 'Finsternisablauf pausieren');
  eclipseTimer = window.setInterval(() => {
    const increment = reducedMotion.matches ? 0.6 : 1.4;
    const next = Number(eclipseSlider.value) + increment;
    if (next >= 100) {
      eclipseSlider.value = '100';
      updateEclipse();
      stopEclipseAnimation();
      return;
    }
    eclipseSlider.value = String(next);
    updateEclipse();
  }, 250);
});
$('#eclipse-reset').addEventListener('click', () => {
  stopEclipseAnimation();
  eclipseSlider.value = '0';
  updateEclipse();
});
setupPrediction(
  'eclipse',
  () => 'sun-earth-moon',
  () => 'Genau: Die Erde steht zwischen Sonne und Mond. So kann der Erdschatten den Mond treffen.',
  () => 'Tipp: Welcher Körper muss sich zwischen Sonne und Mond befinden, damit sein Schatten auf den Mond fällt?',
);

const quizQuestions = [
  { id: 'q1', answer: 'b', hint: 'Tipp: Welcher Himmelskörper dreht sich innerhalb eines Tages?', correct: 'Richtig: Die Erdrotation führt den Ort durch die beleuchtete und die dunkle Hälfte.' },
  { id: 'q2', answer: 'c', hint: 'Tipp: Bleibt eine Mondhälfte von der Sonne beleuchtet?', correct: 'Richtig: Unsere Blickrichtung auf die beleuchtete Mondhälfte verändert sich beim Umlauf.' },
  { id: 'q3', answer: 'a', hint: 'Tipp: Vergleiche Sonnenhöhe und Tageslänge; verändere nicht den Abstand zur Sonne.', correct: 'Richtig: Achsenneigung und Umlauf verändern Sonnenstand und Tageslänge.' },
  { id: 'q4', answer: 'sun-earth-moon', hint: 'Tipp: Bei einer Mondfinsternis steht die Erde im Schattenweg zwischen Sonne und Mond.', correct: 'Richtig: Sonne – Erde – Mond.' },
  { id: 'q5', answer: 'B', hint: 'Tipp: Suche die Position innerhalb des schmalen, dunklen Kernschatten-Bands.', correct: 'Richtig: Position B liegt im Kernschatten.' },
  {
    id: 'q6',
    hint: 'Tipp: Nenne die geneigte Erdachse und erkläre, was mit Sonnenstand oder Tageslänge passiert.',
    correct: 'Gut erklärt: Achsenneigung und Tageslänge hängen zusammen.',
    evaluate: (value) => {
      const text = value.toLocaleLowerCase('de');
      const axis = /(erdachse|achse|achsenneigung)/.test(text) && /(neig|schräg|kippt)/.test(text);
      const daylight = /(tag|länger|sonnenstand|höher|horizont|sonne)/.test(text);
      return axis && daylight;
    },
  },
  {
    id: 'q7',
    hint: 'Tipp: Nenne die Atmosphäre und beschreibe, welcher Lichtanteil gestreut wird und welcher den Mond erreicht.',
    correct: 'Richtig beschrieben: Gebrochenes rötliches Sonnenlicht erreicht den Mond im Erdschatten.',
    evaluate: (value) => /(atmosph|luftschicht)/i.test(value) && /(rot|rötlich)/i.test(value) && /(licht|strahl|sonne)/i.test(value),
  },
  { id: 'q8', answer: 'full', hint: 'Tipp: Wenn der Mond der Sonne von der Erde aus gegenübersteht, ist seine sichtbare Seite beleuchtet.', correct: 'Richtig: Diese Stellung entspricht Vollmond. Eine Finsternis gibt es nur, wenn die Körper auch nahe der Bahnebene ausgerichtet sind.' },
];
const quizAttempts = new Map(quizQuestions.map((question) => [question.id, 0]));

function readAnswer(question) {
  const control = $(`[name="${question.id}"]`);
  if (!control) return '';
  if (control.type === 'radio') return $(`[name="${question.id}"]:checked`)?.value || '';
  return control.value.trim();
}

function isCorrect(question, answer) {
  if (question.evaluate) return question.evaluate(answer);
  return answer === question.answer;
}

$('#quiz-form').addEventListener('submit', (event) => {
  event.preventDefault();
  let answered = 0;
  let correct = 0;
  const topicSummary = new Map();

  quizQuestions.forEach((question) => {
    const fieldset = $(`[data-question="${question.id}"]`);
    const topic = fieldset.dataset.topic;
    const answer = readAnswer(question);
    const feedback = $(`#f${question.id.slice(1)}`);
    const solution = fieldset.querySelector('.answer-solution');
    const topicResult = topicSummary.get(topic) || { answered: 0, correct: 0, open: 0 };

    if (!answer) {
      topicResult.open += 1;
      feedback.textContent = 'Noch offen – diese Aufgabe wird nicht als falsch gewertet.';
      feedback.className = 'answer-feedback is-open';
      topicSummary.set(topic, topicResult);
      return;
    }

    answered += 1;
    topicResult.answered += 1;
    const questionCorrect = isCorrect(question, answer);
    if (questionCorrect) {
      correct += 1;
      topicResult.correct += 1;
      feedback.textContent = question.correct;
      feedback.className = 'answer-feedback is-correct';
    } else {
      const attempts = quizAttempts.get(question.id) + 1;
      quizAttempts.set(question.id, attempts);
      feedback.textContent = attempts === 1
        ? question.hint
        : `${question.hint} Du kannst die Beispiel-Lösung jetzt aufklappen.`;
      feedback.className = 'answer-feedback is-hint';
      if (attempts >= 2) solution.hidden = false;
    }
    topicSummary.set(topic, topicResult);
  });

  const openCount = quizQuestions.length - answered;
  $('#quiz-result').textContent = `${correct} von ${answered} beantworteten Aufgaben richtig. ${openCount ? `${openCount} ${openCount === 1 ? 'Aufgabe ist' : 'Aufgaben sind'} noch offen und wurden nicht als falsch gewertet.` : 'Alle Aufgaben sind beantwortet.'}`;
  const topicLinks = {
    'Tag und Nacht': '#tag-nacht',
    Mondphasen: '#mondphasen',
    Jahreszeiten: '#jahreszeiten',
    Finsternisse: '#finsternisse',
    Blutmond: '#finsternisse',
  };
  const topicOrder = ['Tag und Nacht', 'Mondphasen', 'Jahreszeiten', 'Finsternisse', 'Blutmond'];
  $('#topic-results').innerHTML = '<h3>Dein Themenüberblick</h3>' + topicOrder.map((topic) => {
    const result = topicSummary.get(topic) || { answered: 0, correct: 0, open: 0 };
    const label = result.answered
      ? `${result.correct} von ${result.answered} beantwortet richtig${result.open ? ` · ${result.open} offen` : ''}`
      : 'Noch offen';
    return `<p><a href="${topicLinks[topic]}">${topic} →</a><span>${label}</span></p>`;
  }).join('');
});

$('#quiz-form').addEventListener('reset', () => {
  window.setTimeout(() => {
    quizAttempts.forEach((_, id) => quizAttempts.set(id, 0));
    $$('.answer-feedback').forEach((feedback) => {
      feedback.textContent = '';
      feedback.className = 'answer-feedback';
    });
    $$('.answer-solution').forEach((solution) => { solution.hidden = true; });
    $('#quiz-result').textContent = '';
    $('#topic-results').textContent = '';
  }, 0);
});

$('#print-button').addEventListener('click', () => window.print());

const progressTrack = $('.progress-track');
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0;
  $('#progress-fill').style.width = `${progress}%`;
  progressTrack.setAttribute('aria-valuenow', progress);
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();

if ('IntersectionObserver' in window) {
  const sections = $$('.lesson[id], .quiz[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.chapter-nav a').forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-20% 0px -65% 0px' });
  sections.forEach((section) => observer.observe(section));
}
