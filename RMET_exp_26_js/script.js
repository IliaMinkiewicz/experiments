// Configurable Endpoint for Data Upload
// Paste your Google Apps Script Web App URL here to enable automatic saving to GitHub/Google Sheets.
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbwviQ7b7q3aNKkAOv4eB05MndR2SkovDejoO-9qDImGDIoynvabVURZVb8vzJooxm-d/exec";

// State Variables
let participantId = "";
let sessionNum = 1;
let shuffledStimuli = [];
let trials = [];
let trialPointer = 0;

// Original Stimuli List (144 items)
const allStimuli = [];
for (let i = 1; i <= 144; i++) {
  allStimuli.push(`Figure S${i}.png`);
}

// --- Deterministic Seedable PRNG (Mulberry32 + FNV-1a Hash) ---
function fnv1a(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function seedShuffle(array, seedString) {
  const seed = fnv1a(seedString);
  const rand = mulberry32(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
// -------------------------------------------------------------

// Start Experiment
function startExperiment() {
  const idInput = document.getElementById("participant-id");
  const sessionSelect = document.getElementById("session-num");

  participantId = idInput.value.trim();
  sessionNum = parseInt(sessionSelect.value);

  if (!participantId) {
    alert("Пожалуйста, введите корректный ID.");
    return;
  }

  // 1. Shuffling based on seed (deterministic for participantId)
  shuffledStimuli = seedShuffle(allStimuli, participantId);

  // 2. Generate trial sequences
  trials = [];

  // If Session 1, inject 3 practice trials at the beginning
  if (sessionNum === 1) {
    // Select 3 practice stimuli from the remaining 120 (indices 24, 25, 26 in shuffled array)
    const practiceStim = shuffledStimuli.slice(24, 27);
    practiceStim.forEach(stim => {
      const globalIdx = allStimuli.indexOf(stim);
      trials.push({
        stim_file: stim,
        global_idx: globalIdx,
        is_practice: true,
        response_detailed: "NNNN", // Prefilled as requested
        response_short: "NNNN"     // Prefilled as requested
      });
    });

    // Show note about practice on the instruction screen
    document.getElementById("practice-note").style.display = "block";
  } else {
    document.getElementById("practice-note").style.display = "none";
  }

  // Add the 24 main trials of the session
  const sessionStartIdx = (sessionNum - 1) * 24;
  const sessionEndIdx = sessionStartIdx + 24;
  const mainStim = shuffledStimuli.slice(sessionStartIdx, sessionEndIdx);

  mainStim.forEach(stim => {
    const globalIdx = allStimuli.indexOf(stim);
    trials.push({
      stim_file: stim,
      global_idx: globalIdx,
      is_practice: false,
      response_detailed: "",
      response_short: ""
    });
  });

  trialPointer = 0;

  // Switch to Instructions screen
  showScreen("screen-instruction");
}

// Switch between screens
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

// Start Trials Phase
function goToTrial() {
  showScreen("screen-trial");
  renderTrial();
}

// Render Trial content
function renderTrial() {
  const trial = trials[trialPointer];

  // Update header and progress
  const progressContainer = document.getElementById("trial-progress");
  const counterElement = document.getElementById("trial-counter");
  const practiceIndicator = document.getElementById("practice-indicator");

  if (trial.is_practice) {
    practiceIndicator.style.display = "inline-block";
    counterElement.textContent = `Тренировка: Проба ${trialPointer + 1} из 3`;
    const pct = ((trialPointer + 1) / 3) * 100;
    progressContainer.style.width = `${pct}%`;
  } else {
    practiceIndicator.style.display = "none";
    const mainTrialIndex = sessionNum === 1 ? (trialPointer - 2) : (trialPointer + 1);
    counterElement.textContent = `Проба ${mainTrialIndex} из 24`;
    const pct = (mainTrialIndex / 24) * 100;
    progressContainer.style.width = `${pct}%`;
  }

  // Set image source
  document.getElementById("stimulus-img").src = `stimuli/${trial.stim_file}`;

  // Set text box values
  const textLong = document.getElementById("textbox-long");
  const textShort = document.getElementById("textbox-short");

  textLong.value = trial.response_detailed;
  textShort.value = trial.response_short;

  // Configure Back button visibility
  const btnBack = document.getElementById("btn-back");
  if (trialPointer > 0) {
    btnBack.classList.remove("hidden");
  } else {
    btnBack.classList.add("hidden");
  }
}

// Next Trial Handler
function handleNext() {
  const textLong = document.getElementById("textbox-long");
  const textShort = document.getElementById("textbox-short");

  // Save current responses
  trials[trialPointer].response_detailed = textLong.value.trim();
  trials[trialPointer].response_short = textShort.value.trim();

  trialPointer++;

  if (trialPointer < trials.length) {
    renderTrial();
  } else {
    endExperiment();
  }
}

// Back Trial Handler
function handleBack() {
  if (trialPointer > 0) {
    const textLong = document.getElementById("textbox-long");
    const textShort = document.getElementById("textbox-short");

    // Save current values before going back
    trials[trialPointer].response_detailed = textLong.value.trim();
    trials[trialPointer].response_short = textShort.value.trim();

    trialPointer--;
    renderTrial();
  }
}

// Toggle help modal
function toggleHelpModal(show) {
  const overlay = document.getElementById("help-overlay");
  if (show) {
    overlay.classList.add("active");
  } else {
    overlay.classList.remove("active");
  }
}

// End Experiment Phase
function endExperiment() {
  showScreen("screen-end");

  // Fill Results Preview table
  const tbody = document.getElementById("preview-body");
  tbody.innerHTML = "";

  trials.forEach((trial, index) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";

    const tdSeq = document.createElement("td");
    tdSeq.style.padding = "6px 8px";
    if (trial.is_practice) {
      tdSeq.innerHTML = `<span class="practice-badge" style="font-size: 0.65rem; padding: 2px 6px;">Пр ${index + 1}</span>`;
    } else {
      tdSeq.textContent = sessionNum === 1 ? index - 2 : index + 1;
    }

    const tdStim = document.createElement("td");
    tdStim.style.padding = "6px 8px";
    tdStim.textContent = trial.stim_file;

    const tdLong = document.createElement("td");
    tdLong.style.padding = "6px 8px";
    tdLong.textContent = truncateString(trial.response_detailed, 20);

    const tdShort = document.createElement("td");
    tdShort.style.padding = "6px 8px";
    tdShort.textContent = truncateString(trial.response_short, 20);

    tr.appendChild(tdSeq);
    tr.appendChild(tdStim);
    tr.appendChild(tdLong);
    tr.appendChild(tdShort);
    tbody.appendChild(tr);
  });

  document.getElementById("preview-container").style.display = "block";

  // Auto Save & Upload
  saveData();
}

function truncateString(str, num) {
  if (!str) return "";
  if (str.length <= num) return str;
  return str.slice(0, num) + "...";
}

// Generate CSV string
function generateCSV() {
  let csvContent = "session,trial_sequence,is_practice,global_stim_idx,stim_file,response_detailed,response_short\n";

  trials.forEach((trial, index) => {
    const seqNum = trial.is_practice ? (index + 1) : (sessionNum === 1 ? index - 2 : index + 1);

    const escapeCSV = (str) => {
      if (!str) return "";
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    csvContent += `${sessionNum},${seqNum},${trial.is_practice ? 1 : 0},${trial.global_idx},${trial.stim_file},${escapeCSV(trial.response_detailed)},${escapeCSV(trial.response_short)}\n`;
  });

  return csvContent;
}

// Download CSV file locally
function downloadCSV() {
  const csvContent = generateCSV();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `summary_sub-${participantId}_ses-${sessionNum}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Handle Auto-saving (Local Download + Cloud Upload if URL configured)
function saveData() {
  const csvContent = generateCSV();

  // 1. Trigger local download automatically
  downloadCSV();

  // 2. Upload to Cloud if URL is provided
  const uploadStatus = document.getElementById("upload-status");
  if (UPLOAD_URL) {
    uploadStatus.textContent = "Сохранение в облако (GitHub)...";
    uploadStatus.className = "status-msg info";

    // We send payload as JSON
    const payload = {
      participantId: participantId,
      sessionNum: sessionNum,
      csvData: csvContent,
      timestamp: new Date().toISOString()
    };

    fetch(UPLOAD_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    })
      .then(() => {
        // В режиме no-cors браузер не дает прочитать ответ сервера,
        // но запрос успешно уходит и выполняется.
        uploadStatus.textContent = "Данные отправлены на GitHub (проверьте репозиторий)!";
        uploadStatus.className = "status-msg success";
      })
      .catch(err => {
        console.error("Upload error:", err);
        uploadStatus.textContent = "Ошибка при загрузке в облако: " + err.message + ". CSV скачан на ваше устройство.";
        uploadStatus.className = "status-msg error";
      });
  } else {
    uploadStatus.textContent = "Автоматическое сохранение в облако не настроено. CSV файл сохранен на вашем компьютере.";
    uploadStatus.className = "status-msg info";
  }
}

// Reset state to run again
function resetToStart() {
  document.getElementById("participant-id").value = "";
  document.getElementById("session-num").value = "1";
  document.getElementById("preview-container").style.display = "none";
  showScreen("screen-setup");
}
