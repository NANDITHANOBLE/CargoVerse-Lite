// FILE: frontend/js/footer.js
function renderFooter(targetId = "footer-root") {
  document.getElementById(targetId).innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo">${Icons.svg("logo", { size: 22 })} Cargo<span>Verse</span></a>
          <p>AI-powered cargo marketplace helping SMEs and exporters share, book, and optimize cargo space across global routes.</p>
          <form id="cv-newsletter-form" class="newsletter-form">
            <input type="email" id="cv-newsletter-email" placeholder="Your work email" required />
            <button type="submit" class="btn btn-primary">${Icons.svg("mail", { size: 16 })}</button>
          </form>
          <div class="footer-social">
            <a href="#" aria-label="Facebook">${Icons.svg("facebook", { size: 18 })}</a>
            <a href="#" aria-label="Twitter">${Icons.svg("twitter", { size: 18 })}</a>
            <a href="#" aria-label="LinkedIn">${Icons.svg("linkedin", { size: 18 })}</a>
            <a href="#" aria-label="Instagram">${Icons.svg("instagram", { size: 18 })}</a>
          </div>
        </div>

        <div>
          <h4>Platform</h4>
          <a href="marketplace.html">Marketplace</a>
          <a href="ai-tools.html">AI Tools</a>
          <a href="tracking.html">Tracking</a>
          <a href="provider-onboarding.html">Become a Provider</a>
        </div>

        <div>
          <h4>Company</h4>
          <a href="index.html#about">About Us</a>
          <a href="index.html#contact">Contact</a>
          <a href="index.html#pricing">Pricing</a>
        </div>

        <div>
          <h4>Get in touch</h4>
          <a href="mailto:hello@cargoverse.ai">${Icons.svg("mail", { size: 15 })} hello@cargoverse.ai</a>
          <a href="tel:+911234567890">${Icons.svg("phone", { size: 15 })} +91 12345 67890</a>
          <a href="#">${Icons.svg("mapPin", { size: 15 })} Chennai, India</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 CargoVerse Lite. All rights reserved.</span>
        <div class="footer-trust">
          ${Icons.svg("shield", { size: 14 })} Secure Payments &nbsp;·&nbsp; ${Icons.svg("check", { size: 14 })} Verified Providers
        </div>
      </div>
    </footer>
  `;

  const form = document.getElementById("cv-newsletter-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("cv-newsletter-email").value.trim();
    if (!email) return;
    showToast("Thanks for subscribing! Check your inbox soon.", "success");
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => renderFooter());