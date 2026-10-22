// Centralized auth/session state used across every page
const AuthState = (() => {
  const TOKEN_KEY = "cv_token";
  const USER_KEY = "cv_user";

  function login(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("cv-auth-changed"));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("cv-auth-changed"));
    window.location.href = "login.html";
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function getRole() {
    const user = getUser();
    return user ? user.role : null;
  }

  // Attaches Authorization header automatically for API calls
  async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
  }

  return { login, logout, getToken, getUser, isLoggedIn, getRole, authFetch };
})();