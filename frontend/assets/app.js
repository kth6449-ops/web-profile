(() => {
  'use strict';

  // 편집 도구(새 글 작성 버튼·editor.html)는 내 컴퓨터의 로컬 미리 보기에서만 쓴다.
  // 배포된 사이트를 여는 방문자에게는 보이지 않게 한다.
  const isOwnerMachine = location.protocol === 'file:' ||
    ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (!isOwnerMachine) {
    if (document.body.dataset.page === 'editor') { location.replace('index.html'); return; }
    document.querySelectorAll('.write-link').forEach((link) => link.remove());
    document.querySelectorAll('[data-empty]').forEach((p) => {
      p.textContent = p.textContent.replace(/\s*새 글을 작성해보세요\.?/, '');
    });
  }

  const key = 'taehyun-personal-site-v3-posts';
  const published = Array.isArray(window.TAEHYUN_POSTS) ? window.TAEHYUN_POSTS : [];
  const categories = { thought: '생각', work: '일', data: '데이터' };
  const sections = { notes: '나의 생각', toolbox: '생각을 실현하기' };
  let drafts = [];
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(stored)) drafts = stored.filter((post) => post && typeof post.id === 'string');
  } catch (_) { /* 저장이 차단되어도 공개 글은 읽을 수 있습니다. */ }

  const node = (tag, className = '', value) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  };
  const allPosts = () => {
    const map = new Map(published.map((post) => [post.id, post]));
    drafts.forEach((post) => post.deleted ? map.delete(post.id) : map.set(post.id, post));
    return [...map.values()].filter((post) => sections[post.section])
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.id).localeCompare(String(b.id)));
  };
  const isLocal = (post) => drafts.some((item) => item.id === post.id);
  function safeUrl(raw) {
    try {
      const url = new URL(raw);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch (_) { return ''; }
  }
  function image(source, className, alt) {
    if (typeof source !== 'string' || !/^(images\/[a-z0-9-]+\.webp|data:image\/jpeg;base64,[a-z0-9+/=]+)$/i.test(source)) return null;
    const img = node('img', className);
    img.src = source; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
    return img;
  }
  function bodyInto(target, text) {
    let paragraph = [], list = null;
    const flush = () => {
      if (paragraph.length) target.append(node('p', '', paragraph.join('\n')));
      paragraph = []; list = null;
    };
    String(text || '').replace(/\r\n?/g, '\n').split('\n').forEach((line) => {
      const value = line.trim();
      if (!value) flush();
      else if (value.startsWith('## ')) { flush(); target.append(node('h2', '', value.slice(3))); }
      else if (value.startsWith('- ')) {
        if (paragraph.length) flush();
        if (!list) { list = node('ul'); target.append(list); }
        list.append(node('li', '', value.slice(2)));
      } else { list = null; paragraph.push(line); }
    });
    flush();
  }
  function article(post, preview = false) {
    const item = node('article', 'post-view');
    if (!preview) {
      const back = node('a', 'back-link', '← 글 목록으로 돌아가기');
      back.href = '#post-index'; item.append(back);
    }
    const time = node('time', 'post-date', String(post.date || '').replaceAll('-', '.'));
    time.dateTime = post.date || '';
    item.append(time, node('h2', 'post-title', post.title || '제목 없음'));
    if (!preview && isLocal(post)) item.append(node('p', 'post-draft', '이 브라우저에 저장된 글'));
    const cover = image(post.cover, 'post-cover', `${post.title || '게시글'} 대표 이미지`);
    if (cover) item.append(cover);
    const body = node('div', 'post-body'); bodyInto(body, post.body); item.append(body);
    const gallery = (Array.isArray(post.gallery) ? post.gallery : [])
      .map((src, i) => image(src, '', `첨부 이미지 ${i + 1}`)).filter(Boolean);
    if (gallery.length) {
      const wrap = node('div', 'post-gallery'); wrap.append(...gallery);
      item.append(node('h3', '', '첨부 이미지'), wrap);
    }
    const url = safeUrl(post.linkUrl);
    if (url) {
      const related = node('a', 'post-related', `${post.linkLabel || '관련 글 보기'} ↗`);
      related.href = url; related.target = '_blank'; related.rel = 'noopener noreferrer';
      item.append(related);
    }
    return item;
  }

  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    function menu(open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    }
    toggle.addEventListener('click', () => menu(!header.classList.contains('is-open')));
    header.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => menu(false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') menu(false); });
  }
  const portrait = document.querySelector('.portrait-button');
  portrait?.addEventListener('click', () => {
    portrait.classList.remove('is-moving'); void portrait.offsetWidth;
    portrait.classList.add('is-moving');
  });
  portrait?.addEventListener('animationend', () => portrait.classList.remove('is-moving'));

  // 긴 이야기 제목은 데스크톱에서 본문 폭에 맞춰 한 줄로 조절합니다.
  const storyTitle = document.querySelector('.story-intro h1');
  if (storyTitle) {
    const fitStoryTitle = () => {
      storyTitle.style.fontSize = '';
      storyTitle.style.whiteSpace = '';
      if (window.innerWidth <= 960) return;
      const available = storyTitle.clientWidth;
      const measured = storyTitle.scrollWidth;
      if (measured > available && available > 0) {
        const size = parseFloat(getComputedStyle(storyTitle).fontSize);
        const fitted = size * available / measured * 0.98;
        if (fitted >= 16) storyTitle.style.fontSize = `${fitted}px`;
        else storyTitle.style.whiteSpace = 'normal';
      }
    };
    window.addEventListener('resize', fitStoryTitle);
    if (document.fonts) document.fonts.ready.then(fitStoryTitle);
    fitStoryTitle();
  }

  const feed = document.querySelector('[data-feed]');
  if (feed) {
    const section = feed.dataset.feed, list = feed.querySelector('[data-post-list]');
    const empty = feed.querySelector('[data-empty]');
    const stage = document.querySelector('[data-article-stage]');
    const filters = [...feed.querySelectorAll('[data-tag]')];
    let filter = 'all';
    function renderList() {
      const posts = allPosts().filter((post) => post.section === section &&
        (filter === 'all' || post.category === filter));
      list.replaceChildren();
      posts.forEach((post) => {
        const card = node('li', 'post-card'), link = node('a', 'post-link');
        link.href = `#post-${encodeURIComponent(post.id)}`; link.dataset.postId = post.id;
        link.append(image(post.cover, 'post-thumb', `${post.title} 대표 이미지`) ||
          node('div', 'post-thumb post-thumb-placeholder', '기록'));
        const time = node('time', 'post-date', String(post.date).replaceAll('-', '.'));
        time.dateTime = post.date;
        link.append(time, node('h3', 'post-title', post.title), node('p', 'post-summary', post.excerpt));
        if (section === 'notes') {
          const tags = node('ul', 'post-tags');
          tags.append(node('li', '', categories[post.category] || '생각')); link.append(tags);
        }
        if (isLocal(post)) link.append(node('span', 'post-draft', '이 브라우저에 저장된 글'));
        card.append(link); list.append(card);
      });
      empty.hidden = posts.length > 0;
    }
    function renderHash() {
      let hash = '';
      try { hash = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
      const post = hash.startsWith('post-') ? allPosts().find((item) =>
        item.section === section && item.id === hash.slice(5)) : null;
      stage.hidden = !post; stage.replaceChildren();
      if (post) stage.append(article(post));
    }
    filters.forEach((button) => button.addEventListener('click', () => {
      filter = button.dataset.tag;
      filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      renderList();
    }));
    list.addEventListener('click', (event) => {
      const link = event.target.closest('[data-post-id]'); if (!link) return;
      event.preventDefault(); history.pushState(null, '', link.href);
      renderHash(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    stage.addEventListener('click', (event) => {
      if (!event.target.closest('.back-link')) return;
      event.preventDefault(); history.pushState(null, '', '#post-index');
      renderHash(); feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    window.addEventListener('popstate', renderHash);
    window.addEventListener('hashchange', renderHash);
    renderList(); renderHash();
  }

  const form = document.querySelector('#post-form');
  if (!form) return;
  const message = document.querySelector('[data-form-message]');
  const preview = document.querySelector('[data-preview-stage]');
  const editorList = document.querySelector('[data-editor-list]');
  const thumbnails = document.querySelector('[data-image-preview]');
  const requested = new URLSearchParams(location.search).get('section');
  const initialSection = sections[requested] ? requested : 'notes';
  const field = (name) => form.elements.namedItem(name);
  let images = { cover: '', gallery: [] };
  let imagesProcessing = 0;
  function status(text, error = false) {
    message.textContent = text; message.dataset.error = String(error);
  }
  function categoryVisibility() {
    document.querySelector('[data-category-field]').hidden = field('section').value !== 'notes';
  }
  function renderImages() {
    thumbnails.replaceChildren();
    [images.cover, ...images.gallery].forEach((src, index) => {
      const img = image(src, '', index ? `본문 이미지 ${index}` : '대표 이미지');
      if (!img) return;
      const figure = node('figure'); figure.append(img, node('figcaption', '', index ? `본문 ${index}` : '대표 이미지'));
      thumbnails.append(figure);
    });
  }
  function reset(section = initialSection) {
    form.reset(); field('id').value = ''; field('section').value = section;
    field('date').value = new Date().toLocaleDateString('sv-SE');
    images = { cover: '', gallery: [] }; categoryVisibility(); renderImages();
    preview.hidden = true; status('');
  }
  function inputPost() {
    const linkUrl = field('linkUrl').value.trim();
    if (linkUrl && !safeUrl(linkUrl)) throw new Error('관련 URL은 https:// 또는 http:// 주소로 입력해 주세요.');
    return {
      id: field('id').value || `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      section: field('section').value, date: field('date').value,
      title: field('title').value.trim(), excerpt: field('excerpt').value.trim(),
      category: field('category').value, body: field('body').value.trim(),
      cover: images.cover, gallery: [...images.gallery],
      linkLabel: field('linkLabel').value.trim(), linkUrl: linkUrl ? safeUrl(linkUrl) : ''
    };
  }
  function renderEditorList() {
    editorList.replaceChildren();
    allPosts().forEach((post) => {
      const item = node('li');
      const edit = node('button', '', `${post.title || '제목 없음'} 수정`);
      edit.type = 'button'; edit.dataset.edit = post.id;
      const remove = node('button', 'delete-post', '삭제');
      remove.type = 'button'; remove.dataset.delete = post.id;
      item.append(edit, node('small', '', `${sections[post.section]} · ${post.date}${isLocal(post) ? ' · 브라우저 저장' : ''}`), remove);
      editorList.append(item);
    });
  }
  function save(post) {
    const next = drafts.filter((item) => item.id !== post.id); next.push(post);
    try { localStorage.setItem(key, JSON.stringify(next)); drafts = next; return true; }
    catch (_) { status('저장 공간이 부족하거나 차단되었습니다. 이미지를 줄이거나 브라우저 설정을 확인해 주세요.', true); return false; }
  }
  function load(post) {
    reset(post.section);
    ['id','section','date','title','excerpt','category','body','linkLabel','linkUrl'].forEach((name) => {
      field(name).value = post[name] || '';
    });
    images = { cover: post.cover || '', gallery: Array.isArray(post.gallery) ? [...post.gallery] : [] };
    categoryVisibility(); renderImages();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    status('기존 글을 불러왔습니다. 수정 후 저장하고 게시 파일을 다시 내려받아 주세요.');
  }
  function compress(file, maximum) {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
        reject(new Error('JPG, PNG, WebP 이미지만 업로드할 수 있습니다.')); return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('이미지는 한 장에 10MB 이하로 선택해 주세요.')); return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
      reader.onload = () => {
        const photo = new Image();
        photo.onerror = () => reject(new Error('이미지를 열지 못했습니다.'));
        photo.onload = () => {
          const ratio = Math.min(1, maximum / Math.max(photo.width, photo.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(photo.width * ratio));
          canvas.height = Math.max(1, Math.round(photo.height * ratio));
          const context = canvas.getContext('2d');
          if (!context) { reject(new Error('이미지 처리 기능을 사용할 수 없습니다.')); return; }
          context.fillStyle = '#fffefa'; context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(photo, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', .78));
        };
        photo.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  field('section').addEventListener('change', categoryVisibility);
  field('cover').addEventListener('change', async () => {
    const file = field('cover').files[0]; if (!file) return;
    imagesProcessing += 1;
    try { images.cover = await compress(file, 1400); renderImages(); status('대표 이미지를 준비했습니다.'); }
    catch (error) { status(error.message, true); field('cover').value = ''; }
    finally { imagesProcessing -= 1; }
  });
  field('gallery').addEventListener('change', async () => {
    const files = [...field('gallery').files];
    if (files.length > 4) { status('본문 이미지는 한 글에 최대 4장입니다.', true); field('gallery').value = ''; return; }
    if (!files.length) return;
    imagesProcessing += 1;
    try { images.gallery = await Promise.all(files.map((file) => compress(file, 1200))); renderImages(); status('본문 이미지를 준비했습니다.'); }
    catch (error) { status(error.message, true); field('gallery').value = ''; }
    finally { imagesProcessing -= 1; }
  });
  document.querySelector('[data-reset-form]').addEventListener('click', () => reset(field('section').value));
  document.querySelector('[data-preview]').addEventListener('click', () => {
    if (imagesProcessing) { status('이미지를 준비하는 중입니다. 잠시 뒤 다시 눌러주세요.', true); return; }
    if (!form.reportValidity()) return;
    try {
      preview.replaceChildren(node('h2', '', '미리 보기'), article(inputPost(), true));
      preview.hidden = false; preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
      status('미리 보기는 아직 저장되지 않았습니다.');
    } catch (error) { status(error.message, true); }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (imagesProcessing) { status('이미지를 준비하는 중입니다. 잠시 뒤 다시 눌러주세요.', true); return; }
    if (!form.reportValidity()) return;
    try {
      const post = inputPost(); if (!save(post)) return;
      field('id').value = post.id; renderEditorList();
      status('이 브라우저에 저장했습니다. 모든 방문자에게 보이려면 게시 파일을 내려받아 사이트에 반영해 주세요.');
    } catch (error) { status(error.message, true); }
  });
  editorList.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit]');
    const deletion = event.target.closest('[data-delete]');
    if (edit) {
      const post = allPosts().find((item) => item.id === edit.dataset.edit);
      if (post) load(post);
    }
    if (deletion) {
      const post = allPosts().find((item) => item.id === deletion.dataset.delete);
      if (!post || !confirm(`‘${post.title}’ 글을 삭제하시겠습니까?`)) return;
      if (save({ id: post.id, deleted: true })) {
        renderEditorList(); reset(post.section);
        status('이 브라우저에서 삭제했습니다. 사이트에도 반영하려면 게시 파일을 다시 내려받으세요.');
      }
    }
  });
  document.querySelector('[data-export]').addEventListener('click', () => {
    const content = `/* 김태현 개인 웹페이지 게시글 */\nwindow.TAEHYUN_POSTS = ${JSON.stringify(allPosts(), null, 2)};\n`;
    const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = node('a');
    link.href = url; link.download = 'posts.js'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('posts.js를 내려받았습니다. 사이트의 assets/posts.js를 교체한 뒤 다시 게시해 주세요.');
  });
  reset(); renderEditorList();
})();
