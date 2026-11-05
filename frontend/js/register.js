// FILE: frontend/js/register.js
const API_BASE = "http://127.0.0.1:8000";
let selectedRole = "trader";

document.addEventListener("DOMContentLoaded", () => {
  renderParticles();

  // Icon injection
  document.getElementById("authHeadIcon").innerHTML = Icons.svg("user", { size: 24 });
  document.getElementById("nameIcon").innerHTML = Icons.svg("user", { size: 18 });
  document.getElementById("emailIcon").innerHTML = Icons.svg("mail", { size: 18 });
  document.getElementById("passwordIcon").innerHTML = Icons.svg("lock", { size: 18 });
  document.getElementById("confirmPasswordIcon").innerHTML = Icons.svg("lock", { size: 18 });

  document.getElementById("roleTraderIcon").innerHTML = Icons.svg("package", { size: 22 });
  document.getElementById("roleProviderIcon").innerHTML = Icons.svg("truck", { size: 22 });
  document.getElementById("roleAdminIcon").innerHTML = Icons.svg("shield", { size: 22 });

  const togglePwBtn = document.getElementById("togglePassword");
  const toggleConfirmBtn = document.getElementById("toggleConfirmPassword");
  togglePwBtn.innerHTML = Icons.svg("eye", { size: 18 });
  toggleConfirmBtn.innerHTML = Icons.svg("eye", { size: 18 });

  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  togglePwBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePwBtn.innerHTML = Icons.svg(isPassword ? "eyeOff" : "eye", { size: 18 });
  });

  toggleConfirmBtn.addEventListener("click", () => {
    const isPassword = confirmInput.type === "password";
    confirmInput.type = isPassword ? "text" : "password";
    toggleConfirmBtn.innerHTML = Icons.svg(isPassword ? "eyeOff" : "eye", { size: 18 });
  });

  passwordInput.addEventListener("input", () => updateStrengthMeter(passwordInput.value));

  document.querySelectorAll(".role-option").forEach((option) => {
    option.addEventListener("click", () => selectRole(option.dataset.role));
  });

  document.getElementById("registerForm").addEventListener("submit", handleRegister);
});

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll(".role-option").forEach((opt) => {
    opt.classList.toggle("selected", opt.dataset.role === role);
  });
}

function updateStrengthMeter(password) {
  const bars = document.querySelectorAll(".password-strength .bar");
  const label = document.getElementById("strengthLabel");

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  bars.forEach((bar, i) => {
    bar.className = "bar";
    if (i < score) {
      bar.classList.add(score <= 1 ? "weak" : score <= 2 ? "medium" : "strong");
    }
  });

  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
  label.textContent = password ? `Password strength: ${labels[score]}` : "";
}

async function handleRegister(e) {
  e.preventDefault();

  const errorBox = document.getElementById("authError");
  const errorText = document.getElementById("authErrorText");
  errorBox.classList.remove("show");

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;
  const submitBtn = document.getElementById("registerSubmitBtn");

  if (!fullName || !email || !password || !confirmPassword) {
    showError("Please fill in all fields.");
    return;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters long.");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  if (!agreeTerms) {
    showError("Please agree to the Terms of Service to continue.");
    return;
  }

  setLoading(submitBtn, true);

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        role: selectedRole,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed. Please try again.");
    }

    AuthState.login(data.access_token, data.user);
    showToast("Account created! Redirecting...", "success");

    setTimeout(() => {
      if (selectedRole === "provider") {
        window.location.href = "provider-onboarding.html";
      } else {
        window.location.href = "dashboard.html";
      }
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