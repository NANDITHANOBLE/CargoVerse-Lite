// FILE: frontend/js/icons.js
// Shared inline-SVG icon set. All icons use stroke="currentColor" so they
// inherit color from CSS, and accept a className for animation hooks.
const Icons = (() => {
  const paths = {
    logo: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    truck: '<rect x="1" y="7" width="13" height="10" rx="1"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="5.5" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/>',
    ship: '<path d="M3 15h18l-2 5H5z"/><path d="M6 15V8h8l3 7"/><path d="M12 8V3"/><path d="M9 3h6"/>',
    plane: '<path d="M21 16v-2l-8-5V4a2 2 0 1 0-4 0v5l-8 5v2l8-2.5V19l-3 2v1l5-1.5 5 1.5v-1l-3-2v-5.5z"/>',
    train: '<rect x="4" y="3" width="16" height="14" rx="2"/><path d="M4 11h16"/><path d="M8 17l-2 4M16 17l2 4"/><circle cx="8" cy="7" r="1"/><circle cx="16" cy="7" r="1"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h16"/><rect x="7" y="12" width="3" height="7"/><rect x="12" y="8" width="3" height="11"/><rect x="17" y="4" width="3" height="15"/>',
    shield: '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    chat: '<path d="M21 11.5a8.38 8.38 0 0 1-9.5 8.3A8.5 8.5 0 1 1 21 11.5z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    arrowRight: '<line x1="4" y1="12" x2="20" y2="12"/><polyline points="14 6 20 12 14 18"/>',
    star: '<path d="M12 2l3 6.5 7 .9-5 5 1.3 7-6.3-3.4L5.7 21.4 7 14.4l-5-5 7-.9z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/>',
    mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .3 2 .5 3 .7a2 2 0 0 1 1.7 2z"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    twitter: '<path d="M23 3a10.9 10.9 0 0 1-3.1 1.5A4.5 4.5 0 0 0 12 8v1A10.7 10.7 0 0 1 2 5s-4 9 5 13a11.6 11.6 0 0 1-7 2c9 5 20 0 20-11.5a4.4 4.4 0 0 0-.1-1A7.7 7.7 0 0 0 23 3z"/>',
    linkedin: '<rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/><path d="M10 9h4v2a4 4 0 0 1 4-2c3 0 4 2 4 5v7h-4v-6c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5v6h-4z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    sparkle: '<path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.06M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    package: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>'
  };

  function svg(name, { size = 20, className = "" } = {}) {
    const inner = paths[name] || "";
    return `<svg class="cv-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  }

  return { svg };
})();