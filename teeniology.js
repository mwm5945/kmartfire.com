const TEENIOLOGY_STORAGE_KEY = "teeniology-enabled";

(function attachTeeniology(global) {
  const memoryStorage = new Map();
  const CARDINAL_WORDS = new Map([
    ["zero", 0],
    ["one", 1],
    ["two", 2],
    ["three", 3],
    ["four", 4],
    ["five", 5],
    ["six", 6],
    ["seven", 7],
    ["eight", 8],
    ["nine", 9],
    ["ten", 10],
    ["eleven", 11],
    ["twelve", 12],
    ["thirteen", 13],
    ["fourteen", 14],
    ["fifteen", 15],
    ["sixteen", 16],
    ["seventeen", 17],
    ["eighteen", 18],
    ["nineteen", 19],
    ["twenty", 20],
    ["thirty", 30],
    ["forty", 40],
    ["fifty", 50],
    ["sixty", 60],
    ["seventy", 70],
    ["eighty", 80],
    ["ninety", 90]
  ]);

  const ORDINAL_WORDS = new Map([
    ["first", 1],
    ["second", 2],
    ["third", 3],
    ["fourth", 4],
    ["fifth", 5],
    ["sixth", 6],
    ["seventh", 7],
    ["eighth", 8],
    ["ninth", 9],
    ["tenth", 10],
    ["eleventh", 11],
    ["twelfth", 12],
    ["thirteenth", 13],
    ["fourteenth", 14],
    ["fifteenth", 15],
    ["sixteenth", 16],
    ["seventeenth", 17],
    ["eighteenth", 18],
    ["nineteenth", 19],
    ["twentieth", 20],
    ["thirtieth", 30],
    ["fortieth", 40],
    ["fiftieth", 50],
    ["sixtieth", 60],
    ["seventieth", 70],
    ["eightieth", 80],
    ["ninetieth", 90]
  ]);

  const SCALE_WORDS = new Map([
    ["hundred", 100],
    ["thousand", 1000],
    ["million", 1000000]
  ]);

  const ALL_NUMBER_WORDS = [
    ...CARDINAL_WORDS.keys(),
    ...ORDINAL_WORDS.keys(),
    ...SCALE_WORDS.keys(),
    "and"
  ];

  const WORD_PATTERN = ALL_NUMBER_WORDS.join("|");
  const NUMBER_WORD_PATTERN = new RegExp(
    `\\b(?:${WORD_PATTERN})(?:[-\\s]+(?:${WORD_PATTERN}))*\\b`,
    "gi"
  );
  const TIME_PATTERN = /\b(\d{1,2})(?::(\d{2}))?\s*([ap])?\.?\s*(m\.?)?\b/gi;
  const NUMERIC_ORDINAL_PATTERN = /\b(\d[\d,]*)(st|nd|rd|th)\b/gi;
  const NUMERIC_PATTERN = /\b\d[\d,]*(?:\.\d+)?\b/g;

  function capitalizeReplacement(source, replacement) {
    const firstLetter = source.match(/[A-Za-z]/);
    if (!firstLetter) {
      return replacement;
    }

    const index = firstLetter.index;
    if (source[index] !== source[index].toUpperCase()) {
      return replacement;
    }

    return replacement.replace(/[a-z]/, (character) => character.toUpperCase());
  }

  function formatBelowHundred(value) {
    if (value < 10) {
      return String(value);
    }

    if (value < 20) {
      return value === 10 ? "teenie" : `teenie ${value - 10}`;
    }

    const tensWord = {
      20: "stinky",
      30: "stinky teenie",
      40: "stinky stinky",
      50: "stunk",
      60: "stunk teenie",
      70: "stunk stinky",
      80: "stunk stinky teenie",
      90: "stunk stinky stinky"
    }[Math.floor(value / 10) * 10];
    const ones = value % 10;

    return ones === 0 ? tensWord : `${tensWord} ${ones}`;
  }

  function formatInteger(value) {
    if (value === 0) {
      return "0";
    }

    if (value < 0) {
      return `minus ${formatInteger(Math.abs(value))}`;
    }

    if (value < 100) {
      return formatBelowHundred(value);
    }

    const scales = [
      [1000000, "stunky wunky"],
      [100000, "teenie teenie stinky winky"],
      [10000, "teenie stinky winky"],
      [1000, "stinky winky"],
      [100, "teenie weenie"]
    ];
    const parts = [];
    let remainder = value;

    for (const [scaleValue, scaleName] of scales) {
      if (remainder < scaleValue) {
        continue;
      }

      const count = Math.floor(remainder / scaleValue);
      parts.push(count === 1 ? scaleName : `${formatInteger(count)} ${scaleName}`);
      remainder %= scaleValue;
    }

    if (remainder > 0) {
      parts.push(formatBelowHundred(remainder));
    }

    return parts.join(" ");
  }

  function formatNumberString(value) {
    const sanitized = value.replace(/,/g, "");
    if (sanitized.includes(".")) {
      const [whole, fraction] = sanitized.split(".");
      return `${formatInteger(Number(whole))} point ${fraction.split("").join(" ")}`;
    }

    return formatInteger(Number(sanitized));
  }

  function parseWordNumber(text) {
    const tokens = text.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
    let total = 0;
    let current = 0;
    let sawNumber = false;

    for (const token of tokens) {
      if (token === "and") {
        continue;
      }

      if (CARDINAL_WORDS.has(token)) {
        current += CARDINAL_WORDS.get(token);
        sawNumber = true;
        continue;
      }

      if (ORDINAL_WORDS.has(token)) {
        current += ORDINAL_WORDS.get(token);
        sawNumber = true;
        continue;
      }

      if (token === "hundred") {
        current = Math.max(current, 1) * 100;
        sawNumber = true;
        continue;
      }

      if (token === "thousand" || token === "million") {
        total += Math.max(current, 1) * SCALE_WORDS.get(token);
        current = 0;
        sawNumber = true;
        continue;
      }

      return null;
    }

    return sawNumber ? total + current : null;
  }

  function normalizeHour(hour) {
    if (hour === 0) {
      return 12;
    }

    if (hour > 12) {
      return hour % 12 || 12;
    }

    return hour;
  }

  function formatTeenieTime(hour, minute) {
    const normalizedHour = normalizeHour(hour);
    const nextHour = normalizedHour === 12 ? 1 : normalizedHour + 1;

    if (minute === 50) {
      return `teenie till ${formatInteger(nextHour)}`;
    }

    if (minute < 50) {
      return `${formatInteger(50 - minute)} till teenie till ${formatInteger(nextHour)}`;
    }

    return `${formatInteger(minute - 50)} past teenie till ${formatInteger(nextHour)}`;
  }

  function replaceStandaloneScales(text) {
    const scaleMapping = {
      hundred: "teenie weenie",
      thousand: "stinky winky",
      million: "stunky wunky",
    };

    return text.replace(/\b(hundred|thousand|million)s?\b/gi, (match) => {
      const word = match.toLowerCase().replace(/s$/, "");
      const replacement = scaleMapping[word];
      const isPlural = match.toLowerCase().endsWith("s");

      if (!isPlural) return capitalizeReplacement(match, replacement);

      const pluralReplacement =
        replacement.replace(/y$/, "ies") || `${replacement}s`;
      return capitalizeReplacement(match, pluralReplacement);
    });
  }

  function replaceTimes(text) {
    return text.replace(TIME_PATTERN, (match, hour, minute, meridiem, meridiemSuffix) => {
      const compact = match.replace(/\s+/g, "");
      const isTime =
        compact.includes(":") ||
        (meridiem && meridiemSuffix) ||
        /^[0-9]{1,2}[ap]\.?m\.?$/i.test(compact);

      if (!isTime) {
        return match;
      }

      return formatTeenieTime(Number(hour), Number(minute ?? 0));
    });
  }

  function replaceWordNumbers(text) {
    return text.replace(NUMBER_WORD_PATTERN, (match) => {
      const parsed = parseWordNumber(match);
      if (parsed === null) {
        return match;
      }

      return capitalizeReplacement(match, formatInteger(parsed));
    });
  }

  function replaceNumericOrdinals(text) {
    return text.replace(NUMERIC_ORDINAL_PATTERN, (_, value, suffix) => {
      return `${formatNumberString(value)}${suffix}`;
    });
  }

  function replaceNumericValues(text) {
    return text.replace(NUMERIC_PATTERN, (match) => formatNumberString(match));
  }

  function formatText(text) {
    return replaceNumericValues(
      replaceNumericOrdinals(
        replaceWordNumbers(
          replaceStandaloneScales(
            replaceTimes(text)
          )
        )
      )
    );
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (
          !parent ||
          parent.closest("script, style, noscript, textarea, [data-teenie-dynamic], [data-teenie-skip]")
        ) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];

    while (walker.nextNode()) {
      nodes.push({
        node: walker.currentNode,
        original: walker.currentNode.textContent
      });
    }

    return nodes;
  }

  function readStoredMode() {
    try {
      return global.localStorage.getItem(TEENIOLOGY_STORAGE_KEY) === "true";
    } catch (error) {
      return memoryStorage.get(TEENIOLOGY_STORAGE_KEY) === true;
    }
  }

  function writeStoredMode(value) {
    try {
      global.localStorage.setItem(TEENIOLOGY_STORAGE_KEY, String(value));
      return;
    } catch (error) {
      memoryStorage.set(TEENIOLOGY_STORAGE_KEY, Boolean(value));
    }
  }

  function createController({ toggleSelector, root = document.body, onToggle } = {}) {
    const toggle = toggleSelector ? document.querySelector(toggleSelector) : null;
    const trackedNodes = collectTextNodes(root);
    let enabled = readStoredMode();

    function applyTextMode() {
      for (const item of trackedNodes) {
        item.node.textContent = enabled ? formatText(item.original) : item.original;
      }
    }

    function setEnabled(nextValue) {
      enabled = Boolean(nextValue);
      writeStoredMode(enabled);
      if (toggle) {
        toggle.checked = enabled;
      }
      applyTextMode();
      if (typeof onToggle === "function") {
        onToggle(enabled);
      }
    }

    if (toggle) {
      toggle.checked = enabled;
      toggle.addEventListener("change", (event) => {
        setEnabled(event.currentTarget.checked);
      });
    }

    applyTextMode();

    return {
      formatInteger,
      formatNumberString,
      formatTeenieTime,
      formatText,
      isEnabled() {
        return enabled;
      },
      setEnabled
    };
  }

  global.Teeniology = {
    createController,
    formatInteger,
    formatNumberString,
    formatTeenieTime,
    formatText
  };
})(window);
