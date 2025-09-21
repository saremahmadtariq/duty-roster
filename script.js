document.addEventListener("DOMContentLoaded", () => {
    const rosterBody = document.getElementById("rosterBody");
    const names = ["Dr Sharafat", "Sarem", "Sajid", "Aneeq", "Waqas", "Aqib", "Illyas", "Zohaib"];
    const dates = [
        "Wed 1/Oct", "Thu 2/Oct", "Fri 3/Oct", "Sat 4/Oct", "Sun 5/Oct",
        "Mon 6/Oct", "Tue 7/Oct", "Wed 8/Oct", "Thu 9/Oct", "Fri 10/Oct",
        "Sat 11/Oct", "Sun 12/Oct", "Mon 13/Oct", "Tue 14/Oct", "Wed 15/Oct",
        "Thu 16/Oct", "Fri 17/Oct", "Sat 18/Oct", "Sun 19/Oct", "Mon 20/Oct",
        "Tue 21/Oct", "Wed 22/Oct", "Thu 23/Oct", "Fri 24/Oct", "Sat 25/Oct",
        "Sun 26/Oct", "Mon 27/Oct", "Tue 28/Oct", "Wed 29/Oct", "Thu 30/Oct", "Fri 31/Oct"
    ];

    function renderRoster(rosterData) {
        rosterBody.innerHTML = "";
        dates.forEach((date, dateIndex) => {
            let row = `<tr><td>${date}</td>`;
            names.forEach((name, nameIndex) => {
                const duty = rosterData[dateIndex]?.[nameIndex]?.duty || "";
                const hours = rosterData[dateIndex]?.[nameIndex]?.hours || "";
                const isOvertime = hours > 10;
                row += `<td class="${isOvertime ? 'overtime' : ''}">
                    <div>${duty}</div>
                    <div>${hours}</div>
                </td>`;
            });
            row += "</tr>";
            rosterBody.innerHTML += row;
        });
    }

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

    // Wait for Firebase to load
    setTimeout(() => {
        loadFromFirebase();
    }, 1000);
});
