const FIRE_START_ISO = "1982-06-21T12:00:00-04:00";
const BURN_DELAY_MS = 30000;
const BURN_TRANSITION_MS = 2800;

function getElapsedParts(startDate, now) {
  const start = new Date(startDate);
  const end = new Date(now);

  let years = end.getFullYear() - start.getFullYear();
  const yearBoundary = new Date(start);
  yearBoundary.setFullYear(start.getFullYear() + years);

  if (yearBoundary > end) {
    years -= 1;
    yearBoundary.setFullYear(start.getFullYear() + years);
  }

  const remainderMs = end.getTime() - yearBoundary.getTime();
  const totalSeconds = Math.max(0, Math.floor(remainderMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { years, days, hours, minutes, seconds };
}

function renderCounter() {
  const parts = getElapsedParts(FIRE_START_ISO, Date.now());
  for (const [key, value] of Object.entries(parts)) {
    const node = document.getElementById(key);
    if (node) {
      node.textContent = value.toLocaleString();
    }
  }
}

function startFireTornado() {
  const tornado = document.getElementById("fire-tornado");
  if (!tornado) {
    return;
  }

  function moveTornado() {
    if (document.body.classList.contains("page-burned")) {
      return;
    }

    const maxX = Math.max(0, window.innerWidth - 160);
    const maxY = Math.max(120, window.innerHeight - 260);
    const nextX = Math.random() * maxX;
    const nextY = 60 + Math.random() * Math.max(40, maxY - 60);
    tornado.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;

    const delay = 1800 + Math.random() * 2600;
    window.setTimeout(moveTornado, delay);
  }

  moveTornado();
}

function startBurnSequence() {
  window.setTimeout(() => {
    document.body.classList.add("page-burning");

    window.setTimeout(() => {
      document.body.classList.add("page-burned");
    }, BURN_TRANSITION_MS);
  }, BURN_DELAY_MS);
}

renderCounter();
window.setInterval(renderCounter, 1000);
startFireTornado();
startBurnSequence();
