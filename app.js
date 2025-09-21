/* Simple full-site app with Admin/settings & products stored in localStorage */

/* ---------- CONFIG KEYS ---------- */
const KEY = 'shoe_store_full_v1';
const SETTINGS_KEY = 'shoe_store_settings_v1';
const CART_KEY = 'shoe_store_cart_v1';

/* ---------- SAMPLE PRODUCTS (initial) ---------- */
const SAMPLE = [
  { id: 'p'+Date.now()+1, name: 'Classic White Sneakers', price: 59.99, stock: 12, category:'Sneakers', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop' },
  { id: 'p'+Date.now()+2, name: 'Brown Leather Boots', price: 129.99, stock: 6, category:'Boots', image: 'https://images.unsplash.com/photo-1528701800489-20b8b9a75e4a?q=80&w=800&auto=format&fit=crop' },
  { id: 'p'+Date.now()+3, name: 'Coastal Sandals', price: 29.50, stock: 20, category:'Sandals', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=800&auto=format&fit=crop' }
];

/* ---------- LOAD / SAVE ---------- */
function loadProducts(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw){ localStorage.setItem(KEY, JSON.stringify(SAMPLE)); return SAMPLE.slice(); }
    return JSON.parse(raw);
  }catch(e){ return SAMPLE.slice(); }
}
function saveProducts(list){ localStorage.setItem(KEY, JSON.stringify(list)); }

function loadSettings(){
  const s = JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
  return Object.assign({
    title: 'ShoeStore',
    tag: 'Modern shoes shop',
    primary: '#2563eb',
    bg: '#f6f8fb',
    text: '#0f172a',
    logo: ''
  }, s);
}
function saveSettings(s){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); applySettings(); }

/* ---------- STATE ---------- */
let products = loadProducts();
let cart = JSON.parse(localStorage.getItem(CART_KEY)||'[]');
let settings = loadSettings();

/* ---------- UI LINKS ---------- */
const app = document.getElementById('app');
const adminDrawer = document.getElementById('adminDrawer');
const logoImg = document.getElementById('logoImg');
const siteTitleEl = document.getElementById('siteTitle');
const siteTagEl = document.getElementById('siteTag');
const cartCount = document.getElementById('cartCount');

/* ---------- APPLY SETTINGS ---------- */
function applySettings(){
  settings = loadSettings();
  document.documentElement.style.setProperty('--primary', settings.primary);
  document.documentElement.style.setProperty('--bg', settings.bg);
  document.documentElement.style.setProperty('--text', settings.text);
  document.getElementById('settingTitle').value = settings.title || '';
  document.getElementById('settingTag').value = settings.tag || '';
  document.getElementById('settingPrimary').value = settings.primary || '#2563eb';
  document.getElementById('settingBg').value = settings.bg || '#f6f8fb';
  document.getElementById('settingText').value = settings.text || '#0f172a';
  document.getElementById('settingLogo').value = settings.logo || '';
  logoImg.src = settings.logo || 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"64\" height=\"64\"><rect rx=\"10\" height=\"64\" width=\"64\" fill=\"white\"/></svg>';
  siteTitleEl.innerText = settings.title || 'ShoeStore';
  siteTagEl.innerText = settings.tag || 'Modern shoes shop';
  document.body.style.background = settings.bg;
  document.body.style.color = settings.text;
  updateCartUI();
}
applySettings();

/* ---------- ROUTER / RENDER ---------- */
function route(path){
  if(path==='/' || path==='/home'){ renderHome(); }
  else if(path==='/shop'){ renderShop(); }
  else if(path==='/cart'){ renderCart(); }
  else renderShop();
  window.scrollTo({top:0,behavior:'smooth'});
}
route('/shop');

function renderHome(){
  app.innerHTML = `
    <section class="hero">
      <div class="hero-left">
        <div style="padding:12px;border-radius:12px;background:linear-gradient(180deg,rgba(0,0,0,0.03),transparent)">
          <h2>Welcome to ${settings.title}</h2>
          <p class="small">${settings.tag}</p>
          <div style="margin-top:12px">
            <button class="btn primary" onclick="route('/shop')">Shop Now</button>
          </div>
        </div>
      </div>
      <div class="hero-right">
        <!-- picks inserted by JS -->
      </div>
    </section>
    <section style="margin-top:14px">
      <h3>Featured</h3>
      <div id="featuredGrid" class="grid" style="margin-top:10px"></div>
    </section>
  `;
  const g = document.getElementById('featuredGrid');
  (products.slice(0,6)).forEach(p=>{
    g.innerHTML += productCardHTML(p);
  });
}

function renderShop(){
  app.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
      <div class="search"><input id="q" placeholder="Search products..." /></div>
      <select id="filterCat"><option value="">All Categories</option><option>Sneakers</option><option>Boots</option><option>Sandals</option><option>Formal</option></select>
      <select id="sortBy"><option value="">Sort</option><option value="price_asc">Price ↑</option><option value="price_desc">Price ↓</option></select>
    </div>
    <div id="grid" class="grid"></div>
  `;
  document.getElementById('q').addEventListener('input', renderGrid);
  document.getElementById('filterCat').addEventListener('change', renderGrid);
  document.getElementById('sortBy').addEventListener('change', renderGrid);
  renderGrid();
}

function renderGrid(){
  const q = (document.getElementById('q')?.value || '').toLowerCase();
  const cat = document.getElementById('filterCat')?.value;
  const sort = document.getElementById('sortBy')?.value;
  let list = products.filter(p => p.name.toLowerCase().includes(q) && (!cat || p.category===cat));
  if(sort==='price_asc') list.sort((a,b)=>a.price-b.price);
  if(sort==='price_desc') list.sort((a,b)=>b.price-a.price);
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  list.forEach(p => grid.innerHTML += productCardHTML(p));
}

function productCardHTML(p){
  return `
    <div class="card">
      <img src="${p.image||'https://via.placeholder.com/400x300'}" alt="${p.name}" />
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-meta">${p.category} • <strong>${format(p.price)}</strong></div>
        <div style="margin-top:auto;display:flex;gap:8px;align-items:center">
          <button class="btn" onclick="openProduct('${p.id}')">Details</button>
          <button class="btn primary" onclick="addToCart('${p.id}')">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

function renderCart(){
  let html = '<h3>Your Cart</h3><div class="card" style="padding:12px">';
  if(cart.length===0) html += '<p class="small">Cart is empty.</p>';
  else {
    cart.forEach(it=>{
      const p = products.find(x=>x.id===it.id);
      html += `<div style="display:flex;justify-content:space-between;padding:6px 0"><div>${p.name} × ${it.qty}</div><div>${format(p.price*it.qty)}</div></div>`;
    });
    const total = cart.reduce((s,i)=> s + (i.qty * (products.find(p=>p.id===i.id)?.price || 0)), 0);
    html += `<hr /><div style="display:flex;justify-content:space-between"><strong>Total</strong><strong>${format(total)}</strong></div>`;
    html += `<div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end"><button class="btn" onclick="clearCart()">Clear</button><button class="btn primary" onclick="checkout()">Checkout</button></div>`;
  }
  html += '</div>';
  app.innerHTML = html;
}

/* ---------- PRODUCT MODAL ---------- */
function openProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Missing product');
  const modal = document.getElementById('modal');
  const card = document.getElementById('modalCard');
  card.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:260px"><img src="${p.image}" style="width:100%;height:360px;object-fit:cover;border-radius:8px" /></div>
      <div style="width:320px">
        <h3>${p.name}</h3>
        <div class="small">Category: ${p.category} • Stock: ${p.stock}</div>
        <div style="font-weight:800;margin-top:12px">${format(p.price)}</div>
        <p style="color:var(--muted);margin-top:12px">High-quality shoes — comfortable and stylish.</p>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn" onclick="closeModal()">Close</button>
          <button class="btn primary" onclick="addToCart('${p.id}'); closeModal();">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
  modal.classList.add('open');
}
function closeModal(){ document.getElementById('modal').classList.remove('open'); }

/* ---------- CART ---------- */
function updateCartUI(){
  document.getElementById('cartCount').innerText = cart.reduce((s,i)=>s + i.qty, 0);
}
function addToCart(id){
  const it = cart.find(i=>i.id===id);
  if(it) it.qty++;
  else cart.push({id:id, qty:1});
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
  toast('Added to cart');
}
function clearCart(){ if(!confirm('Clear cart?')) return; cart=[]; localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); route('/cart'); }
function checkout(){ alert('Checkout simulated — thank you!'); cart=[]; localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); route('/shop'); }

/* ---------- ADMIN (drawer) ---------- */
function openAdmin(){
  adminDrawer.classList.add('open');
  refreshAdminList();
}
function closeAdmin(){ adminDrawer.classList.remove('open'); }

document.getElementById('settingLogoFile').addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('settingLogo').value = ev.target.result;
  };
  reader.readAsDataURL(f);
});

function saveSettings(){
  const s = {
    title: document.getElementById('settingTitle').value || 'ShoeStore',
    tag: document.getElementById('settingTag').value || 'Modern shoes shop',
    primary: document.getElementById('settingPrimary').value || '#2563eb',
    bg: document.getElementById('settingBg').value || '#f6f8fb',
    text: document.getElementById('settingText').value || '#0f172a',
    logo: document.getElementById('settingLogo').value || ''
  };
  saveSettingsLocal(s);
}

function saveSettingsLocal(s){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  applySettings();
  toast('Settings saved');
}

/* ---------- PRODUCTS CRUD ---------- */
let editingId = null;

document.getElementById('p_file').addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ev => { document.getElementById('p_img').value = ev.target.result; };
  r.readAsDataURL(f);
});

function clearProductForm(){
  editingId=null;
  document.getElementById('p_name').value='';
  document.getElementById('p_price').value='';
  document.getElementById('p_stock').value='';
  document.getElementById('p_img').value='';
  document.getElementById('p_cat').value='Sneakers';
  document.getElementById('saveProductBtn').innerText='Add Product';
}

function saveProduct(){
  const name = document.getElementById('p_name').value.trim();
  const price = parseFloat(document.getElementById('p_price').value) || 0;
  const stock = parseInt(document.getElementById('p_stock').value) || 0;
  const image = document.getElementById('p_img').value.trim();
  const category = document.getElementById('p_cat').value;
  if(!name) return alert('Enter product name');

  if(editingId){
    const p = products.find(x=>x.id===editingId);
    if(!p) return alert('Unknown product');
    p.name = name; p.price = price; p.stock = stock; p.image = image; p.category = category;
    toast('Product updated');
  } else {
    const id = 'p'+Math.random().toString(36).slice(2,9);
    products.unshift({id,name,price,stock,category,image});
    toast('Product added');
  }
  saveProducts(products);
  clearProductForm();
  refreshAdminList();
  renderGrid();
}

function refreshAdminList(){
  const list = document.getElementById('adminProductList');
  list.innerHTML = '';
  products.forEach(p=>{
    const div = document.createElement('div'); div.className='admin-item';
    div.innerHTML = `
      <img src="${p.image||'https://via.placeholder.com/120'}" />
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div class="small">${p.category} • ${format(p.price)} • Stock: ${p.stock}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn" onclick='editProduct("${p.id}")'>Edit</button>
        <button class="btn danger" onclick='deleteProduct("${p.id}")'>Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function editProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Not found');
  editingId = id;
  document.getElementById('p_name').value = p.name;
  document.getElementById('p_price').value = p.price;
  document.getElementById('p_stock').value = p.stock;
  document.getElementById('p_img').value = p.image;
  document.getElementById('p_cat').value = p.category;
  document.getElementById('saveProductBtn').innerText = 'Save Changes';
  window.scrollTo({top:0,behavior:'smooth'});
}

function deleteProduct(id){
  if(!confirm('Delete product?')) return;
  products = products.filter(x=>x.id!==id);
  saveProducts(products);
  refreshAdminList();
  renderGrid();
}

/* ---------- EXPORT / IMPORT / SAMPLES ---------- */
function exportProducts(){
  const data = JSON.stringify(products,null,2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download='products.json'; a.click();
  URL.revokeObjectURL(url);
}
function importProductsPrompt(){
  const txt = prompt('Paste products JSON array here (or click Cancel)');
  if(!txt) return;
  try{
    const arr = JSON.parse(txt);
    if(!Array.isArray(arr)) throw 'Not array';
    products = arr.map(x=>({
      id: x.id || ('p'+Math.random().toString(36).slice(2,9)),
      name: x.name || 'Untitled',
      price: parseFloat(x.price)||0,
      stock: parseInt(x.stock)||0,
      category: x.category||'Sneakers',
      image: x.image||''
    }));
    saveProducts(products);
    refreshAdminList();
    renderGrid();
    alert('Imported '+products.length+' products');
  }catch(e){ alert('Invalid JSON: '+e); }
}
function loadSample(){ products = SAMPLE.slice(); saveProducts(products); refreshAdminList(); renderGrid(); }

/* ---------- MISC ---------- */
function deleteAllProducts(){ if(!confirm('Delete ALL products?')) return; products=[]; saveProducts(products); refreshAdminList(); renderGrid(); }
function clearAllData(){ if(!confirm('Clear ALL data (products, settings, cart)?')) return; localStorage.removeItem(KEY); localStorage.removeItem(SETTINGS_KEY); localStorage.removeItem(CART_KEY); location.reload(); }

/* ---------- UTILS ---------- */
function format(n){ return '$'+Number(n).toFixed(2); }
function toast(msg){
  const t = document.createElement('div'); t.style.position='fixed'; t.style.left='50%'; t.style.transform='translateX(-50%)'; t.style.bottom='80px';
  t.style.background='rgba(16,24,40,0.9)'; t.style.color='white'; t.style.padding='8px 12px'; t.style.borderRadius='8px'; t.style.zIndex=9999; t.innerText = msg;
  document.body.appendChild(t); setTimeout(()=> t.style.opacity='0',1400); setTimeout(()=> t.remove(),2000);
}

/* ---------- INIT UI ---------- */
refreshAdminList();
applySettings();
renderGrid();
updateCartUI();

/* expose to window for buttons in HTML */
window.route = route;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
window.openProduct = openProduct;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.exportProducts = exportProducts;
window.importProductsPrompt = importProductsPrompt;
window.loadSample = loadSample;
window.clearAllData = clearAllData;
window.saveSettings = saveSettings;
window.saveProduct = saveProduct;
window.clearProductForm = clearProductForm;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
