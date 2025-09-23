document.addEventListener("DOMContentLoaded", () => {
  const rosterBody = document.getElementById("rosterBody");
  let names = [
    "Dr.Sharafat",
    "Sarem",
    "Sajid",
    "Aneeq",
    "Waqas",
    "Aqib",
    "Illyas",
    "Zohaib",
  ];

  // Load staff from staff records if available
  function loadStaffNames() {
    const savedStaff = localStorage.getItem("dutyRosterStaff");
    if (savedStaff) {
      names = JSON.parse(savedStaff);
    }
  }
  const dutyOptions = ["M", "E", "O", "M/E", "OT", "N"];
  // Set to current month by default
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  let currentPeriod = `${currentYear}-${currentMonth}`;

  console.log("Current date:", now);
  console.log("Setting default period to:", currentPeriod);
  let daysInCurrentMonth = 31;
  let dates = [];
  let isEditMode = false;

  // Initialize period and staff
  loadStaffNames();
  initializePeriod();

  function initializePeriod() {
    const dutyPeriodInput = document.getElementById("dutyPeriod");
    const daysInput = document.getElementById("daysInMonth");

    // Load saved period from localStorage or use current
    const savedPeriod = localStorage.getItem("dutyPeriod");
    const savedDays = localStorage.getItem("daysInMonth");

    if (savedPeriod) {
      currentPeriod = savedPeriod;
    } else {
      // Save current month to localStorage on first visit
      localStorage.setItem("dutyPeriod", currentPeriod);
    }

    if (savedDays) {
      daysInCurrentMonth = parseInt(savedDays);
    } else {
      // Save current days to localStorage on first visit
      localStorage.setItem("daysInMonth", daysInCurrentMonth);
    }

    dutyPeriodInput.value = currentPeriod;
    daysInput.value = daysInCurrentMonth;

    generateDates();

    // Update title immediately
    const [year, month] = currentPeriod.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    document.querySelector(
      "h1"
    ).textContent = `South East Pharmacy Duty Roster - ${
      monthNames[parseInt(month) - 1]
    } ${year}`;
  }

  function generateDates() {
    dates = [];
    const [year, month] = currentPeriod.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month) - 1];

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = dayNames[date.getDay()];
      // Shorter format for mobile: just day and date
      dates.push(`${dayName} ${i}`);
    }
  }

  function updateTableHeaders() {
    const headerRow = document.getElementById("tableHeader");
    headerRow.innerHTML =
      '<th class="px-1 md:px-3 py-1 md:py-2 text-center font-bold text-sm" style="text-align: center !important; vertical-align: middle; width: 60px; max-width: 60px; min-width: 50px;">Date</th>';

    names.forEach((name) => {
      const th = document.createElement("th");
      th.className = "px-1 md:px-3 py-1 md:py-2 text-center font-bold text-sm";
      th.style.cssText =
        "text-align: center !important; vertical-align: middle;";
      th.textContent = name;
      headerRow.appendChild(th);
    });
  }

  function renderRoster(rosterData) {
    updateTableHeaders();
    rosterBody.innerHTML = "";
    dates.forEach((date, dateIndex) => {
      const row = document.createElement("tr");
      row.className = "hover:bg-gray-700 transition-colors duration-200";

      // Date cell
      const dateCell = document.createElement("td");
      dateCell.className =
        "px-1 md:px-3 py-1 md:py-2 font-bold border-b border-gray-600 text-sm text-center";
      dateCell.style.cssText = "text-align: center !important; vertical-align: middle; width: 60px; max-width: 60px; min-width: 50px;";
      dateCell.textContent = date;
      row.appendChild(dateCell);

      // Duty cells
      names.forEach((name, nameIndex) => {
        const duty = rosterData[dateIndex]?.[nameIndex] || "";
        const cell = document.createElement("td");
        cell.className =
          "px-1 md:px-3 py-1 md:py-2 border-b border-gray-600 table-cell text-xs text-center";
        cell.style.textAlign = "center";
        cell.style.verticalAlign = "middle";

        if (isEditMode) {
          const container = document.createElement("div");
          container.className = "flex items-center gap-1";

          const select = document.createElement("select");
          select.className =
            "duty-dropdown text-xs bg-gray-700 border border-gray-600 rounded px-1 py-1 flex-shrink-0";
          select.style.width = "45px";
          select.innerHTML = `
                        <option value="">-</option>
                        ${dutyOptions
                          .map(
                            (option) =>
                              `<option value="${option}" ${
                                duty === option ? "selected" : ""
                              }>${option}</option>`
                          )
                          .join("")}
                    `;

          const timeDisplay = document.createElement("div");
          timeDisplay.className =
            "time-display text-xs leading-tight flex-1 cursor-pointer hover:bg-gray-600 rounded px-1";
          timeDisplay.style.fontSize = "9px";
          timeDisplay.title = "Click to edit time";

          const updateTimeDisplay = (dutyValue) => {
            const customTime = getCustomTime(dateIndex, nameIndex);
            if (customTime) {
              timeDisplay.innerHTML = `<div>${customTime.start}</div><div>${customTime.end}</div>`;
            } else {
              const times = getTimePeriod(dutyValue);
              if (dutyValue && dutyValue !== "") {
                timeDisplay.innerHTML = `<div>${times.start}</div><div>${times.end}</div>`;
              } else {
                timeDisplay.innerHTML = `<div>--:-- --</div><div>--:-- --</div>`;
              }
            }
          };

          timeDisplay.addEventListener("click", () => {
            if (isEditMode) {
              showIndividualTimeModal(
                dateIndex,
                nameIndex,
                date,
                names[nameIndex],
                select.value
              );
            }
          });

          select.addEventListener("change", (e) => {
            updateCellStyle(cell, e.target.value);
            updateTimeDisplay(e.target.value);
          });

          updateTimeDisplay(duty);

          container.appendChild(select);
          container.appendChild(timeDisplay);
          cell.appendChild(container);
        } else {
          const container = document.createElement("div");
          container.className = "flex items-center gap-1";

          const dutySpan = document.createElement("span");
          dutySpan.textContent = duty;
          dutySpan.className = "flex-shrink-0";

          const timeDisplay = document.createElement("div");
          timeDisplay.className = "time-display text-xs leading-tight flex-1";
          timeDisplay.style.fontSize = "9px";

          const customTime = getCustomTime(dateIndex, nameIndex);
          if (customTime) {
            timeDisplay.innerHTML = `<div>${customTime.start}</div><div>${customTime.end}</div>`;
          } else {
            const times = getTimePeriod(duty);
            if (duty && duty !== "") {
              timeDisplay.innerHTML = `<div>${times.start}</div><div>${times.end}</div>`;
            } else {
              timeDisplay.innerHTML = `<div>--:-- --</div><div>--:-- --</div>`;
            }
          }

          container.appendChild(dutySpan);
          container.appendChild(timeDisplay);
          cell.appendChild(container);
        }

        updateCellStyle(cell, duty);
        row.appendChild(cell);
      });

      rosterBody.appendChild(row);
    });
  }

  function updateCellStyle(cell, duty) {
    // Remove existing classes
    cell.classList.remove(
      "off-duty",
      "overtime",
      "morning-shift",
      "evening-shift",
      "night-shift",
      "double-shift"
    );

    switch (duty) {
      case "O":
        cell.classList.add("off-duty");
        break;
      case "OT":
        cell.classList.add("overtime");
        break;
      case "M":
        cell.classList.add("morning-shift");
        break;
      case "E":
        cell.classList.add("evening-shift");
        break;
      case "N":
        cell.classList.add("night-shift");
        break;
      case "M/E":
        cell.classList.add("double-shift");
        break;
    }
  }

  // Get time period for duty code
  function getTimePeriod(duty) {
    const savedPeriods = JSON.parse(
      localStorage.getItem("timePeriods") || "{}"
    );
    const defaults = {
      M: { start: "06:00 AM", end: "02:00 PM" },
      E: { start: "02:00 PM", end: "10:00 PM" },
      N: { start: "10:00 PM", end: "06:00 AM" },
      "M/E": { start: "06:00 AM", end: "10:00 PM" },
      OT: { start: "--:-- --", end: "--:-- --" },
      O: { start: "--:-- --", end: "--:-- --" },
    };

    if (savedPeriods[duty]) {
      return {
        start: formatTime12Hour(savedPeriods[duty].start),
        end: formatTime12Hour(savedPeriods[duty].end),
      };
    }

    return defaults[duty] || { start: "--:-- --", end: "--:-- --" };
  }

  // Make functions globally available
  window.updateCellStyle = updateCellStyle;
  window.getTimePeriod = getTimePeriod;

  function loadFromFirebase() {
    if (!window.firebaseDB) {
      setTimeout(loadFromFirebase, 500);
      return;
    }

    // Reload staff names before loading roster
    loadStaffNames();

    const periodKey = currentPeriod.replace("-", "");
    const dbRef = window.firebaseRef(
      window.firebaseDB,
      `dutyRoster/${periodKey}`
    );

    // Force refresh by adding timestamp
    const timestamp = Date.now();
    console.log(`Loading data at ${timestamp}`);

    window.firebaseOnValue(
      dbRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Firebase data received:", data);
        if (data && data.roster) {
          renderRoster(data.roster);
        } else {
          renderRoster([]);
        }
      },
      {
        // Force real-time updates
        includeMetadataChanges: true,
      }
    );
  }

  // Global functions
  window.updatePeriod = function () {
    const dutyPeriodInput = document.getElementById("dutyPeriod");
    const daysInput = document.getElementById("daysInMonth");

    currentPeriod = dutyPeriodInput.value;
    daysInCurrentMonth = parseInt(daysInput.value);

    // Save to localStorage
    localStorage.setItem("dutyPeriod", currentPeriod);
    localStorage.setItem("daysInMonth", daysInCurrentMonth);

    generateDates();

    // Update title
    const [year, month] = currentPeriod.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    document.querySelector(
      "h1"
    ).textContent = `South East Pharmacy Duty Roster - ${
      monthNames[parseInt(month) - 1]
    } ${year}`;

    loadFromFirebase();
  };

  window.showPasswordModal = function () {
    const modal = document.getElementById("passwordModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.getElementById("passwordInput").focus();
  };

  window.verifyPassword = function () {
    const password = document.getElementById("passwordInput").value;
    const errorElement = document.getElementById("passwordError");

    if (password === "Nokia108") {
      isEditMode = true;
      document.getElementById("passwordModal").classList.add("hidden");
      document.getElementById("passwordModal").classList.remove("flex");
      document.getElementById("editButton").classList.add("hidden");
      document.getElementById("autoButton").classList.remove("hidden");
      document.getElementById("saveButton").classList.remove("hidden");

      document.getElementById("colorButton").classList.remove("hidden");
      loadFromFirebase();
      errorElement.textContent = "";
    } else {
      errorElement.textContent = "Incorrect password!";
    }
    document.getElementById("passwordInput").value = "";
  };

  window.autoAssignDuties = function () {
    // Simple auto-assignment logic
    const rosterData = [];
    dates.forEach((date, dateIndex) => {
      const dayData = [];
      names.forEach((name, nameIndex) => {
        const duties = ["M", "E", "N", "O"];
        const randomDuty = duties[Math.floor(Math.random() * duties.length)];
        dayData.push(randomDuty);
      });
      rosterData.push(dayData);
    });
    renderRoster(rosterData);
  };

  window.forceRefresh = function () {
    console.log("Manual refresh triggered");
    const refreshBtn = document.getElementById("refreshButton");
    refreshBtn.textContent = "🔄 Refreshing...";
    refreshBtn.disabled = true;

    loadFromFirebase();

    setTimeout(() => {
      refreshBtn.textContent = "🔄 Refresh";
      refreshBtn.disabled = false;
    }, 2000);
  };

  window.saveRoster = function () {
    const rosterData = [];
    const rows = rosterBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const dayData = [];

      for (let i = 1; i < cells.length; i++) {
        const select = cells[i].querySelector("select");
        if (select) {
          dayData.push(select.value);
        } else {
          dayData.push(cells[i].textContent);
        }
      }
      rosterData.push(dayData);
    });

    const periodKey = currentPeriod.replace("-", "");
    const dbRef = window.firebaseRef(
      window.firebaseDB,
      `dutyRoster/${periodKey}`
    );
    // Add timestamp to force updates
    const saveData = {
      roster: rosterData,
      period: currentPeriod,
      days: daysInCurrentMonth,
      lastUpdated: Date.now(),
      timestamp: new Date().toISOString(),
    };

    window
      .firebaseSet(dbRef, saveData)
      .then(() => {
        alert("✅ Roster saved successfully!");
        console.log("Data saved with timestamp:", saveData.timestamp);
        isEditMode = false;
        document.getElementById("editButton").classList.remove("hidden");
        document.getElementById("autoButton").classList.add("hidden");
        document.getElementById("saveButton").classList.add("hidden");

        document.getElementById("colorButton").classList.add("hidden");

        // Force reload after save
        setTimeout(() => {
          loadFromFirebase();
          checkOvertimeAlerts();
        }, 1000);
      })
      .catch((error) => {
        alert("❌ Error saving roster: " + error.message);
      });
  };

  // Auto-refresh every 30 seconds to check for updates
  function setupAutoRefresh() {
    setInterval(() => {
      if (!isEditMode) {
        console.log("Auto-refreshing data...");
        loadFromFirebase();
      }
    }, 30000); // 30 seconds
  }

  // Wait for Firebase to load
  function waitForFirebase() {
    if (window.firebaseDB) {
      loadFromFirebase();
      setupAutoRefresh();
    } else {
      setTimeout(waitForFirebase, 100);
    }
  }
  waitForFirebase();

  // Add visibility change listener to refresh when tab becomes active
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !isEditMode) {
      console.log("Tab became visible, refreshing data...");
      loadFromFirebase();
    }
  });
});

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  const modal = document.getElementById("passwordModal");
  if (event.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});

// Keyboard event handlers
document.addEventListener("keydown", function (event) {
  // ESC key - close any open modal
  if (event.key === "Escape") {
    const modals = ['passwordModal', 'timePeriodModal', 'timeEditModal', 'individualTimeModal', 'colorModal'];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains('flex')) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }
  
  // Enter key - submit forms or confirm actions
  if (event.key === "Enter") {
    if (document.getElementById("passwordModal").classList.contains("flex")) {
      verifyPassword();
    }
  }
  
  // Ctrl+S - Save roster (when in edit mode)
  if (event.ctrlKey && event.key === "s" && !document.getElementById("saveButton").classList.contains("hidden")) {
    event.preventDefault();
    saveRoster();
  }
  
  // Ctrl+E - Edit roster
  if (event.ctrlKey && event.key === "e" && !document.getElementById("editButton").classList.contains("hidden")) {
    event.preventDefault();
    showPasswordModal();
  }
  
  // Ctrl+R - Refresh
  if (event.ctrlKey && event.key === "r") {
    event.preventDefault();
    forceRefresh();
  }
});

// Time Period Assignment Functions
let timePeriods = {
  M: { name: "Morning", start: "06:00", end: "14:00" },
  E: { name: "Evening", start: "14:00", end: "22:00" },
  N: { name: "Night", start: "22:00", end: "06:00" },
  ME: { name: "Morning/Evening", start: "06:00", end: "22:00" },
};

let currentEditingPeriod = null;

function showTimePeriodModal() {
  const modal = document.getElementById("timePeriodModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  updateTimePeriodDisplay();
}

function closeTimePeriodModal() {
  const modal = document.getElementById("timePeriodModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function updateTimePeriodDisplay() {
  document.getElementById(
    "morning-time"
  ).textContent = `${timePeriods.M.start} - ${timePeriods.M.end}`;
  document.getElementById(
    "evening-time"
  ).textContent = `${timePeriods.E.start} - ${timePeriods.E.end}`;
  document.getElementById(
    "night-time"
  ).textContent = `${timePeriods.N.start} - ${timePeriods.N.end}`;
  document.getElementById(
    "me-time"
  ).textContent = `${timePeriods.ME.start} - ${timePeriods.ME.end}`;
}

function editTimePeriod(periodCode) {
  currentEditingPeriod = periodCode;
  const period = timePeriods[periodCode];

  document.getElementById("editPeriodName").value = period.name;
  document.getElementById("editStartTime").value = period.start;
  document.getElementById("editEndTime").value = period.end;

  const modal = document.getElementById("timeEditModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeTimeEditModal() {
  const modal = document.getElementById("timeEditModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentEditingPeriod = null;
}

function saveTimePeriod() {
  if (!currentEditingPeriod) return;

  const startTime = document.getElementById("editStartTime").value;
  const endTime = document.getElementById("editEndTime").value;

  timePeriods[currentEditingPeriod].start = startTime;
  timePeriods[currentEditingPeriod].end = endTime;

  updateTimePeriodDisplay();
  closeTimeEditModal();

  // Save to localStorage
  localStorage.setItem("timePeriods", JSON.stringify(timePeriods));

  // Refresh roster to show updated times
  const currentRosterData = getCurrentRosterData();
  renderRoster(currentRosterData);

  alert("Time period updated successfully!");
}

function assignTimePeriod() {
  const startDate = document.getElementById("assignStartDate").value;
  const endDate = document.getElementById("assignEndDate").value;
  const staff = document.getElementById("assignStaff").value;
  const period = document.getElementById("assignPeriod").value;

  if (!startDate || !endDate || !staff || !period) {
    alert("Please fill all fields");
    return;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const [currentYear, currentMonth] = window.currentPeriod
    ? window.currentPeriod.split("-")
    : ["2024", "01"];

  // Find staff column index
  const staffIndex = window.names ? window.names.indexOf(staff) : -1;
  if (staffIndex === -1) {
    alert("Staff member not found");
    return;
  }

  // Apply assignment to date range
  const rows = document.getElementById("rosterBody").querySelectorAll("tr");

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfMonth = date.getDate();
    const rowIndex = dayOfMonth - 1;

    if (rowIndex >= 0 && rowIndex < rows.length) {
      const row = rows[rowIndex];
      const cells = row.querySelectorAll("td");
      const staffCell = cells[staffIndex + 1]; // +1 because first cell is date

      if (staffCell) {
        const select = staffCell.querySelector("select");
        if (select) {
          select.value = period;
          updateCellStyle(staffCell, period);
        }
      }
    }
  }

  alert(`Assigned ${period} to ${staff} from ${startDate} to ${endDate}`);
}

function applyRotationPattern() {
  const rows = document.getElementById("rosterBody").querySelectorAll("tr");
  const rotationPattern = ["M", "E", "N", "O"]; // 3 days work, 1 day off

  window.names.forEach((name, staffIndex) => {
    let patternIndex = staffIndex % rotationPattern.length; // Start each staff at different point

    rows.forEach((row, dayIndex) => {
      const cells = row.querySelectorAll("td");
      const staffCell = cells[staffIndex + 1];

      if (staffCell) {
        const select = staffCell.querySelector("select");
        if (select) {
          const duty = rotationPattern[patternIndex % rotationPattern.length];
          select.value = duty;
          updateCellStyle(staffCell, duty);
        }
      }

      patternIndex++;
    });
  });

  alert("Rotation pattern applied successfully!");
}

function applyWeekendPattern() {
  const rows = document.getElementById("rosterBody").querySelectorAll("tr");
  const [currentYear, currentMonth] = window.currentPeriod
    ? window.currentPeriod.split("-")
    : ["2024", "01"];

  rows.forEach((row, dayIndex) => {
    const date = new Date(currentYear, currentMonth - 1, dayIndex + 1);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday

    const cells = row.querySelectorAll("td");

    window.names.forEach((name, staffIndex) => {
      const staffCell = cells[staffIndex + 1];
      if (staffCell) {
        const select = staffCell.querySelector("select");
        if (select) {
          // Weekend: reduced staff, weekday: normal rotation
          const duty = isWeekend ? (staffIndex < 2 ? "M/E" : "O") : "M";
          select.value = duty;
          updateCellStyle(staffCell, duty);
        }
      }
    });
  });

  alert("Weekend pattern applied successfully!");
}

function clearAllAssignments() {
  if (!confirm("Are you sure you want to clear all assignments?")) return;

  const rows = document.getElementById("rosterBody").querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    for (let i = 1; i < cells.length; i++) {
      const cell = cells[i];
      const select = cell.querySelector("select");
      if (select) {
        select.value = "";
        updateCellStyle(cell, "");
      }
    }
  });

  alert("All assignments cleared!");
}

// Load saved time periods on startup
function loadTimePeriods() {
  const saved = localStorage.getItem("timePeriods");
  if (saved) {
    timePeriods = JSON.parse(saved);
  }
}

// Custom time periods for individual cells
let customTimePeriods = {};

function getCustomTime(dateIndex, staffIndex) {
  const key = `${dateIndex}-${staffIndex}`;
  return customTimePeriods[key] || null;
}

function setCustomTime(dateIndex, staffIndex, startTime, endTime) {
  const key = `${dateIndex}-${staffIndex}`;
  customTimePeriods[key] = {
    start: formatTime12Hour(startTime),
    end: formatTime12Hour(endTime),
  };
  localStorage.setItem("customTimePeriods", JSON.stringify(customTimePeriods));
}

function loadCustomTimes() {
  const saved = localStorage.getItem("customTimePeriods");
  if (saved) {
    customTimePeriods = JSON.parse(saved);
  }
}

function formatTime12Hour(time24) {
  if (!time24) return "--:-- --";
  const [hours, minutes] = time24.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const start = new Date(`2000-01-01 ${startTime}`);
  let end = new Date(`2000-01-01 ${endTime}`);

  // Handle overnight shifts
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  return (end - start) / (1000 * 60 * 60);
}

let currentEditingCell = null;

function showIndividualTimeModal(dateIndex, staffIndex, date, staff, duty) {
  currentEditingCell = { dateIndex, staffIndex };

  document.getElementById("editIndividualDate").value = date;
  document.getElementById("editIndividualStaff").value = staff;
  document.getElementById("editIndividualDuty").value = duty;

  const customTime = getCustomTime(dateIndex, staffIndex);
  const defaultTime = getTimePeriod(duty);

  if (customTime) {
    // Convert back to 24-hour format for input
    document.getElementById("editIndividualStartTime").value = convert12to24(
      customTime.start
    );
    document.getElementById("editIndividualEndTime").value = convert12to24(
      customTime.end
    );
  } else if (defaultTime && defaultTime.start !== "--:-- --") {
    document.getElementById("editIndividualStartTime").value = convert12to24(
      defaultTime.start
    );
    document.getElementById("editIndividualEndTime").value = convert12to24(
      defaultTime.end
    );
  } else {
    document.getElementById("editIndividualStartTime").value = "";
    document.getElementById("editIndividualEndTime").value = "";
  }

  updateIndividualHours();

  const modal = document.getElementById("individualTimeModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function convert12to24(time12) {
  if (!time12 || time12 === "--:-- --") return "";
  const [time, ampm] = time12.split(" ");
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours);

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minutes}`;
}

function updateIndividualHours() {
  const startTime = document.getElementById("editIndividualStartTime").value;
  const endTime = document.getElementById("editIndividualEndTime").value;
  const hours = calculateHours(startTime, endTime);
  document.getElementById("individualTotalHours").textContent =
    hours.toFixed(1);
}

function saveIndividualTime() {
  if (!currentEditingCell) return;

  const startTime = document.getElementById("editIndividualStartTime").value;
  const endTime = document.getElementById("editIndividualEndTime").value;

  if (startTime && endTime) {
    setCustomTime(
      currentEditingCell.dateIndex,
      currentEditingCell.staffIndex,
      startTime,
      endTime
    );
  }

  closeIndividualTimeModal();
  renderRoster(getCurrentRosterData());
  checkOvertimeAlerts();
}

function closeIndividualTimeModal() {
  const modal = document.getElementById("individualTimeModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  currentEditingCell = null;
}

function getCurrentRosterData() {
  const rosterData = [];
  const rows = document.getElementById("rosterBody").querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const dayData = [];

    for (let i = 1; i < cells.length; i++) {
      const select = cells[i].querySelector("select");
      if (select) {
        dayData.push(select.value);
      } else {
        dayData.push(cells[i].textContent.split("\n")[0] || "");
      }
    }
    rosterData.push(dayData);
  });

  return rosterData;
}

function checkOvertimeAlerts() {
  const overtimeEntries = [];
  const rosterData = getCurrentRosterData();

  rosterData.forEach((dayData, dateIndex) => {
    dayData.forEach((duty, staffIndex) => {
      if (duty && duty !== "" && duty !== "O") {
        const customTime = getCustomTime(dateIndex, staffIndex);
        let startTime, endTime;

        if (customTime) {
          startTime = convert12to24(customTime.start);
          endTime = convert12to24(customTime.end);
        } else {
          const defaultTime = getTimePeriod(duty);
          if (defaultTime && defaultTime.start !== "--:-- --") {
            startTime = convert12to24(defaultTime.start);
            endTime = convert12to24(defaultTime.end);
          }
        }

        if (startTime && endTime) {
          const hours = calculateHours(startTime, endTime);
          if (hours > 10) {
            overtimeEntries.push({
              date: dates[dateIndex],
              staff: names[staffIndex],
              duty: duty,
              hours: hours.toFixed(1),
              overtime: (hours - 10).toFixed(1),
            });
          }
        }
      }
    });
  });

  const overtimeAlert = document.getElementById("overtimeAlert");
  const overtimeTableBody = document.getElementById("overtimeTableBody");

  if (overtimeEntries.length > 0) {
    overtimeTableBody.innerHTML = "";
    overtimeEntries.forEach((entry) => {
      const row = document.createElement("tr");
      row.className = "border-b border-red-700";
      row.innerHTML = `
                <td class="px-3 py-2">${entry.date}</td>
                <td class="px-3 py-2">${entry.staff}</td>
                <td class="px-3 py-2">${entry.duty}</td>
                <td class="px-3 py-2">${entry.hours}h</td>
                <td class="px-3 py-2 font-bold text-red-300">${entry.overtime}h</td>
            `;
      overtimeTableBody.appendChild(row);
    });
    overtimeAlert.classList.remove("hidden");
  } else {
    overtimeAlert.classList.add("hidden");
  }
}

// Event listeners for individual time modal
document.addEventListener("DOMContentLoaded", () => {
  const startTimeInput = document.getElementById("editIndividualStartTime");
  const endTimeInput = document.getElementById("editIndividualEndTime");

  if (startTimeInput && endTimeInput) {
    startTimeInput.addEventListener("change", updateIndividualHours);
    endTimeInput.addEventListener("change", updateIndividualHours);
  }
});

// Make functions globally available
window.showTimePeriodModal = showTimePeriodModal;
window.closeTimePeriodModal = closeTimePeriodModal;
window.editTimePeriod = editTimePeriod;
window.closeTimeEditModal = closeTimeEditModal;
window.saveTimePeriod = saveTimePeriod;
window.assignTimePeriod = assignTimePeriod;
window.applyRotationPattern = applyRotationPattern;
window.applyWeekendPattern = applyWeekendPattern;
window.clearAllAssignments = clearAllAssignments;
window.showIndividualTimeModal = showIndividualTimeModal;
window.closeIndividualTimeModal = closeIndividualTimeModal;
window.saveIndividualTime = saveIndividualTime;
window.getCustomTime = getCustomTime;
window.checkOvertimeAlerts = checkOvertimeAlerts;

// Color customization functions
let customColors = {
  M: "#6ee7b7",
  E: "#93c5fd",
  N: "#a5b4fc",
  "M/E": "#fcd34d",
  O: "#fca5a5",
  OT: "#d97706",
};

function showColorModal() {
  // Load current colors
  document.getElementById("colorM").value = customColors.M;
  document.getElementById("colorE").value = customColors.E;
  document.getElementById("colorN").value = customColors.N;
  document.getElementById("colorME").value = customColors["M/E"];
  document.getElementById("colorO").value = customColors.O;
  document.getElementById("colorOT").value = customColors.OT;

  // Load time display styles
  loadTimeDisplayStyles();

  const modal = document.getElementById("colorModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeColorModal() {
  const modal = document.getElementById("colorModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function saveColors() {
  customColors.M = document.getElementById("colorM").value;
  customColors.E = document.getElementById("colorE").value;
  customColors.N = document.getElementById("colorN").value;
  customColors["M/E"] = document.getElementById("colorME").value;
  customColors.O = document.getElementById("colorO").value;
  customColors.OT = document.getElementById("colorOT").value;

  // Save time display styles
  const timeStyles = {
    timeBoxBg: document.getElementById("timeBoxBg").value,
    timeTextColor: document.getElementById("timeTextColor").value,
    timeFontSize: document.getElementById("timeFontSize").value,
    timeFontWeight: document.getElementById("timeFontWeight").value,
  };

  // Save to localStorage
  localStorage.setItem("customColors", JSON.stringify(customColors));
  localStorage.setItem("timeDisplayStyles", JSON.stringify(timeStyles));

  // Update CSS dynamically
  updateDynamicCSS();

  closeColorModal();
  alert("Colors and styles saved successfully!");
}

function resetColors() {
  customColors = {
    M: "#6ee7b7",
    E: "#93c5fd",
    N: "#a5b4fc",
    "M/E": "#fcd34d",
    O: "#fca5a5",
    OT: "#d97706",
  };

  // Reset time display styles
  const defaultTimeStyles = {
    timeBoxBg: "#374151",
    timeTextColor: "#ffffff",
    timeFontSize: "12px",
    timeFontWeight: "bold",
  };

  localStorage.setItem("customColors", JSON.stringify(customColors));
  localStorage.setItem("timeDisplayStyles", JSON.stringify(defaultTimeStyles));
  updateDynamicCSS();
  showColorModal(); // Refresh the modal
  alert("Colors and styles reset to default!");
}

function updateDynamicCSS() {
  // Remove existing dynamic styles
  const existingStyle = document.getElementById("dynamicColors");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new dynamic styles
  const style = document.createElement("style");
  style.id = "dynamicColors";

  // Load time display styles
  const timeStyles = JSON.parse(
    localStorage.getItem("timeDisplayStyles") || "{}"
  );
  const defaultTimeStyles = {
    timeBoxBg: "#374151",
    timeTextColor: "#ffffff",
    timeFontSize: "12px",
    timeFontWeight: "bold",
  };

  const currentTimeStyles = { ...defaultTimeStyles, ...timeStyles };

  // Convert hex to contrasting text color
  function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  }

  style.textContent = `
        .morning-shift {
            background-color: ${customColors.M} !important;
            color: ${getContrastColor(customColors.M)} !important;
            font-weight: bold;
        }
        .evening-shift {
            background-color: ${customColors.E} !important;
            color: ${getContrastColor(customColors.E)} !important;
            font-weight: bold;
        }
        .night-shift {
            background-color: ${customColors.N} !important;
            color: ${getContrastColor(customColors.N)} !important;
            font-weight: bold;
        }
        .double-shift {
            background-color: ${customColors["M/E"]} !important;
            color: ${getContrastColor(customColors["M/E"])} !important;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        .off-duty {
            background-color: ${customColors.O} !important;
            color: ${getContrastColor(customColors.O)} !important;
            font-weight: bold;
            animation: pulseRed 2s infinite;
        }
        .overtime {
            background-color: ${customColors.OT} !important;
            color: ${getContrastColor(customColors.OT)} !important;
            font-weight: bold;
        }
        .time-display {
            background-color: ${currentTimeStyles.timeBoxBg} !important;
            color: ${currentTimeStyles.timeTextColor} !important;
            font-size: ${currentTimeStyles.timeFontSize} !important;
            font-weight: ${currentTimeStyles.timeFontWeight} !important;
            padding: 2px 4px;
            border-radius: 4px;
            margin-left: 4px;
        }
    `;

  document.head.appendChild(style);
}

function loadCustomColors() {
  const saved = localStorage.getItem("customColors");
  if (saved) {
    customColors = JSON.parse(saved);
  }
  updateDynamicCSS();
}

function loadTimeDisplayStyles() {
  const timeStyles = JSON.parse(
    localStorage.getItem("timeDisplayStyles") || "{}"
  );
  const defaults = {
    timeBoxBg: "#374151",
    timeTextColor: "#ffffff",
    timeFontSize: "12px",
    timeFontWeight: "bold",
  };

  const currentStyles = { ...defaults, ...timeStyles };

  if (currentStyles.timeBoxBg !== "transparent") {
    document.getElementById("timeBoxBg").value = currentStyles.timeBoxBg;
  }
  document.getElementById("timeTextColor").value = currentStyles.timeTextColor;
  document.getElementById("timeFontSize").value = currentStyles.timeFontSize;
  document.getElementById("timeFontWeight").value =
    currentStyles.timeFontWeight;
}

function setTransparentBackground() {
  document.getElementById("timeBoxBg").value = "#000000";
  const timeStyles = JSON.parse(
    localStorage.getItem("timeDisplayStyles") || "{}"
  );
  timeStyles.timeBoxBg = "transparent";
  localStorage.setItem("timeDisplayStyles", JSON.stringify(timeStyles));
  updateDynamicCSS();
}

// Make color functions globally available
window.showColorModal = showColorModal;
window.closeColorModal = closeColorModal;
window.saveColors = saveColors;
window.resetColors = resetColors;
window.setTransparentBackground = setTransparentBackground;

// Load custom times and colors on startup
loadCustomTimes();
loadCustomColors();

// Initialize time periods and custom times
loadTimePeriods();
loadCustomTimes();

// Make variables globally available for time period functions
window.currentPeriod = null;
window.names = [
  "Dr.Sharafat",
  "Sarem",
  "Sajid",
  "Aneeq",
  "Waqas",
  "Aqib",
  "Illyas",
  "Zohaib",
];

// Update global variables when period changes
function updateGlobalVariables() {
  window.currentPeriod = currentPeriod;
}

// Call this when period is updated
setInterval(updateGlobalVariables, 1000);
// Firebase sync functions for all data
function syncToFirebase(key, data) {
  if (window.firebaseDB) {
    const dbRef = window.firebaseRef(window.firebaseDB, `settings/${key}`);
    window.firebaseSet(dbRef, data);
  }
}

function loadFromFirebase(key, callback) {
  if (window.firebaseDB) {
    const dbRef = window.firebaseRef(window.firebaseDB, `settings/${key}`);
    window.firebaseOnValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        localStorage.setItem(key, JSON.stringify(data));
        if (callback) callback(data);
      }
    });
  }
}

// Override localStorage setItem to sync with Firebase
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.call(this, key, value);
  
  // Sync specific keys to Firebase
  const syncKeys = ['dutyColors', 'timeStyles', 'timePeriods', 'customTimePeriods', 'staffData', 'dutyRosterStaff'];
  if (syncKeys.includes(key)) {
    syncToFirebase(key, JSON.parse(value));
  }
};

// Load all settings from Firebase on startup
function loadAllSettings() {
  const keys = ['dutyColors', 'timeStyles', 'timePeriods', 'customTimePeriods', 'staffData', 'dutyRosterStaff'];
  keys.forEach(key => {
    loadFromFirebase(key, (data) => {
      if (key === 'dutyColors' || key === 'timeStyles') {
        updateDynamicCSS();
      }
      if (key === 'staffData') {
        window.names = data.filter(staff => staff.status === 'Active').map(staff => staff.name);
      }
    });
  });
}

// Initialize Firebase sync
setTimeout(loadAllSettings, 1000);