(function(){
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  const search = document.getElementById('search');
  const yearFilter = document.getElementById('yearFilter');
  const list = document.getElementById('papersList');
  const tpl = document.getElementById('paperCardTpl');

  let all = [];

  async function load(){
    const res = await fetch('./data/papers.json');
    all = await res.json();
    const years = Array.from(new Set(all.map(p=>p.year).filter(Boolean))).sort((a,b)=>b-a);
    for(const y of years){
      const opt = document.createElement('option');
      opt.value = String(y); opt.textContent = String(y);
      yearFilter.appendChild(opt);
    }
    render();
  }

  function render(){
    const q = (search.value||'').toLowerCase();
    const yf = yearFilter.value;
    const filtered = all.filter(p=>{
      const matchesYear = yf ? String(p.year||'') === yf : true;
      const hay = [p.title,p.authors,p.keywords,p.abstract].map(s=>String(s||'').toLowerCase()).join(' ');
      const matchesQuery = q ? hay.includes(q) : true;
      return matchesYear && matchesQuery;
    });
    list.innerHTML = '';
    for(const p of filtered){
      const node = tpl.content.cloneNode(true);
      node.querySelector('.paper-title').textContent = p.title;
      node.querySelector('.paper-authors').textContent = p.authors||'Unknown';
      node.querySelector('.paper-year').textContent = p.year||'';
      node.querySelector('.paper-abs').textContent = p.abstract||'';
      const tags = (p.keywords||'').split(',').filter(Boolean).slice(0,5);
      const tagsEl = node.querySelector('.paper-tags');
      tags.forEach(t=>{
        const span = document.createElement('span'); span.className='chip'; span.textContent = t.trim(); tagsEl.appendChild(span);
      });
      const open = node.querySelector('.btn.primary');
      if(p.pdf){ open.href = p.pdf; } else { open.remove(); }
      list.appendChild(node);
    }
  }

  search.addEventListener('input', render);
  yearFilter.addEventListener('change', render);

  load();
})();

