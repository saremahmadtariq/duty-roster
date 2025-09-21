document.addEventListener("DOMContentLoaded", () => {
    const rosterBody = document.getElementById("rosterBody");
    const overtimeBody = document.getElementById("overtimeBody");
    const saveButton = document.getElementById("saveButton");
    const logoutButton = document.getElementById("logoutButton");

    const names = ["Dr Sharafat", "Sarem", "Sajid", "Aneeq", "Waqas", "Aqib", "Illyas", "Zohaib"];
    const dates = [
        "Wed 1/Oct", "Thu 2/Oct", "Fri 3/Oct", "Sat 4/Oct", "Sun 5/Oct",
        "Mon 6/Oct", "Tue 7/Oct", "Wed 8/Oct", "Thu 9/Oct", "Fri 10/Oct",
        "Sat 11/Oct", "Sun 12/Oct", "Mon 13/Oct", "Tue 14/Oct", "Wed 15/Oct",
        "Thu 16/Oct", "Fri 17/Oct", "Sat 18/Oct", "Sun 19/Oct", "Mon 20/Oct",
        "Tue 21/Oct", "Wed 22/Oct", "Thu 23/Oct", "Fri 24/Oct", "Sat 25/Oct",
        "Sun 26/Oct", "Mon 27/Oct", "Tue 28/Oct", "Wed 29/Oct", "Thu 30/Oct", "Fri 31/Oct"
    ];

    // Authentication check
    window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            console.log("User is signed in: ", user);
            loadFromFirebase();
        } else {
            // User is signed out
            window.location.href = "login.html";
        }
    });

    logoutButton.addEventListener("click", () => {
        window.firebaseSignOut(window.firebaseAuth).then(() => {
            // Sign-out successful.
            window.location.href = "index.html";
        }).catch((error) => {
            // An error happened.
            console.error("Sign out error: ", error);
        });
    });

    function renderRoster(rosterData) {
        rosterBody.innerHTML = "";
        dates.forEach((date, dateIndex) => {
            let row = `<tr><td>${date}</td>`;
            names.forEach((name, nameIndex) => {
                const duty = rosterData[dateIndex]?.[nameIndex]?.duty || "";
                const hours = rosterData[dateIndex]?.[nameIndex]?.hours || "";
                const isOvertime = hours > 10;
                row += `<td class="${isOvertime ? 'overtime' : ''}">
                    <input type="text" class="duty-input" value="${duty}" placeholder="Duty">
                    <input type="number" class="hours-input" value="${hours}" placeholder="Hours">
                </td>`;
            });
            row += "</tr>";
            rosterBody.innerHTML += row;
        });
        calculateOvertime();
    }

    function calculateOvertime() {
        overtimeBody.innerHTML = "";
        const overtime = {};
        names.forEach(name => overtime[name] = 0);

        const rows = document.querySelectorAll("#rosterBody tr");
        rows.forEach((row, dateIndex) => {
            const inputs = row.querySelectorAll(".hours-input");
            inputs.forEach((input, nameIndex) => {
                const hours = parseInt(input.value, 10) || 0;
                if (hours > 10) {
                    overtime[names[nameIndex]] += hours - 10;
                }
                if (hours > 10) {
                    input.parentElement.classList.add('overtime');
                } else {
                    input.parentElement.classList.remove('overtime');
                }
            });
        });

        for (const name in overtime) {
            const row = `<tr><td>${name}</td><td>${overtime[name]}</td></tr>`;
            overtimeBody.innerHTML += row;
        }
    }

    rosterBody.addEventListener('input', (e) => {
        if (e.target.classList.contains('hours-input')) {
            calculateOvertime();
        }
    });

    saveButton.addEventListener("click", () => {
        const rosterData = [];
        const rows = document.querySelectorAll("#rosterBody tr");
        rows.forEach((row, dateIndex) => {
            const dayData = [];
            const dutyInputs = row.querySelectorAll(".duty-input");
            const hoursInputs = row.querySelectorAll(".hours-input");
            dutyInputs.forEach((dutyInput, nameIndex) => {
                const hoursInput = hoursInputs[nameIndex];
                dayData.push({
                    duty: dutyInput.value,
                    hours: hoursInput.value
                });
            });
            rosterData.push(dayData);
        });

        const dbRef = window.firebaseRef(window.firebaseDB, 'dutyRoster/october2024');
        window.firebaseSet(dbRef, { roster: rosterData });
    });

    function loadFromFirebase() {
        const dbRef = window.firebaseRef(window.firebaseDB, 'dutyRoster/october2024');
        window.firebaseOnValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.roster) {
                renderRoster(data.roster);
            } else {
                renderRoster([]);
            }
        });
    }
});