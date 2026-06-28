// Configurable Endpoint for Data Upload
// Paste your Google Apps Script Web App URL here to enable automatic saving to GitHub/Google Sheets.
const UPLOAD_URL = "https://script.google.com/macros/s/AKfycbwviQ7b7q3aNKkAOv4eB05MndR2SkovDejoO-9qDImGDIoynvabVURZVb8vzJooxm-d/exec";
const SHARED_SECRET = "RMET_SECURE_2026"; // Must match SHARED_SECRET in google_apps_script.js

// State Variables
let participantId = "";
let sessionNum = 1;
let shuffledStimuli = [];
let trials = [];
let trialPointer = 0;
let gender = "";
let age = "";
let trialOnset = 0;
let sessionTimestampISO = "";

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

// --- Demographics and Setup Form Controls ---
function updateSetupFormVisibility() {
  const sessionSelect = document.getElementById("session-num");
  const demoGroup = document.getElementById("demographics-group");
  const genderSelect = document.getElementById("participant-gender");
  const ageInput = document.getElementById("participant-age");
  const idInput = document.getElementById("participant-id");

  const pId = idInput.value.trim();
  const hasLocalDemo = pId && localStorage.getItem('gender_' + pId) && localStorage.getItem('age_' + pId);

  if (sessionSelect.value === "1" || !hasLocalDemo) {
    demoGroup.style.display = "block";
    genderSelect.required = true;
    ageInput.required = true;
  } else {
    demoGroup.style.display = "none";
    genderSelect.required = false;
    ageInput.required = false;
  }
}

// Debounce helper to prevent excessive API calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

let isCheckingSessions = false;

// Scan localStorage and query GitHub (via GAS proxy) to check which sessions are already completed
function checkCompletedSessions() {
  const idInput = document.getElementById("participant-id");
  const pId = idInput.value.trim();
  const setupStatus = document.getElementById("setup-status");
  const sessionSelect = document.getElementById("session-num");
  const startBtn = document.getElementById("btn-start");

  if (!pId) {
    setupStatus.style.display = "none";
    startBtn.disabled = false;
    // Enable all sessions
    Array.from(sessionSelect.options).forEach(opt => {
      opt.disabled = false;
      opt.text = `Сессия ${opt.value}`;
    });
    return;
  }

  // 1. Check local storage first
  const localKey = 'completed_sessions_' + pId;
  const localSessions = JSON.parse(localStorage.getItem(localKey) || "[]");
  updateDropdownOptions(localSessions);

  if (!UPLOAD_URL || isCheckingSessions) return;

  isCheckingSessions = true;
  setupStatus.textContent = "Проверка пройденных сессий в облаке...";
  setupStatus.className = "status-msg info";
  setupStatus.style.display = "block";
  startBtn.disabled = true;

  const url = `${UPLOAD_URL}?action=check_sessions&participantId=${encodeURIComponent(pId)}&secret=${encodeURIComponent(SHARED_SECRET)}`;
  fetch(url, {
    method: 'GET'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      isCheckingSessions = false;
      startBtn.disabled = false;
      if (data.status === "success" && Array.isArray(data.completedSessions)) {
        // Merge with local storage list and persist
        const merged = Array.from(new Set([...localSessions, ...data.completedSessions]));
        localStorage.setItem(localKey, JSON.stringify(merged));
        
        updateDropdownOptions(merged);
        
        if (merged.length > 0) {
          setupStatus.textContent = `Пройденные сессии: ${merged.join(", ")}.`;
          setupStatus.className = "status-msg success";
        } else {
          setupStatus.style.display = "none";
        }
      } else {
        setupStatus.style.display = "none";
      }
    })
    .catch(err => {
      console.warn("Could not check completed sessions via API (CORS or network error). Relying on local storage.", err);
      isCheckingSessions = false;
      startBtn.disabled = false;
      
      if (localSessions.length > 0) {
        setupStatus.textContent = `Пройденные сессии (локально): ${localSessions.join(", ")}.`;
        setupStatus.className = "status-msg success";
      } else {
        setupStatus.style.display = "none";
      }
    });
}

function updateDropdownOptions(completedList) {
  const sessionSelect = document.getElementById("session-num");
  const setupStatus = document.getElementById("setup-status");
  const startBtn = document.getElementById("btn-start");
  let firstAvailable = null;

  Array.from(sessionSelect.options).forEach(opt => {
    const val = parseInt(opt.value);
    if (completedList.includes(val)) {
      opt.disabled = true;
      opt.text = `Сессия ${opt.value} (Пройдена)`;
    } else {
      opt.disabled = false;
      opt.text = `Сессия ${opt.value}`;
      if (firstAvailable === null) {
        firstAvailable = val;
      }
    }
  });

  if (firstAvailable !== null) {
    sessionSelect.value = firstAvailable.toString();
    startBtn.disabled = false;
    updateSetupFormVisibility();
  } else {
    // All 6 sessions completed!
    setupStatus.textContent = "Все 6 сессий этого эксперимента уже пройдены для данного ID!";
    setupStatus.className = "status-msg error";
    setupStatus.style.display = "block";
    startBtn.disabled = true;
  }
}

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

  // Security: Check character constraints
  const safeId = participantId.replace(/[^A-Za-z0-9_-]/g, "");
  if (!safeId || safeId !== participantId) {
    alert("ID участника может содержать только латинские буквы, цифры, дефис и знак подчеркивания.");
    return;
  }

  // Demographics Recovery (check if they exist even if session > 1)
  const hasLocalDemo = localStorage.getItem('gender_' + participantId) && localStorage.getItem('age_' + participantId);
  if (sessionNum === 1 || !hasLocalDemo) {
    gender = document.getElementById("participant-gender").value;
    age = document.getElementById("participant-age").value.trim();
    if (!gender || !age) {
      alert("Пожалуйста, заполните ваши демографические данные (Пол и Возраст).");
      return;
    }
    // Save locally for subsequent sessions
    localStorage.setItem('gender_' + participantId, gender);
    localStorage.setItem('age_' + participantId, age);
  } else {
    gender = localStorage.getItem('gender_' + participantId) || "";
    age = localStorage.getItem('age_' + participantId) || "";
  }

  // Check mid-session progress recovery
  const progressKey = `progress_${participantId}_ses-${sessionNum}`;
  const savedProgress = localStorage.getItem(progressKey);
  if (savedProgress) {
    if (confirm("Обнаружен сохраненный прогресс для этой сессии. Хотите продолжить с места прерывания?")) {
      try {
        const progressData = JSON.parse(savedProgress);
        trials = progressData.trials;
        trialPointer = progressData.trialPointer;
        goToTrial();
        return;
      } catch (e) {
        console.error("Error loading progress", e);
        localStorage.removeItem(progressKey);
      }
    } else {
      localStorage.removeItem(progressKey);
    }
  }

  // 1. Shuffling based on seed (deterministic for participantId)
  shuffledStimuli = seedShuffle(allStimuli, participantId);

  // 2. Generate trial sequences
  trials = [];

  // Static practice stimuli (identical for all subjects)
  const practiceStimuli = ["Figure S1.png", "Figure S2.png", "Figure S3.png"];

  if (sessionNum === 1) {
    practiceStimuli.forEach(stim => {
      const globalIdx = allStimuli.indexOf(stim);
      trials.push({
        stim_file: stim,
        global_idx: globalIdx,
        is_practice: true,
        response_adjective: "NNNN", // Prefilled adjective
        response_feelings: "NNNN",  // Prefilled response reflections
        rt_ms: null,
        onset_iso: null
      });
    });

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
      response_adjective: "",
      response_feelings: "",
      rt_ms: null,
      onset_iso: null
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
  const textAdjective = document.getElementById("textbox-adjective");
  const textFeelings = document.getElementById("textbox-feelings");

  textAdjective.value = trial.response_adjective;
  textFeelings.value = trial.response_feelings;

  // Configure Back button visibility
  const btnBack = document.getElementById("btn-back");
  if (trialPointer > 0) {
    btnBack.classList.remove("hidden");
  } else {
    btnBack.classList.add("hidden");
  }

  // Record trial start time and onset ISO
  trial.onset_iso = new Date().toISOString();
  trialOnset = performance.now();

  // Prefetch next image
  if (trialPointer + 1 < trials.length) {
    const nextImg = new Image();
    nextImg.src = `stimuli/${trials[trialPointer + 1].stim_file}`;
  }
}

// Next Trial Handler
function handleNext() {
  const textAdjective = document.getElementById("textbox-adjective");
  const textFeelings = document.getElementById("textbox-feelings");

  const adjectiveVal = textAdjective.value.trim();
  const feelingsVal = textFeelings.value.trim();

  // Soft validation: alert if multiple words entered in adjective field
  const words = adjectiveVal.split(/\s+/).filter(Boolean);
  if (words.length > 1 && !trials[trialPointer].is_practice) {
    if (!confirm("В первом поле (описание взгляда) рекомендуется ввести только одно прилагательное. Вы уверены, что хотите продолжить?")) {
      return;
    }
  }

  // Save current responses
  trials[trialPointer].response_adjective = adjectiveVal;
  trials[trialPointer].response_feelings = feelingsVal;
  
  // Calculate and store reaction time (RT) in milliseconds
  const rtMs = Math.round(performance.now() - trialOnset);
  trials[trialPointer].rt_ms = rtMs;

  trialPointer++;

  // Save progress locally
  localStorage.setItem(`progress_${participantId}_ses-${sessionNum}`, JSON.stringify({
    trialPointer: trialPointer,
    trials: trials
  }));

  if (trialPointer < trials.length) {
    renderTrial();
  } else {
    endExperiment();
  }
}

// Back Trial Handler
function handleBack() {
  if (trialPointer > 0) {
    const textAdjective = document.getElementById("textbox-adjective");
    const textFeelings = document.getElementById("textbox-feelings");

    // Save current values before going back
    trials[trialPointer].response_adjective = textAdjective.value.trim();
    trials[trialPointer].response_feelings = textFeelings.value.trim();

    trialPointer--;

    // Save progress locally
    localStorage.setItem(`progress_${participantId}_ses-${sessionNum}`, JSON.stringify({
      trialPointer: trialPointer,
      trials: trials
    }));

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
  // Capture final session completion timestamp
  sessionTimestampISO = new Date().toISOString();

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
      tdSeq.innerHTML = `<span class="practice-badge" style="font-size: 0.65rem; padding: 2px 6px;">Пример ${index + 1}</span>`;
    } else {
      tdSeq.textContent = sessionNum === 1 ? index - 2 : index + 1;
    }

    const tdStim = document.createElement("td");
    tdStim.style.padding = "6px 8px";
    tdStim.textContent = trial.stim_file;

    const tdAdj = document.createElement("td");
    tdAdj.style.padding = "6px 8px";
    tdAdj.textContent = truncateString(trial.response_adjective, 20);

    const tdFeel = document.createElement("td");
    tdFeel.style.padding = "6px 8px";
    tdFeel.textContent = truncateString(trial.response_feelings, 20);

    tr.appendChild(tdSeq);
    tr.appendChild(tdStim);
    tr.appendChild(tdAdj);
    tr.appendChild(tdFeel);
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

// Helper for formatting timestamp suffixes
function getTimestampSuffix(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const pad = n => String(n).padStart(2, '0');
    return `_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  } catch (err) {
    return "";
  }
}

// Generate CSV string
function generateCSV() {
  let csvContent = "participant_id,session,trial_sequence,is_practice,global_stim_idx,stim_file,response_adjective,response_feelings,rt_ms,onset_iso,gender,age\n";

  trials.forEach((trial, index) => {
    const seqNum = trial.is_practice ? (index + 1) : (sessionNum === 1 ? index - 2 : index + 1);

    const escapeCSV = (str) => {
      if (!str) return "";
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rtVal = (trial.rt_ms !== null && trial.rt_ms !== undefined) ? trial.rt_ms : "";
    const onsetVal = trial.onset_iso ? trial.onset_iso : "";

    csvContent += `${escapeCSV(participantId)},${sessionNum},${seqNum},${trial.is_practice ? 1 : 0},${trial.global_idx},${trial.stim_file},${escapeCSV(trial.response_adjective)},${escapeCSV(trial.response_feelings)},${rtVal},${onsetVal},${escapeCSV(gender)},${escapeCSV(age)}\n`;
  });

  return csvContent;
}

// Download CSV file locally
function downloadCSV() {
  const csvContent = generateCSV();

  // Save to local storage as completed
  const localKey = 'completed_sessions_' + participantId;
  const localSessions = JSON.parse(localStorage.getItem(localKey) || "[]");
  if (!localSessions.includes(sessionNum)) {
    localSessions.push(sessionNum);
    localStorage.setItem(localKey, JSON.stringify(localSessions));
  }

  const suffix = getTimestampSuffix(sessionTimestampISO);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `summary_sub-${participantId}_ses-${sessionNum}${suffix}.csv`);
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

    const payload = {
      action: "save_data",
      participantId: participantId,
      sessionNum: sessionNum,
      csvData: csvContent,
      timestamp: sessionTimestampISO || new Date().toISOString(),
      secret: SHARED_SECRET
    };

    fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка сети: статус ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.status === "success") {
          // Clear progress from local storage on successful save
          localStorage.removeItem(`progress_${participantId}_ses-${sessionNum}`);

          // Double-check session is saved in localStorage completed list
          const localKey = 'completed_sessions_' + participantId;
          const localSessions = JSON.parse(localStorage.getItem(localKey) || "[]");
          if (!localSessions.includes(sessionNum)) {
            localSessions.push(sessionNum);
            localStorage.setItem(localKey, JSON.stringify(localSessions));
          }
          
          uploadStatus.textContent = "Данные успешно отправлены на GitHub!";
          uploadStatus.className = "status-msg success";
        } else {
          throw new Error((data && data.message) || "Неизвестная ошибка сервера");
        }
      })
      .catch(err => {
        console.error("Upload error:", err);
        uploadStatus.textContent = "Ошибка при сохранении в облако: " + err.message + ". CSV файл сохранен локально. Пожалуйста, отправьте его экспериментатору.";
        uploadStatus.className = "status-msg error";
      });
  } else {
    // Clear progress on local download (completion fallback)
    localStorage.removeItem(`progress_${participantId}_ses-${sessionNum}`);

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
  
  // Refresh fields
  updateSetupFormVisibility();
  checkCompletedSessions();
}

// --- Initialize Event Listeners on DOM Load ---
window.addEventListener("DOMContentLoaded", () => {
  const sessionSelect = document.getElementById("session-num");
  const idInput = document.getElementById("participant-id");

  // Show/Hide Gender and Age inputs based on Session select/ID input
  sessionSelect.addEventListener("change", updateSetupFormVisibility);
  idInput.addEventListener("input", updateSetupFormVisibility);
  updateSetupFormVisibility();

  // Validate completed sessions on typing/blur
  idInput.addEventListener("input", debounce(checkCompletedSessions, 500));
  idInput.addEventListener("blur", checkCompletedSessions);
  checkCompletedSessions();

  // Image load error listener
  const stimImg = document.getElementById("stimulus-img");
  if (stimImg) {
    stimImg.addEventListener("error", () => {
      alert("Ошибка загрузки изображения стимула. Пожалуйста, проверьте интернет-соединение или обновите страницу.");
    });
  }
});
