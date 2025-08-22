const apiUrlInput = document.getElementById('apiUrl');
const statusText = document.getElementById('statusText');

function getApiUrl(){ return localStorage.getItem('gas_api_url') || ''; }
function setApiUrl(url){ localStorage.setItem('gas_api_url', url); }

document.getElementById('saveUrlBtn').addEventListener('click', () => {
  const url = apiUrlInput.value.trim();
  if(!url){ statusText.textContent='URLを入力してください'; return; }
  setApiUrl(url);
  statusText.textContent='保存しました';
  loadAll();
});

document.getElementById('testBtn').addEventListener('click', async () => {
  const url = apiUrlInput.value.trim() || getApiUrl();
  if(!url){ statusText.textContent='URLを入力してください'; return; }
  try {
    const res = await fetch(url, { method:'GET', mode:'cors' });
    statusText.textContent = res.ok ? '接続OK' : `接続エラー: ${res.status}`;
  } catch(e){ statusText.textContent='接続失敗'; console.error(e); }
});

async function toBase64(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });
}

// Create
document.getElementById('createBtn').addEventListener('click', async ()=>{
  const api = getApiUrl();
  if(!api) return alert('API URLを設定してください');
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  let date = document.getElementById('date').value;
  if(!date) date = new Date().toISOString();
  const file = document.getElementById('userImage').files[0];
  const imageBase64 = file ? await toBase64(file) : '';

  const body = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}&imageBase64=${encodeURIComponent(imageBase64)}`;
  try{
    const res = await fetch(api, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body, mode:'cors' });
    const json = await res.json();
    document.getElementById('createMsg').textContent = JSON.stringify(json);
    loadAll();
  }catch(e){ console.error(e); document.getElementById('createMsg').textContent='追加失敗'; }
});

// Update
document.getElementById('updateBtn').addEventListener('click', async ()=>{
  const api = getApiUrl();
  const id = document.getElementById('uid').value;
  const name = document.getElementById('uname').value;
  const email = document.getElementById('uemail').value;
  let date = document.getElementById('udate').value;
  const file = document.getElementById('uimage').files[0];
  const imageBase64 = file ? await toBase64(file) : '';
  const body = `id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}&imageBase64=${encodeURIComponent(imageBase64)}`;
  try{
    const res = await fetch(api, { method:'PUT', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body, mode:'cors' });
    const json = await res.json();
    document.getElementById('updateMsg').textContent = JSON.stringify(json);
    loadAll();
  }catch(e){ console.error(e); document.getElementById('updateMsg').textContent='更新失敗'; }
});

// Delete
document.getElementById('deleteBtn').addEventListener('click', async ()=>{
  const api = getApiUrl();
  const id = document.getElementById('did').value;
  try{
    const res = await fetch(api, { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}), mode:'cors' });
    const json = await res.json();
    document.getElementById('deleteMsg').textContent = JSON.stringify(json);
    loadAll();
  }catch(e){ console.error(e); document.getElementById('deleteMsg').textContent='削除失敗'; }
});

// Load all
async function loadAll(){
  const api = getApiUrl();
  if(!api) return;
  try{
    const res = await fetch(api, { method:'GET', mode:'cors' });
    const list = await res.json();
    renderTable(list);
  }catch(e){ console.error(e); statusText.textContent='取得失敗'; }
}

// Table
function renderTable(list){
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML='';
  list.forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.id}</td><td>${row.name}</td><td>${row.email}</td><td>${row.date}</td><td>${row.imageUrl ? `<img src="${row.imageUrl}">` : ''}</td>`;
    tr.addEventListener('click', ()=>{
      document.getElementById('uid').value=row.id;
      document.getElementById('uname').value=row.name;
      document.getElementById('uemail').value=row.email;
      document.getElementById('udate').value=row.date ? new Date(new Date(row.date).getTime()-new Date(row.date).getTimezoneOffset()*60000).toISOString().slice(0,16) : '';
      document.getElementById('did').value=row.id;
    });
    tbody.appendChild(tr);
  });
}

document.getElementById('reloadBtn').addEventListener('click', loadAll);

// 初期化
(function init(){
  const saved = getApiUrl();
  if(saved) apiUrlInput.value = saved;
  const d = new Date();
  document.getElementById('date').value = new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  loadAll();
})();