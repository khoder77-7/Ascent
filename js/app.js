// ============================================================
// Shared behavior across pages
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // ---- animate progress bars when visible ----
  const bars = document.querySelectorAll('.bar-fill[data-value]');
  if ('IntersectionObserver' in window && bars.length){
    const barIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const val = parseFloat(e.target.dataset.value) || 0;
          e.target.style.transform = `scaleX(${val/100})`;
          barIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => barIo.observe(b));
  }

  // ---- checklist toggling ----
  document.querySelectorAll('.check-row').forEach(row => {
    const box = row.querySelector('.check-box');
    if (!box) return;
    box.addEventListener('click', () => {
      row.classList.toggle('done');
      updateChecklistProgress(row.closest('[data-checklist-group]'));
    });
  });

  function updateChecklistProgress(group){
    if (!group) return;
    const rows = group.querySelectorAll('.check-row');
    const done = group.querySelectorAll('.check-row.done').length;
    const target = group.querySelector('[data-checklist-progress]');
    if (target) target.textContent = `${done}/${rows.length}`;
    const bar = group.querySelector('[data-checklist-bar]');
    if (bar) bar.style.transform = `scaleX(${rows.length ? done/rows.length : 0})`;
  }
  document.querySelectorAll('[data-checklist-group]').forEach(updateChecklistProgress);

  // ---- animated number counters ----
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const target = parseFloat(el.dataset.countTo);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const dur = 1200;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          const start = performance.now();
          function tick(now){
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent = prefix + val.toLocaleString(undefined, {minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });

  // ---- mobile nav toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks){
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

});

// ---- radar / spoke diagnostic chart (SVG) ----
// axes: [{label, value(0-100)}]
function renderRadar(svgEl, axes, opts = {}){
  const size = opts.size || 320;
  const cx = size/2, cy = size/2;
  const rMax = size * 0.34;
  const levels = opts.levels || 4;
  const n = axes.length;
  const angleFor = i => (Math.PI * 2 * i / n) - Math.PI/2;

  const pointAt = (i, frac) => {
    const a = angleFor(i);
    return [cx + Math.cos(a) * rMax * frac, cy + Math.sin(a) * rMax * frac];
  };

  let svg = `<svg viewBox="0 0 ${size} ${size+46}" xmlns="http://www.w3.org/2000/svg" class="radar-svg">`;

  // grid rings
  for (let l = 1; l <= levels; l++){
    const frac = l/levels;
    let pts = [];
    for (let i = 0; i < n; i++) pts.push(pointAt(i, frac).join(','));
    svg += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--border)" stroke-width="1"/>`;
  }
  // spokes
  for (let i = 0; i < n; i++){
    const [x,y] = pointAt(i, 1);
    svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
  }

  // data polygon
  let dataPts = axes.map((a,i) => pointAt(i, Math.max(0.04, a.value/100)));
  svg += `<polygon points="${dataPts.map(p=>p.join(',')).join(' ')}" fill="var(--brand)" fill-opacity="0.14" stroke="var(--brand)" stroke-width="2.5" stroke-linejoin="round" class="radar-poly"/>`;

  // data dots
  dataPts.forEach((p,i) => {
    svg += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--surface)" stroke="var(--brand)" stroke-width="2.5"/>`;
  });

  // labels
  axes.forEach((a,i) => {
    const [lx, ly] = pointAt(i, 1.32);
    svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${a.label}</text>`;
    const [vx, vy] = pointAt(i, 1.32);
    svg += `<text x="${vx}" y="${vy+15}" text-anchor="middle" class="radar-value">${a.value}</text>`;
  });

  svg += `</svg>`;
  svgEl.innerHTML = svg;
}

// ---- score ring (single value, Oura-style) ----
function renderRing(svgEl, value, opts = {}){
  const size = opts.size || 168;
  const stroke = opts.stroke || 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value/100);
  const color = opts.color || 'var(--brand)';
  const cx = size/2, cy = size/2;
  svgEl.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="ring-svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-sunken)" stroke-width="${stroke}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"
        transform="rotate(-90 ${cx} ${cy})" class="ring-progress" style="--target-offset:${offset}"/>
    </svg>`;
  requestAnimationFrame(() => {
    const p = svgEl.querySelector('.ring-progress');
    if (p) { p.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1)'; p.style.strokeDashoffset = offset; }
  });
}
