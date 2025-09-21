const PASSWORD = "Nokia108";
let isEditing = false;

const dutyOptions = ["M", "E", "O", "OT", "M/E", "N"];
const dates = [
  "Wed 1/Oct",
  "Thu 2/Oct",
  "Fri 3/Oct",
  "Sat 4/Oct",
  "Sun 5/Oct",
  "Mon 6/Oct",
  "Tue 7/Oct",
  "Wed 8/Oct",
  "Thu 9/Oct",
  "Fri 10/Oct",
  "Sat 11/Oct",
  "Sun 12/Oct",
  "Mon 13/Oct",
  "Tue 14/Oct",
  "Wed 15/Oct",
  "Thu 16/Oct",
  "Fri 17/Oct",
  "Sat 18/Oct",
  "Sun 19/Oct",
  "Mon 20/Oct",
  "Tue 21/Oct",
  "Wed 22/Oct",
  "Thu 23/Oct",
  "Fri 24/Oct",
  "Sat 25/Oct",
  "Sun 26/Oct",
  "Mon 27/Oct",
  "Tue 28/Oct",
  "Wed 29/Oct",
  "Thu 30/Oct",
  "Fri 31/Oct",
];
const names = [
  "Dr Sharafat",
  "Sarem",
  "Sajid",
  "Aneeq",
  "Waqas",
  "Aqib",
  "Illyas",
  "Zohaib",
];

const rosterBody = document.getElementById("rosterBody");

dates.forEach((date) => {
  let row = `<tr><td>${date}</td>`;
  names.forEach(() => {
    row += `<td>
            <div class="duty-cell-content">
              <select onchange="handleDutyChange(this)" data-previous-value="${
                dutyOptions[0]
              }">
                ${dutyOptions
                  .map((opt) => `<option value="${opt}">${opt}</option>`)
                  .join("")}
              </select>
            </div>
          </td>`;
  });
  row += "</tr>";
  rosterBody.innerHTML += row;
});

function handleDutyChange(selectElement) {
  if (!isEditing) {
    alert("Please click 'Edit Roster' and enter the password to make changes.");
    selectElement.value = selectElement.dataset.previousValue || dutyOptions[0];
    return;
  }

  const newValue = selectElement.value;
  const parentTd = selectElement.closest("td");

  if (newValue === "O") {
    parentTd.classList.add("off-duty");
  } else {
    parentTd.classList.remove("off-duty");
  }

  selectElement.dataset.previousValue = newValue;
  saveToDB();
}

function showPasswordModal() {
  document.getElementById("passwordModal").style.display = "block";
  document.getElementById("passwordInput").value = "";
  document.getElementById("passwordError").textContent = "";
}

function verifyPassword() {
  const enteredPassword = document.getElementById("passwordInput").value;
  const passwordError = document.getElementById("passwordError");

  if (enteredPassword === PASSWORD) {
    enableEditing();
    document.getElementById("passwordModal").style.display = "none";
  } else {
    passwordError.textContent = "Incorrect password.";
  }
}

function enableEditing() {
  isEditing = true;
  document.getElementById("editButton").style.display = "none";
  document.getElementById("autoButton").style.display = "inline-block";
  document.getElementById("saveButton").style.display = "inline-block";

  const selects = document.querySelectorAll("#rosterBody select");
  selects.forEach((select) => {
    select.disabled = false;
    handleDutyChange(select);
  });
}

function saveRoster() {
  isEditing = false;
  document.getElementById("editButton").style.display = "inline-block";
  document.getElementById("autoButton").style.display = "none";
  document.getElementById("saveButton").style.display = "none";

  const selects = document.querySelectorAll("#rosterBody select");
  selects.forEach((select) => (select.disabled = true));

  saveToDB();
  alert("Roster changes saved to database!");
}

function autoAssignDuties() {
  if (!isEditing) return;

  const rows = document.querySelectorAll("#rosterBody tr");
  const duties = ["M", "E", "N"];

  rows.forEach((row, dayIndex) => {
    const selects = row.querySelectorAll("select");

    selects.forEach((select, personIndex) => {
      if (personIndex < duties.length) {
        const dutyIndex = (dayIndex + personIndex) % duties.length;
        select.value = duties[dutyIndex];
      } else {
        select.value = "O";
      }
      handleDutyChange(select);
    });
  });

  saveToDB();
  alert("Duties automatically assigned!");
}

let db;

function initDB() {
  const request = indexedDB.open("DutyRosterDB", 1);

  request.onerror = () => console.error("Database error:", request.error);

  request.onsuccess = () => {
    db = request.result;
    loadFromDB();
  };

  request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore("roster", { keyPath: "id" });
    objectStore.createIndex("month", "month", { unique: false });
  };
}

function saveToDB() {
  if (!db) return;

  const rosterData = [];
  const rows = document.querySelectorAll("#rosterBody tr");

  rows.forEach((row, rowIndex) => {
    const selects = row.querySelectorAll("select");
    const dayData = [];

    selects.forEach((select) => {
      dayData.push(select.value);
    });

    rosterData.push(dayData);
  });

  const transaction = db.transaction(["roster"], "readwrite");
  const objectStore = transaction.objectStore("roster");

  const data = {
    id: "october2024",
    month: "October 2024",
    data: rosterData,
    lastUpdated: new Date().toISOString(),
  };

  objectStore.put(data);
}

function loadFromDB() {
  if (!db) return;

  const transaction = db.transaction(["roster"], "readonly");
  const objectStore = transaction.objectStore("roster");
  const request = objectStore.get("october2024");

  request.onsuccess = () => {
    if (request.result) {
      const rosterData = request.result.data;
      const rows = document.querySelectorAll("#rosterBody tr");

      rows.forEach((row, rowIndex) => {
        if (rosterData[rowIndex]) {
          const selects = row.querySelectorAll("select");

          selects.forEach((select, selectIndex) => {
            if (rosterData[rowIndex][selectIndex]) {
              select.value = rosterData[rowIndex][selectIndex];
              select.dataset.previousValue = rosterData[rowIndex][selectIndex];

              const parentTd = select.closest("td");
              if (select.value === "O") {
                parentTd.classList.add("off-duty");
              } else {
                parentTd.classList.remove("off-duty");
              }
            }
          });
        }
      });
    }
  };
}

document.addEventListener("DOMContentLoaded", (event) => {
  initDB();
  saveRoster();
});
