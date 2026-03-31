const reviewButton = document.getElementById("reviewButton");
const statusMessage = document.getElementById("statusMessage");
const summaryGrid = document.getElementById("summaryGrid");
const emptyState = document.getElementById("emptyState");
const rawBlock = document.getElementById("rawBlock");
const rawFeedback = document.getElementById("rawFeedback");
const ratingBox = document.getElementById("ratingBox");
const ratingValue = document.getElementById("ratingValue");

const sectionConfig = {
  bugs: {
    card: document.getElementById("bugsCard"),
    list: document.getElementById("bugsList"),
    count: document.getElementById("bugsCount"),
  },
  optimization: {
    card: document.getElementById("optimizationCard"),
    list: document.getElementById("optimizationList"),
    count: document.getElementById("optimizationCount"),
  },
  quality: {
    card: document.getElementById("qualityCard"),
    list: document.getElementById("qualityList"),
    count: document.getElementById("qualityCount"),
  },
  security: {
    card: document.getElementById("securityCard"),
    list: document.getElementById("securityList"),
    count: document.getElementById("securityCount"),
  },
};

function setStatus(message, tone) {
  statusMessage.textContent = message;
  statusMessage.className = `status ${tone} show`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeLine(line) {
  return line
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^:+/, "")
    .trim();
}

function detectSection(line) {
  const text = line.toLowerCase();
  if (text.includes("bug") || text.includes("error")) return "bugs";
  if (text.includes("optimization") || text.includes("performance")) {
    return "optimization";
  }
  if (
    text.includes("quality") ||
    text.includes("readability") ||
    text.includes("maintain")
  ) {
    return "quality";
  }
  if (text.includes("security")) return "security";
  return null;
}

function parseFeedback(feedback) {
  const lines = feedback
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = {
    bugs: [],
    optimization: [],
    quality: [],
    security: [],
  };

  let rating = null;
  let currentSection = null;

  for (const line of lines) {
    const ratingMatch = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    if (ratingMatch) {
      rating = ratingMatch[1];
    }

    const section = detectSection(line);
    if (section) {
      currentSection = section;
      continue;
    }

    if (!currentSection) {
      continue;
    }

    const cleaned = normalizeLine(line);
    if (cleaned) {
      sections[currentSection].push(cleaned);
    }
  }

  return { sections, rating };
}

function renderList(listElement, items) {
  listElement.innerHTML = items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function resetFeedbackView() {
  ratingBox.hidden = true;
  summaryGrid.classList.remove("show");
  emptyState.style.display = "block";
  rawBlock.classList.remove("show");

  Object.values(sectionConfig).forEach((config) => {
    config.card.classList.remove("show");
    config.list.innerHTML = "";
    config.count.textContent = "0";
  });
}

function renderFeedback(feedback) {
  const parsed = parseFeedback(feedback);
  let visibleCards = 0;

  Object.entries(sectionConfig).forEach(([key, config]) => {
    const items = parsed.sections[key];
    config.count.textContent = items.length;

    if (items.length > 0) {
      renderList(config.list, items);
      config.card.classList.add("show");
      visibleCards += 1;
    } else {
      config.list.innerHTML = "";
      config.card.classList.remove("show");
    }
  });

  if (parsed.rating) {
    ratingValue.textContent = `${parsed.rating}/10`;
    ratingBox.hidden = false;
  } else {
    ratingValue.textContent = "-";
    ratingBox.hidden = true;
  }

  summaryGrid.classList.toggle("show", visibleCards > 0);
  emptyState.style.display = visibleCards > 0 ? "none" : "block";
  rawFeedback.textContent = feedback;
  rawBlock.classList.add("show");

  if (visibleCards > 0) {
    setStatus("Review completed. Structured feedback is ready below.", "info");
  } else {
    setStatus(
      "Review completed. Showing the raw response because the output was not structured enough to group automatically.",
      "info"
    );
  }
}

async function review() {
  const code = document.getElementById("code").value.trim();
  const language = document.getElementById("language").value;

  if (!code) {
    setStatus("Paste some code before running the review.", "error");
    return;
  }

  reviewButton.disabled = true;
  reviewButton.textContent = "Reviewing...";
  resetFeedbackView();
  setStatus("Sending the code to the backend and waiting for feedback...", "info");

  try {
    const response = await fetch("http://127.0.0.1:8000/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "The backend returned an unknown error.");
    }

    renderFeedback(data.feedback || "");
  } catch (error) {
    setStatus(error.message || "Unable to fetch review feedback.", "error");
    rawFeedback.textContent = "";
    rawBlock.classList.remove("show");
  } finally {
    reviewButton.disabled = false;
    reviewButton.textContent = "Run Review";
  }
}

reviewButton.addEventListener("click", review);
