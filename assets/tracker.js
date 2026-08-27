
async function loadData(){
  const [cards,trades,config]=await Promise.all([
    fetch('/mtg/data/cards.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('/mtg/data/trades.json',{cache:'no-store'}).then(r=>r.json()),
    fetch('/mtg/data/config.json',{cache:'no-store'}).then(r=>r.json())
  ]);
  return {cards,trades,config};
}
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0));
const printing=c=>`${(c.set||'').toUpperCase()} #${c.collector_number||'?'} • ${c.finish||'?'} • ${(c.language||'en').toUpperCase()}`;
function stats(d){
  const owned=d.cards.filter(c=>['owned','deck'].includes(c.status));
  const val=owned.reduce((n,c)=>n+Number(c.current_value||0),0);
  const deck=d.cards.filter(c=>c.status==='deck').length;
  const orig=owned.filter(c=>c.origin==='starting').length;
  return [['Current Value',money(val)],['Trades',d.trades.length],['Deck Progress',`${deck} / ${d.config.deck_size||100}`],['Original Cards Left',orig]]
    .map(x=>`<div class="stat"><div class="label">${x[0]}</div><div class="value">${x[1]}</div></div>`).join('');
}
async function renderTradesPage(){
  const d=await loadData(); document.querySelector('#stats').innerHTML=stats(d);
  const byId=id=>d.cards.find(c=>c.id===id);
  document.querySelector('#content').innerHTML=d.trades.length?[...d.trades].reverse().map(t=>`<article class="trade"><strong>${t.id}</strong> · ${t.date||''}<div class="cols"><div><h3>Gave</h3><ul>${(t.gave||[]).map(id=>{const c=byId(id);return `<li>${c?`${c.name} — ${printing(c)} [${c.id}]`:id}</li>`}).join('')}</ul></div><div><h3>Received</h3><ul>${(t.received||[]).map(id=>{const c=byId(id);return `<li>${c?`${c.name} — ${printing(c)} [${c.id}]`:id}</li>`}).join('')}</ul></div></div><p>${money(t.gave_value)} → ${money(t.received_value)}${t.notes?` · ${t.notes}`:''}</p></article>`).join(''):'<div class="panel">No trades recorded yet.</div>';
}
async function renderDeckPage(){
  const d=await loadData(); document.querySelector('#stats').innerHTML=stats(d);
  const cards=d.cards.filter(c=>c.status==='deck');
  document.querySelector('#content').innerHTML=cards.length?cards.map(c=>`<article class="card">${c.image_url?`<img src="${c.image_url}" alt="${c.name}">`:''}<h3>${c.name}</h3><div class="meta">${c.id}<br>${printing(c)}<br>${c.condition||'—'} · ${money(c.current_value)}</div></article>`).join(''):'<div class="panel">No cards have been locked into the final deck yet.</div>';
}
