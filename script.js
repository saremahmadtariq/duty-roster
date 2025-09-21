document.addEventListener("DOMContentLoaded", () => {
    const rosterBody = document.getElementById("rosterBody");
    const names = ["Dr Sharafat", "Sarem", "Sajid", "Aneeq", "Waqas", "Aqib", "Illyas", "Zohaib"];
    const dutyOptions = ["M", "E", "O", "M/E", "OT", "N"];
    let currentPeriod = "2024-10";
    let daysInCurrentMonth = 31;
    let dates = [];
    let isEditMode = false;
    
    // Initialize period
    initializePeriod();
    
    function initializePeriod() {
        const dutyPeriodInput = document.getElementById("dutyPeriod");
        const daysInput = document.getElementById("daysInMonth");
        
        dutyPeriodInput.value = currentPeriod;
        daysInput.value = daysInCurrentMonth;
        
        generateDates();
    }
    
    function generateDates() {
        dates = [];
        const [year, month] = currentPeriod.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[parseInt(month) - 1];
        
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const date = new Date(year, month - 1, i);
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayName = dayNames[date.getDay()];
            dates.push(`${dayName} ${i}/${monthName}`);
        }
    }

    function renderRoster(rosterData) {
        rosterBody.innerHTML = "";
        dates.forEach((date, dateIndex) => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-700 transition-colors duration-200';
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.className = 'px-4 py-3 font-medium border-b border-gray-600';
            dateCell.textContent = date;
            row.appendChild(dateCell);
            
            // Duty cells
            names.forEach((name, nameIndex) => {
                const duty = rosterData[dateIndex]?.[nameIndex] || "";
                const cell = document.createElement('td');
                cell.className = 'px-4 py-3 border-b border-gray-600 table-cell';
                
                if (isEditMode) {
                    const select = document.createElement('select');
                    select.className = 'duty-dropdown w-full';
                    select.innerHTML = `
                        <option value="">-</option>
                        ${dutyOptions.map(option => 
                            `<option value="${option}" ${duty === option ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    `;
                    
                    select.addEventListener('change', (e) => {
                        updateCellStyle(cell, e.target.value);
                    });
                    
                    cell.appendChild(select);
                } else {
                    cell.textContent = duty;
                }
                
                updateCellStyle(cell, duty);
                row.appendChild(cell);
            });
            
            rosterBody.appendChild(row);
        });
    }
    
    function updateCellStyle(cell, duty) {
        // Remove existing classes
        cell.classList.remove('off-duty', 'overtime');
        
        if (duty === 'O') {
            cell.classList.add('off-duty');
        } else if (duty === 'OT') {
            cell.classList.add('overtime');
        }
    }

    function loadFromFirebase() {
        const periodKey = currentPeriod.replace('-', '');
        const dbRef = window.firebaseRef(window.firebaseDB, `dutyRoster/${periodKey}`);
        window.firebaseOnValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.roster) {
                renderRoster(data.roster);
            } else {
                renderRoster([]);
            }
        });
    }
    
    // Global functions
    window.updatePeriod = function() {
        const dutyPeriodInput = document.getElementById("dutyPeriod");
        const daysInput = document.getElementById("daysInMonth");
        
        currentPeriod = dutyPeriodInput.value;
        daysInCurrentMonth = parseInt(daysInput.value);
        
        generateDates();
        
        // Update title
        const [year, month] = currentPeriod.split('-');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.querySelector('h1').textContent = `Interactive Duty Roster - ${monthNames[parseInt(month) - 1]} ${year}`;
        
        loadFromFirebase();
    };
    
    window.showPasswordModal = function() {
        const modal = document.getElementById("passwordModal");
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById("passwordInput").focus();
    };
    
    window.verifyPassword = function() {
        const password = document.getElementById("passwordInput").value;
        const errorElement = document.getElementById("passwordError");
        
        if (password === "Nokia108") {
            isEditMode = true;
            document.getElementById("passwordModal").classList.add('hidden');
            document.getElementById("passwordModal").classList.remove('flex');
            document.getElementById("editButton").classList.add('hidden');
            document.getElementById("autoButton").classList.remove('hidden');
            document.getElementById("saveButton").classList.remove('hidden');
            renderRoster([]);
            errorElement.textContent = "";
        } else {
            errorElement.textContent = "Incorrect password!";
        }
        document.getElementById("passwordInput").value = "";
    };
    
    window.autoAssignDuties = function() {
        // Simple auto-assignment logic
        const rosterData = [];
        dates.forEach((date, dateIndex) => {
            const dayData = [];
            names.forEach((name, nameIndex) => {
                const duties = ['M', 'E', 'N', 'O'];
                const randomDuty = duties[Math.floor(Math.random() * duties.length)];
                dayData.push(randomDuty);
            });
            rosterData.push(dayData);
        });
        renderRoster(rosterData);
    };
    
    window.saveRoster = function() {
        const rosterData = [];
        const rows = rosterBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const dayData = [];
            
            for (let i = 1; i < cells.length; i++) {
                const select = cells[i].querySelector('select');
                dayData.push(select ? select.value : '');
            }
            rosterData.push(dayData);
        });
        
        const periodKey = currentPeriod.replace('-', '');
        const dbRef = window.firebaseRef(window.firebaseDB, `dutyRoster/${periodKey}`);
        window.firebaseSet(dbRef, { roster: rosterData, period: currentPeriod, days: daysInCurrentMonth })
            .then(() => {
                alert('✅ Roster saved successfully!');
                isEditMode = false;
                document.getElementById("editButton").classList.remove('hidden');
                document.getElementById("autoButton").classList.add('hidden');
                document.getElementById("saveButton").classList.add('hidden');
                loadFromFirebase();
            })
            .catch(error => {
                alert('❌ Error saving roster: ' + error.message);
            });
    };

    // Wait for Firebase to load
    setTimeout(() => {
        loadFromFirebase();
    }, 1000);
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('passwordModal');
    if (event.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
});

// Enter key support for password input
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && document.getElementById('passwordModal').classList.contains('flex')) {
        verifyPassword();
    }
});