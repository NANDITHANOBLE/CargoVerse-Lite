// FILE: frontend/js/auth-state.js
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

  // NEW: returns the logged-in user's id, used by chat/notifications sockets
  function getUserId() {
    const user = getUser();
    return user ? user.id : null;
  }

  // NEW: guards a page. Redirects to login if not authenticated,
  // or to the dashboard if the role isn't permitted.
  // Returns true if the page may continue rendering.
  function requireAuth(allowedRoles = []) {
    if (!isLoggedIn()) {
      sessionStorage.setItem(
        "cv_redirect_after_login",
        window.location.pathname + window.location.search
      );
      window.location.href = "login.html";
      return false;
    }
    if (allowedRoles.length && !allowedRoles.includes(getRole())) {
      window.location.href = "dashboard.html";
      return false;
    }
    return true;
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

  return {
    login,
    logout,
    getToken,
    getUser,
    isLoggedIn,
    getRole,
    getUserId,
    requireAuth,
    authFetch,
  };
})();