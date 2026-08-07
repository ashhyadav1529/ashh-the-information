/* ---------------- State ---------------- */
let bookmarks = [];
let notes = [];
const STORAGE_OK = (function(){
  try{
    const k='__ashh_test__';
    localStorage.setItem(k,'1'); localStorage.removeItem(k);
    return true;
  }catch(e){ return false; }
})();

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ---------------- Storage ---------------- */
async function loadState(){
  if(!STORAGE_OK){ return; }
  try{
    const bm = localStorage.getItem('ashh_bookmarks');
    bookmarks = bm ? JSON.parse(bm) : [];
  }catch(e){ bookmarks = []; }
  try{
    const nt = localStorage.getItem('ashh_notes');
    notes = nt ? JSON.parse(nt) : [];
  }catch(e){ notes = []; }
}
async function persistBookmarks(){
  if(!STORAGE_OK) return;
  try{ localStorage.setItem('ashh_bookmarks', JSON.stringify(bookmarks)); }catch(e){}
}
async function persistNotes(){
  if(!STORAGE_OK) return;
  try{ localStorage.setItem('ashh_notes', JSON.stringify(notes)); }catch(e){}
}

function sourceKey(catId,name){ return catId+'::'+name; }
function isBookmarked(catId,name){ return bookmarks.some(b=>b.key===sourceKey(catId,name)); }
async function toggleBookmark(catId,name,d,u){
  const key = sourceKey(catId,name);
  const idx = bookmarks.findIndex(b=>b.key===key);
  if(idx>-1){ bookmarks.splice(idx,1); toast('Removed bookmark'); }
  else{ bookmarks.push({key,catId,name,d,u}); toast('Bookmarked'); }
  await persistBookmarks();
  renderAll();
}

/* ---------------- Rendering ---------------- */
function initials(name){
  return name.split(' ').filter(w=>w.length && /[A-Za-z]/.test(w[0])).slice(0,2).map(w=>w[0]).join('').toUpperCase() || '•';
}

function sourceCard(catId,s){
  const bm = isBookmarked(catId,s.n);
  return `<div class="source-card">
    <div class="sc-top">
      <div class="sc-logo">${initials(s.n)}</div>
      <div class="sc-title">
        <h4>${s.n}</h4>
        <div class="seal">✓ PRIMARY SOURCE</div>
      </div>
    </div>
    <div class="sc-desc">${s.d}</div>
    <div class="sc-actions">
      <a class="sc-visit" href="${s.u}" target="_blank" rel="noopener">Visit site ↗</a>
      <button class="sc-icon ${bm?'bookmarked':''}" onclick="toggleBookmark('${catId}','${s.n.replace(/'/g,"\\'")}','${s.d.replace(/'/g,"\\'")}','${s.u}')" title="Bookmark">${bm?'★':'☆'}</button>
      <button class="sc-icon" onclick="copyLink('${s.u}')" title="Copy link">⧉</button>
    </div>
  </div>`;
}

function copyLink(u){
  navigator.clipboard?.writeText(u).then(()=>toast('Link copied')).catch(()=>toast(u));
}

function renderPills(activeId){
  const row = document.getElementById('pillRow');
  row.innerHTML = `<span class="pill ${!activeId?'active':''}" onclick="navigate('home')">All</span>` +
    CATEGORIES.map(c=>`<span class="pill ${activeId===c.id?'active':''}" onclick="navigate('category','${c.id}')">${c.glyph} ${c.name}</span>`).join('');
}

function renderCatGrid(){
  document.getElementById('catGrid').innerHTML = CATEGORIES.map(c=>`
    <div class="cat-card" onclick="navigate('category','${c.id}')">
      <span class="glyph">${c.glyph}</span>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
      <span class="n">${c.sources.length} SOURCES</span>
    </div>`).join('');
  document.getElementById('statSources').textContent = CATEGORIES.reduce((a,c)=>a+c.sources.length,0);
}

const SAMPLE_NOTIFS = [
  {c:'Judiciary',t:'Supreme Court uploaded new judgments this week.',time:'2h ago'},
  {c:'Economy',t:'RBI released its latest Monetary Policy statement.',time:'1d ago'},
  {c:'Health',t:'WHO published a new global health report.',time:'2d ago'},
  {c:'Education',t:'Ministry of Education circulated a new policy note.',time:'3d ago'},
  {c:'Reports',t:'CAG tabled a fresh performance audit report.',time:'5d ago'},
];
function renderNotifs(){
  document.getElementById('notifList').innerHTML = SAMPLE_NOTIFS.map(n=>`
    <div class="notif-item">
      <span class="notif-dot"></span>
      <div class="notif-body"><b>${n.c}</b><p>${n.t}</p></div>
      <span class="notif-time">${n.time}</span>
    </div>`).join('');
}

function renderCategory(catId){
  const c = CATEGORIES.find(x=>x.id===catId);
  if(!c) return;
  document.getElementById('catGlyph').textContent = c.glyph;
  document.getElementById('catTitle').textContent = c.name;
  document.getElementById('catDesc').textContent = c.desc;
  document.getElementById('catSources').innerHTML = c.sources.map(s=>sourceCard(c.id,s)).join('');
}

function renderBookmarks(){
  document.getElementById('bmCount').textContent = bookmarks.length + ' saved';
  document.getElementById('statBookmarks').textContent = bookmarks.length;
  const grid = document.getElementById('bmGrid');
  if(!bookmarks.length){
    grid.innerHTML = '';
    grid.parentElement.querySelector('.empty-state')?.remove();
    grid.insertAdjacentHTML('afterend', `<div class="empty-state"><span class="glyph">🔖</span><p>Nothing bookmarked yet. Open a category and tap the star on any source to save it here.</p></div>`);
  } else {
    document.querySelector('#view-bookmarks .empty-state')?.remove();
    grid.innerHTML = bookmarks.map(b=>sourceCard(b.catId,{n:b.name,d:b.d,u:b.u})).join('');
  }
}

function renderNotes(){
  document.getElementById('noteCount').textContent = notes.length + ' notes';
  const grid = document.getElementById('notesGrid');
  if(!notes.length){
    grid.innerHTML = `<div class="empty-state"><span class="glyph">📝</span><p>No notes yet. Draft one on the left — it stays on this device.</p></div>`;
    return;
  }
  grid.innerHTML = notes.slice().reverse().map(n=>`
    <div class="note-card">
      <button class="note-del" onclick="deleteNote('${n.id}')">✕</button>
      <h4>${n.title || 'Untitled'}</h4>
      <div class="body">${n.body||''}</div>
      <div class="meta">${new Date(n.ts).toLocaleString()}</div>
    </div>`).join('');
}

async function saveNote(){
  const title = document.getElementById('noteTitle').value.trim();
  const body = document.getElementById('noteBody').value.trim();
  if(!title && !body){ toast('Write something first'); return; }
  notes.push({id:Date.now().toString(), title, body, ts:Date.now()});
  await persistNotes();
  document.getElementById('noteTitle').value='';
  document.getElementById('noteBody').value='';
  renderNotes();
  toast('Note saved');
}
async function deleteNote(id){
  notes = notes.filter(n=>n.id!==id);
  await persistNotes();
  renderNotes();
}

/* ---------------- Search ---------------- */
function allSourcesFlat(){
  const out=[];
  CATEGORIES.forEach(c=>c.sources.forEach(s=>out.push({cat:c.name,catId:c.id,...s})));
  return out;
}
const SEARCH_INDEX = allSourcesFlat();
document.getElementById('searchInput').addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  const box = document.getElementById('searchResults');
  if(!q){ box.classList.remove('open'); box.innerHTML=''; return; }
  const matches = SEARCH_INDEX.filter(s=>s.n.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q) || s.d.toLowerCase().includes(q)).slice(0,8);
  box.innerHTML = matches.length ? matches.map(m=>`
    <div class="search-result-item" onclick="navigate('category','${m.catId}');closeSearch();">
      <span class="sri-cat">${m.cat}</span><span class="sri-name">${m.n}</span>
    </div>`).join('') : `<div class="sri-empty">No matches for "${q}"</div>`;
  box.classList.add('open');
});
function closeSearch(){
  const box = document.getElementById('searchResults');
  box.classList.remove('open'); document.getElementById('searchInput').value='';
}
document.addEventListener('click', e=>{
  if(!e.target.closest('.search-wrap')) closeSearch();
});

/* ---------------- Router ---------------- */
function navigate(view, param){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  if(view==='home'){
    document.getElementById('view-home').classList.add('active');
    renderPills(null);
  } else if(view==='category'){
    renderCategory(param);
    document.getElementById('view-category').classList.add('active');
    renderPills(param);
  } else if(view==='bookmarks'){
    renderBookmarks();
    document.getElementById('view-bookmarks').classList.add('active');
    renderPills(null);
  } else if(view==='notes'){
    renderNotes();
    document.getElementById('view-notes').classList.add('active');
    renderPills(null);
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function showLoginNote(){
  toast('Accounts need a real backend — bookmarks & notes already save to this device');
}

function renderAll(){
  renderCatGrid();
  renderNotifs();
  renderBookmarks();
}

(async function init(){
  await loadState();
  renderPills(null);
  renderCatGrid();
  renderNotifs();
  document.getElementById('statBookmarks').textContent = bookmarks.length;
})();
