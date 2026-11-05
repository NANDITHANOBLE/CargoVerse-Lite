// FILE: frontend/js/login.js
const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
  renderParticles();

  const form = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const submitBtn = document.getElementById("loginSubmitBtn");

  // Icon injection
  document.getElementById("authHeadIcon").innerHTML = Icons.svg("lock", { size: 24 });
  document.getElementById("emailIcon").innerHTML = Icons.svg("mail", { size: 18 });
  document.getElementById("passwordIcon").innerHTML = Icons.svg("lock", { size: 18 });
  toggleBtn.innerHTML = Icons.svg("eye", { size: 18 });

  // If redirected here after a failed auth check, pre-fill remembered email
  const rememberedEmail = localStorage.getItem("cv_remember_email");
  if (rememberedEmail) {
    document.getElementById("email").value = rememberedEmail;
    document.getElementById("rememberMe").checked = true;
  }

  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.innerHTML = Icons.svg(isPassword ? "eyeOff" : "eye", { size: 18 });
  });

  form.addEventListener("submit", handleLogin);
});

async function handleLogin(e) {
  e.preventDefault();

  const errorBox = document.getElementById("authError");
  const errorText = document.getElementById("authErrorText");
  errorBox.classList.remove("show");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;
  const submitBtn = document.getElementById("loginSubmitBtn");

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  setLoading(submitBtn, true);

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Invalid email or password");
    }

    if (rememberMe) {
      localStorage.setItem("cv_remember_email", email);
    } else {
      localStorage.removeItem("cv_remember_email");
    }

    AuthState.login(data.access_token, data.user);
    showToast("Welcome back! Redirecting...", "success");

    const redirectTo = sessionStorage.getItem("cv_redirect_after_login");
    sessionStorage.removeItem("cv_redirect_after_login");

    setTimeout(() => {
      window.location.href = redirectTo || "dashboard.html";
    }, 600);
  } catch (err) {
    showError(err.message);
    setLoading(submitBtn, false);
  }

  function showError(message) {
    errorText.textContent = message;
    errorBox.classList.add("show");
  }
}

function setLoading(btn, isLoading) {
  btn.classList.toggle("btn-loading", isLoading);
  btn.disabled = isLoading;
}