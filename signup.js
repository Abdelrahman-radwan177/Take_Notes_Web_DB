// تعريف العناصر
let firstName = document.getElementById("firstName");
let lastName = document.getElementById("lastName");
let CreateAcountButton = document.getElementById("CreateButton");
let createEmail = document.getElementById("createEmail");
let createPassword = document.getElementById("createPassword");
let formOfSingUp = document.getElementById("sinUp");
let errorMessageOfCreate = document.getElementById("errorOfSinIn");

// تسجيل مستخدم جديد
if (formOfSingUp !== null) {
  formOfSingUp.addEventListener("submit", async function (event) {
    event.preventDefault();
    firstName.value = firstName.value.trim();
    lastName.value = lastName.value.trim();
    createPassword.value = createPassword.value.trim();
    createEmail.value = createEmail.value.trim();

    // التحقق من صحة البيانات
    if (firstName.value === "" || lastName.value === "") {
      showError("Name Can't Be Space");
      return;
    } else if (createPassword.value.length < 8) {
      showError("Password Must Be At Least 8 Characters");
      return;
    }

    // إرسال البيانات للتحقق والتشفير
    try {
      let objForBackend = {
        password: createPassword.value,
        email: createEmail.value,
        firstName: firstName.value,
        lastName: lastName.value
      };
      let data = await sendDataForBackend(objForBackend);
      if (data["modeOfCreate"] === "ok") {
        createEmail.value = "";
        createPassword.value = "";
        firstName.value = "";
        lastName.value = "";
        alert("Registration Successful!");
        window.location = "./login.html";
      } else {
        showError(data["error"]);
      }
    } catch (error) {
      showError("An error occurred. Please try again.");
    }
  });
}

// إظهار رسالة الخطأ
function showError(message) {
  let er = document.getElementById("er");
  er.innerHTML = message;
  er.style.backgroundColor = "red";
  er.style.color = "white";
  er.style.padding = "10px";
  er.style.borderRadius = "5px";
  er.style.display = "block";
  er.style.marginBottom = "20px";
  setTimeout(() => {
    er.innerHTML = "";
    er.style.display = "none";
  }, 1500);
}

// إرسال البيانات للتحقق من كلمة المرور
async function sendDataForBackend(objForBackend) {
  try {
    let response = await fetch("signup.php", {
      method: "POST",
      body: JSON.stringify(objForBackend),
      headers: { "Content-Type": "application/json" }
    });

    let data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
