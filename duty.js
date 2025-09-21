const dutyOptions = ["MD", "ED", "OT", "M", "E", "N", "O"];
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
    row += `<td><select>${dutyOptions
      .map((opt) => `<option value="${opt}">${opt}</option>`)
      .join("")}</select></td>`;
  });
  row += "</tr>";
  rosterBody.innerHTML += row;
});

function saveTimes() {
  const morning =
    document.getElementById("morningStart").value +
    " - " +
    document.getElementById("morningEnd").value;
  const evening =
    document.getElementById("eveningStart").value +
    " - " +
    document.getElementById("eveningEnd").value;
  const night =
    document.getElementById("nightStart").value +
    " - " +
    document.getElementById("nightEnd").value;
  alert(
    `Duty Times Saved:\nMorning: ${morning}\nEvening: ${evening}\nNight: ${night}`
  );
}
