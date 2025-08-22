const apiUrl = 'https://script.google.com/macros/s/xxxxxxxxxx/exec'; // GAS WebアプリURL

const createBtn = document.getElementById('createBtn');
const reloadBtn = document.getElementById('reloadBtn');
const tbody = document.querySelector('#table tbody');
const countEl = document.getElementById('count');

createBtn.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  let date = document.getElementById('date').value;
  if(!date) date = new Date().toISOString();

  const file = document.getElementById('userImage').files[0];
  let imageBase64 = '';
  if(file) imageBase64 = await toBase64(file);

  const body = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}&imageBase64=${encodeURIComponent(imageBase64)}`;

  try {
    const res = await fetch(apiUrl, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body });
    const json = await res.json();
    document.getElementById('createMsg').textContent = `追加: ${JSON.stringify(json)}`;
    loadAll();
  } catch(e){
    console.error(e);
    document.getElementById('createMsg').textContent = '追加に失敗';
  }
});

reloadBtn.addEventListener('click', loadAll);

async function loadAll(){
  try {
    const res = await fetch(apiUrl, { method:'GET' });
    const list = await res.json();
    renderTable(list);
  } catch(e){
    console.error(e);
  }
}

function renderTable(list){
  tbody.innerHTML = '';
  countEl.textContent = `${list.length}件`;
  list.forEach(row=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.email}</td>
      <td>${row.date}</td>
      <td>${row.imageUrl ? `<img src="${row.imageUrl}">` : ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

function toBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = err=>reject(err);
  });
}

// 初期ロード
document.addEventListener('DOMContentLoaded', loadAll);