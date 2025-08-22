// —— 設定の保存/復元 ——
const apiUrlInput = document.getElementById('apiUrl');
const statusText = document.getElementById('statusText');

function getApiUrl(){ return localStorage.getItem('gas_api_url') || ''; }
function setApiUrl(url){ localStorage.setItem('gas_api_url', url); }

document.getElementById('saveUrlBtn').addEventListener('click', () => {
  const url = apiUrlInput.value.trim();
  if(!url){ statusText.textContent = 'URLを入力してください。'; return; }
  setApiUrl(url);
  statusText.textContent = '保存しました。';
  loadAll();
});

document.getElementById('testBtn').addEventListener('click', async () => {
  const url = apiUrlInput.value.trim() || getApiUrl();
  if(!url){ statusText.textContent = 'URLを入力してください。'; return; }
  try {
    const res = await fetch(url, { 
      method: 'POST',
      body: new URLSearchParams({ action:'read' })
    });
    statusText.textContent = res.ok ? '接続OK' : `接続エラー: ${res.status}`;
  } catch (e) {
    statusText.textContent = '接続に失敗しました。コンソールを確認してください。';
    console.error(e);
  }
});

// —— CRUD + 画像対応 ——
const createBtn = document.getElementById('createBtn');
const updateBtn = document.getElementById('updateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const reloadBtn = document.getElementById('reloadBtn');

async function toBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = err => reject(err);
  });
}

async function sendAction(params){
  const api = getApiUrl();
  if(!api) return alert('API URL を設定してください');

  try {
    const res = await fetch(api, {
      method:'POST',
      body: new URLSearchParams(params)
    });
    return await res.json();
  } catch(e){
    console.error(e);
    return {status:'error', message:e.message};
  }
}

// Create
createBtn.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  let date = document.getElementById('date').value || new Date().toISOString();

  const file = document.getElementById('userImage').files[0];
  let imageBase64 = '';
  if(file) imageBase64 = await toBase64(file);

  const json = await sendAction({ action:'create', name, email, date, imageBase64 });
  document.getElementById('createMsg').textContent = `追加: ${JSON.stringify(json)}`;
  loadAll();
});

// Update
updateBtn.addEventListener('click', async () => {
  const id = document.getElementById('uid').value.trim();
  const name = document.getElementById('uname').value.trim();
  const email = document.getElementById('uemail').value.trim();
  let date = document.getElementById('udate').value || new Date().toISOString();

  const file = document.getElementById('uimage').files[0];
  let imageBase64 = '';
  if(file) imageBase64 = await toBase64(file);

  const json = await sendAction({ action:'update', id, name, email, date, imageBase64 });
  document.getElementById('updateMsg').textContent = `更新: ${JSON.stringify(json)}`;
  loadAll();
});

// Delete
deleteBtn.addEventListener('click', async () => {
  const id = document.getElementById('did').value.trim();
  if(!id) return alert('id を入力してください');
  if(!confirm(`id=${id} を削除します。よろしいですか？`)) return;

  const json = await sendAction({ action:'delete', id });
  document.getElementById('deleteMsg').textContent = `削除: ${JSON.stringify(json)}`;
  loadAll();
});

// Load all
const tbody = document.querySelector('#table tbody');
const countEl = document.getElementById('count');

function toLocalTime(s){
  if(!s) return '';
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

function renderTable(list){
  tbody.innerHTML = '';
  countEl.textContent = `${list.length}件`;
  for(const row of list){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id ?? ''}</td>
      <td>${row.name ?? ''}</td>
      <td>${row.email ?? ''}</td>
      <td>${toLocalTime(row.date)}</td>
      <td>${row.imageUrl ? `<img src="${row.imageUrl}" style="width:50px;height:auto;">` : ''}</td>
    `;
    tr.addEventListener('click', () => {
      document.getElementById('uid').value = row.id ?? '';
      document.getElementById('uname').value = row.name ?? '';
      document.getElementById('uemail').value = row.email ?? '';
      document.getElementById('udate').value = row.date ? new Date(new Date(row.date).getTime()-new Date(row.date).getTimezoneOffset()*60000).toISOString().slice(0,16) : '';
      document.getElementById('did').value = row.id ?? '';
    });
    tbody.appendChild(tr);
  }
}

async function loadAll(){
  const json = await sendAction({ action:'read' });
  renderTable(Array.isArray(json) ? json : []);
}

reloadBtn.addEventListener('click', loadAll);

// 初期化
(function init(){
  const saved = getApiUrl();
  if(saved){ apiUrlInput.value = saved; loadAll(); }
  document.getElementById('date').value = new Date(new Date().getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
})();