// تعريف العناصر
let LogOut = document.getElementById("LogOutButton");
let printName = document.getElementById("printName");
let formOFNewNote = document.getElementById("newNote");
let newNoteField = document.getElementById("newNoteField");
let allNotes = document.getElementById("allNotes");
let headerOfNotes = document.getElementById("headerOfNotes");
let page = document.querySelector("#page");
let main = document.getElementById("main");
let header = document.getElementById("header");
let outPage = document.getElementById("outPage");
let textArea = document.getElementById("textArea");
let cancelBtn = document.getElementById("cancel");
let msg = document.getElementById("error");
let btn = document.getElementById("up");

let arrayOfNotes = [];
let firstName, lastName;

// تحميل البيانات الأولية عند فتح الصفحة
loadInitialData();

async function loadInitialData() {
  let data = await sendDataForPhp({ action: "getUserData" });
  if (data["error"] === "register") {
    window.location.href = "./login.html"; // توجيه لتسجيل الدخول إذا لم يكن المستخدم مسجلًا
  } else {
    arrayOfNotes = JSON.parse(data["note"] || "[]");
    firstName = data["firstName"];
    lastName = data["lastName"];
    showNotes();
  }
}

// عرض الملاحظات
function showNotes() {
  printName.innerText = `${firstName} ${lastName}`;
  let notesHTML = arrayOfNotes
    .map(
      (note, index) => `
        <div>
            <p id="clock">${updateClock()}</p>
            <p>${note}</p>
            <input type="submit" value="Edit" onclick="showTextArea(${index})">
            <input type="submit" value="Delete" onclick="deleteNote(${index})">
        </div>
    `
    )
    .join("");
  allNotes.innerHTML = notesHTML;
  headerOfNotes.innerHTML =
    arrayOfNotes.length > 0
      ? `<h2>Your Notes</h2><input type="submit" value="Delete ALL" onclick="deleteAll()">`
      : "";
}

// إضافة ملاحظة جديدة
formOFNewNote.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (newNoteField.value.trim() !== "") {
    let data = await sendDataForPhp({
      action: "addNote",
      note: newNoteField.value.trim()
    });
    arrayOfNotes.push(data["note"]);
    await sendDataForPhp({
      action: "updateNotes",
      arr: JSON.stringify(arrayOfNotes)
    });
    newNoteField.value = "";
    showNotes();
  }
});

// حذف ملاحظة
async function deleteNote(id) {
  arrayOfNotes.splice(id, 1);
  await sendDataForPhp({
    action: "updateNotes",
    arr: JSON.stringify(arrayOfNotes)
  });
  showNotes();
}

// حذف جميع الملاحظات
async function deleteAll() {
  if (confirm("You Will Delete All Notes")) {
    arrayOfNotes = [];
    await sendDataForPhp({
      action: "updateNotes",
      arr: JSON.stringify(arrayOfNotes)
    });
    showNotes();
  }
}

// عرض نص الملاحظة للتعديل
let idOfUpdate = null;
function showTextArea(id) {
  idOfUpdate = id;
  main.classList.add("notactive");
  header.classList.add("notactive");
  outPage.classList.add("appear");
  textArea.value = arrayOfNotes[id];
  textArea.focus();
}

// إلغاء التعديل
cancelBtn.addEventListener("click", function () {
  main.classList.remove("notactive");
  header.classList.remove("notactive");
  outPage.classList.remove("appear");
});

// تحديث الملاحظة
btn.addEventListener("click", async function (e) {
  e.preventDefault();
  if (textArea.value.trim() === "") {
    showError("Please Write Your Note");
  } else {
    let data = await sendDataForPhp({
      action: "updateNote",
      note: textArea.value.trim()
    });
    arrayOfNotes[idOfUpdate] = data["note"];
    await sendDataForPhp({
      action: "updateNotes",
      arr: JSON.stringify(arrayOfNotes)
    });
    showNotes();
    cancelBtn.click();
  }
});
textArea.oninput = function () {
  msg.style.display = "none";
};
// تسجيل الخروج
LogOut.addEventListener("click", async function () {
  await sendDataForPhp({ action: "logOut", logOut: "true" });
  window.location.href = "./index.html";
});

// عرض رسالة خطأ
function showError(message) {
  msg.innerHTML = message;
  msg.innerHTML = "Please Write Your Note";
  msg.style.backgroundColor = "red";
  msg.style.color = "white";
  msg.style.padding = "10px";
  msg.style.borderRadius = "5px";
  msg.style.display = "block";
  msg.style.marginBottom = "20px";
}

// تحديث الوقت والتاريخ
function updateClock() {
  let now = new Date();
  let hours = now.getHours().toString().padStart(2, "0");
  let minutes = now.getMinutes().toString().padStart(2, "0");
  let day = now.getDate().toString().padStart(2, "0");
  let month = (now.getMonth() + 1).toString().padStart(2, "0");
  let year = now.getFullYear();
  return `📅 ${day}-${month}-${year} ${hours}:${minutes}`;
}

// إرسال البيانات إلى الخادم
async function sendDataForPhp(data) {
  try {
    let response = await fetch("profile.php", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
}
