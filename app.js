const FIRE_START_ISO = "1982-06-21T12:00:00-04:00";
const BURN_DELAY_MS = 30000;
const BURN_TRANSITION_MS = 2800;
let teeniologyController;
let refreshQuote = () => {};
const QUOTES = [
  "\"i don't remember much about it. i wasn't there\" -- C. D.",
  "\"It started at 6am\" -- K. S.",
  "\"No, it started at noon\" -- T. S.",
  "\"wait...it did?\" -- R. M.",
  "\"We new a guy that worked there--I heard he disappeared\" -- Anonymous",
  "\"No walls. No sprinkers. And a TNT section\" -- R. M.",
  "\"There wasn't a fire tornado--there was a fire STORM\" -- K. S.",
  "\"I nearly got sucked off the truck into the fire! It was windy!\" -- K. S.",
  "\"I was not concieved on the same night as the Kmart Warehouse Fire\" -- C. D."
];

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
      node.textContent = teeniologyController?.isEnabled()
        ? teeniologyController.formatInteger(value)
        : value.toLocaleString();
    }
  }
}

function startFireStorm() {
  const storm = document.getElementById("fire-storm");
  if (!storm) {
    return;
  }

  function moveStorm() {
    if (document.body.classList.contains("page-burned")) {
      return;
    }

    const maxX = Math.max(0, window.innerWidth - 340);
    const maxY = Math.max(120, window.innerHeight - 250);
    const nextX = Math.random() * maxX;
    const nextY = 60 + Math.random() * Math.max(40, maxY - 60);
    storm.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;

    const delay = 1200 + Math.random() * 1800;
    window.setTimeout(moveStorm, delay);
  }


  moveStorm();
}

function startBurnSequence() {
  window.setTimeout(() => {
    document.body.classList.add("page-burning");

    window.setTimeout(() => {
      document.body.classList.add("page-burned");
    }, BURN_TRANSITION_MS);
  }, BURN_DELAY_MS);
}

function startQuoteCarousel() {
  const carousel = document.querySelector("[data-quote-carousel]");
  const textNode = document.getElementById("quote-text");
  const statusNode = document.getElementById("quote-status");
  const prevButton = document.querySelector("[data-quote-prev]");
  const nextButton = document.querySelector("[data-quote-next]");

  if (!carousel || !textNode || !statusNode || !prevButton || !nextButton) {
    return;
  }

  let index = 0;

  function renderQuote() {
    textNode.textContent = teeniologyController?.isEnabled()
      ? teeniologyController.formatText(QUOTES[index])
      : QUOTES[index];
    statusNode.textContent = `${index + 1} / ${QUOTES.length}`;
  }

  refreshQuote = renderQuote;

  prevButton.addEventListener("click", () => {
    index = (index - 1 + QUOTES.length) % QUOTES.length;
    renderQuote();
  });

  nextButton.addEventListener("click", () => {
    index = (index + 1) % QUOTES.length;
    renderQuote();
  });

  renderQuote();
}

if (window.Teeniology) {
  teeniologyController = window.Teeniology.createController({
    toggleSelector: "#teeniology-toggle",
    onToggle() {
      renderCounter();
      refreshQuote();
    }
  });
}

renderCounter();
window.setInterval(renderCounter, 1000);
startQuoteCarousel();
startFireStorm();
startBurnSequence();
