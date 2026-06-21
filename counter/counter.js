const FIRE_START_ISO = "1982-06-21T12:00:00-04:00";

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

renderCounter();
window.setInterval(renderCounter, 1000);
