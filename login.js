// تعريف العناصر
let formOfSinIn = document.getElementById("logIn");
let logINEmail = document.getElementById("logINEmail");
let logINPassword = document.getElementById("logINPassword");

// تسجيل الدخول
if (formOfSinIn !== null) {
  formOfSinIn.addEventListener("submit", async function (event) {
    event.preventDefault();

    // التحقق من صحة كلمة المرور
    try {
      let objForBackend = {
        enteredPassword: logINPassword.value,
        enteredEmail: logINEmail.value
      };
      let data = await sendDataForBackend(objForBackend);
      if (data["test"] === "true") {
        logINEmail.value = "";
        logINPassword.value = "";
        alert("Login Successful!");
        window.location.href = "./profile.html";
      } else if (data["test"] === "false") {
        logINPassword.value = "";
        showError("Email Or Password Is Wrong");
      } else {
        logINPassword.value = "";
        showError("Email Not Found");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  });
}

// إرسال البيانات للتحقق من كلمة المرور
async function sendDataForBackend(objForBackend) {
  try {
    let response = await fetch("login.php", {
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
