/**
 * projects.js — Parses projects.txt and renders project cards/detail pages
 * Sharath Schandra Kolli Portfolio
 */

// ─── PARSER ──────────────────────────────────────────────────
async function loadProjects() {
  try {
    const res = await fetch('projects.txt?t=' + Date.now());
    const text = await res.text();
    return parseProjects(text);
  } catch (e) {
    console.error('Could not load projects.txt:', e);
    return [];
  }
}

function parseProjects(text) {
  const projects = [];
  // Split by [project] blocks
  const blocks = text.split(/^\[project\]/m).filter(b => b.trim());

  for (const block of blocks) {
    const project = {};
    const lines = block.split('\n');

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;

      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;

      const key = line.substring(0, eqIdx).trim();
      const value = line.substring(eqIdx + 1).trim();

      if (key && value) {
        project[key] = value;
      }
    }

    if (project.name) {
      // Parse tech_stack into array
      if (project.tech_stack) {
        project.tech_array = project.tech_stack.split(',').map(t => t.trim()).filter(Boolean);
      } else {
        project.tech_array = [];
      }
      projects.push(project);
    }
  }

  return projects;
}

// ─── SKILLS LOADER ───────────────────────────────────────────
async function loadSkills() {
  try {
    const res = await fetch('skills.txt?t=' + Date.now());
    const text = await res.text();
    return parseSkills(text);
  } catch (e) {
    console.error('Could not load skills.txt:', e);
    return [];
  }
}

function parseSkills(text) {
  const skills = [];
  const blocks = text.split(/^\[skill\]/m).filter(b => b.trim());

  for (const block of blocks) {
    const skill = {};
    const lines = block.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('#') || !line.trim()) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.substring(0, eqIdx).trim();
      const value = line.substring(eqIdx + 1).trim();
      if (key && value) skill[key] = value;
    }
    if (skill.name) skills.push(skill);
  }
  return skills;
}

// Devicon icon URL builder
function deviconUrl(icon) {
  // Special cases
  const overrides = {
    flask: { url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg', invert: true },
  };
  if (overrides[icon]) return overrides[icon];
  return {
    url: `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`,
    invert: false
  };
}

async function renderSkills() {
  const grid = document.getElementById('tech-grid');
  if (!grid) return;

  const skills = await loadSkills();
  if (!skills.length) return;

  grid.innerHTML = '';

  skills.forEach(skill => {
    const badge = document.createElement('div');
    badge.className = 'tech-badge';

    let iconHTML = '';
    if (skill.icon) {
      const { url, invert } = deviconUrl(skill.icon);
      iconHTML = `<img src="${url}" alt="${skill.name}" style="${invert ? 'filter:invert(1)' : ''}" onerror="this.outerHTML='<span>⚡</span>'" />`;
    } else {
      iconHTML = '<span>⚡</span>';
    }

    badge.innerHTML = `${iconHTML}${skill.name}`;
    grid.appendChild(badge);
  });
}

// ─── SLUG HELPER ─────────────────────────────────────────────
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── RENDER PROJECT CARDS (index.html) ───────────────────────
async function renderProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Loading projects...</div>';

  const projects = await loadProjects();

  if (!projects.length) {
    grid.innerHTML = '<div class="loading">No projects found. Add some to projects.txt!</div>';
    return;
  }

  grid.innerHTML = '';

  projects.forEach((project, index) => {
    const slug = slugify(project.name);
    const hasImage = project.image && project.image !== 'none' && project.image !== '';

    const card = document.createElement('a');
    card.className = 'project-card reveal';
    card.href = `project.html?id=${slug}`;
    card.style.transitionDelay = `${index * 0.1}s`;

    const techTags = project.tech_array.slice(0, 3).map(t =>
      `<span class="tag">${t}</span>`
    ).join('');

    const moreCount = project.tech_array.length - 3;
    const moreBadge = moreCount > 0 ? `<span class="tag">+${moreCount}</span>` : '';

    const imageHTML = hasImage
      ? `<img class="project-card-image" src="${project.image}" alt="${project.name}" onerror="this.parentElement.innerHTML='<div class=\\'project-card-image-placeholder\\'>🚀</div>'">`
      : `<div class="project-card-image-placeholder">🚀</div>`;

    card.innerHTML = `
      ${imageHTML}
      <div class="project-card-arrow">↗</div>
      <div class="project-card-body">
        <div class="project-card-name">${project.name}</div>
        <div class="project-card-tagline">${project.tagline || ''}</div>
        <div class="project-card-tags">${techTags}${moreBadge}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Trigger scroll reveal for newly added cards
  setTimeout(initScrollReveal, 100);
}

// ─── RENDER PROJECT DETAIL (project.html) ────────────────────
async function renderProjectDetail() {
  const container = document.getElementById('project-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = '<div class="loading">No project specified.</div>';
    return;
  }

  const projects = await loadProjects();
  const project = projects.find(p => slugify(p.name) === id);

  if (!project) {
    container.innerHTML = `<div class="loading">Project not found. <a href="index.html" style="color:var(--accent)">← Go back</a></div>`;
    return;
  }

  // Update page title
  document.title = `${project.name} — Sharath Schandra Kolli`;

  const hasImage = project.image && project.image !== 'none' && project.image !== '';
  const hasVideo = project.video && project.video !== 'none' && project.video !== '';

  let mediaHTML = '';

  if (hasVideo) {
    if (project.video.includes('youtube.com') || project.video.includes('youtu.be')) {
      // YouTube Embed
      let videoId = '';
      if (project.video.includes('v=')) {
        videoId = project.video.split('v=')[1].split('&')[0];
      } else {
        videoId = project.video.split('/').pop();
      }
      mediaHTML = `
        <div class="detail-hero-video">
          <iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen style="border-radius:20px; border: 1px solid var(--glass-border);"></iframe>
        </div>`;
    } else {
      // Local Video
      mediaHTML = `
        <video class="detail-hero-image" controls style="max-height: 500px;">
          <source src="${project.video}" type="video/mp4">
          Your browser does not support the video tag.
        </video>`;
    }
  } else if (hasImage) {
    mediaHTML = `<img class="detail-hero-image" src="${project.image}" alt="${project.name}" onerror="this.outerHTML='<div class=\\'detail-hero-placeholder\\'>🚀</div>'">`;
  } else {
    mediaHTML = `<div class="detail-hero-placeholder">🚀</div>`;
  }

  const techBadges = project.tech_array.map(t =>
    `<span class="tag" style="font-size:0.85rem;padding:6px 14px">${t}</span>`
  ).join('');

  const githubBtn = project.github
    ? `<a href="${project.github}" target="_blank" class="btn-primary">⬡ GitHub</a>`
    : '';

  const liveBtn = project.live_url
    ? `<a href="${project.live_url}" target="_blank" class="btn-secondary">↗ Project Link</a>`
    : '';

  const postBtn = project.post_url
    ? `<a href="${project.post_url}" target="_blank" class="btn-secondary">⬡ Video/Post</a>`
    : '';

  let postEmbedHTML = '';
  if (project.post_url) {
    if (project.post_url.includes('youtube.com') || project.post_url.includes('youtu.be')) {
      let videoId = '';
      if (project.post_url.includes('v=')) {
        videoId = project.post_url.split('v=')[1].split('&')[0];
      } else {
        videoId = project.post_url.split('/').pop();
      }
      postEmbedHTML = `
        <div class="detail-section">
          <div class="detail-section-label">Video Demo</div>
          <div class="detail-hero-video" style="margin-top:15px">
            <iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen style="border-radius:15px; border: 1px solid var(--glass-border);"></iframe>
          </div>
        </div>`;
    } else if (project.post_url.includes('vimeo.com')) {
      const videoId = project.post_url.split('/').pop();
      postEmbedHTML = `
        <div class="detail-section">
          <div class="detail-section-label">Video Demo</div>
          <div class="detail-hero-video" style="margin-top:15px">
            <iframe src="https://player.vimeo.com/video/${videoId}" width="100%" height="400" 
              frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
              style="border-radius:15px; border: 1px solid var(--glass-border);"></iframe>
          </div>
        </div>`;
    } else if (project.post_url.includes('linkedin.com')) {
      // Extract the activity ID from the LinkedIn URL
      let activityId = '';
      const match = project.post_url.match(/activity-([0-9]+)/);
      if (match) {
        activityId = match[1];
        postEmbedHTML = `
          <div class="detail-section">
            <div class="detail-section-label">Related Post</div>
            <div class="detail-hero-video" style="margin-top:15px; background: white; border-radius: 15px; overflow: hidden;">
              <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:${activityId}" 
                height="600" width="100%" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
            </div>
          </div>`;
      }
    }
  }

  container.innerHTML = `
    <a href="index.html#projects" class="back-btn">← Back to Projects</a>

    ${mediaHTML}

    <div class="detail-name" style="margin-top: 30px;">${project.name}</div>
    <div class="detail-tagline">${project.tagline || ''}</div>

    ${project.details ? `
    <div class="detail-section">
      <div class="detail-section-label">About the Project</div>
      <div class="detail-section-content">${project.details}</div>
    </div>` : ''}

    ${postEmbedHTML}

    ${project.significance ? `
    <div class="detail-section">
      <div class="detail-section-label">Significance & Impact</div>
      <div class="detail-section-content">${project.significance}</div>
    </div>` : ''}

    ${project.contribution ? `
    <div class="detail-section">
      <div class="detail-section-label">My Contribution</div>
      <div class="detail-section-content">${project.contribution}</div>
    </div>` : ''}

    ${project.tech_array.length ? `
    <div class="detail-section">
      <div class="detail-section-label">Tech Stack</div>
      <div class="detail-tech-grid">${techBadges}</div>
    </div>` : ''}

    ${(githubBtn || liveBtn || postBtn) ? `
    <div class="detail-links">
      ${githubBtn}
      ${liveBtn}
      ${postBtn}
    </div>` : ''}
  `;
}

// ─── SCROLL REVEAL ────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── NAV SCROLL EFFECT ────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ─── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavScroll();
  initScrollReveal();
  renderSkills();
  renderProjectCards();
  renderProjectDetail();
});
