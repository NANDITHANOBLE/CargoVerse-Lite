function renderFooter(targetId = "footer-root") {
  document.getElementById(targetId).innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <h4>CargoVerse Lite</h4>
          <p>AI-powered cargo marketplace helping SMEs and exporters share, book, and optimize cargo space across global routes.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <a href="marketplace.html">Marketplace</a>
          <a href="ai-tools.html">AI Tools</a>
          <a href="tracking.html">Tracking</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="index.html#about">About</a>
          <a href="index.html#contact">Contact</a>
        </div>
        <div>
          <h4>Account</h4>
          <a href="login.html">Login</a>
          <a href="register.html">Get Started</a>
        </div>
      </div>
      <div class="footer-bottom">© 2026 CargoVerse Lite. All rights reserved.</div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => renderFooter());