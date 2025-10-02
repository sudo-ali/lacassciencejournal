(function(){
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  const uploadForm = document.getElementById('uploadForm');
  if(uploadForm){
    const fileInput = document.getElementById('fileInput');
    const uploadZone = uploadForm.querySelector('.upload-zone');
    const statusEl = document.getElementById('uploadStatus');

    uploadZone.addEventListener('click',()=>fileInput.click());
    uploadZone.addEventListener('dragover',e=>{e.preventDefault(); uploadZone.style.borderColor = '#a277ff';});
    uploadZone.addEventListener('dragleave',()=>{uploadZone.style.borderColor = '#ffffff25';});
    uploadZone.addEventListener('drop',e=>{
      e.preventDefault();
      uploadZone.style.borderColor = '#ffffff25';
      const file = e.dataTransfer.files[0];
      if(file && file.type==='application/pdf') fileInput.files = e.dataTransfer.files;
    });

    uploadForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const formData = new FormData(uploadForm);
      const title = String(formData.get('title')||'').trim();
      const authors = String(formData.get('authors')||'').trim();
      const keywords = String(formData.get('keywords')||'').trim();
      const year = Number(formData.get('year'))||'';
      const abstract = String(formData.get('abstract')||'').trim();
      const file = document.getElementById('fileInput').files[0];
      if(!file){ statusEl.textContent = 'Please select a PDF file.'; return; }
      if(file.size > 25*1024*1024){ statusEl.textContent = 'File too large (max 25MB).'; return; }

      try{
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type:'application/pdf' });
        await window.LSJDB.addPaper({ title, authors, keywords, year, abstract, blob, filename: file.name });
        statusEl.textContent = 'Uploaded successfully!';
        uploadForm.reset();
        renderRecent();
      }catch(err){
        console.error(err);
        statusEl.textContent = 'Failed to store paper.';
      }
    });
  }

  async function renderRecent(){
    const recentList = document.getElementById('recentList');
    if(!recentList || !window.LSJDB) return;
    const papers = await window.LSJDB.recentPapers(6);
    recentList.innerHTML = papers.map(p=>{
      const tags = (p.keywords||'').split(',').filter(Boolean).slice(0,3).map(t=>`<span class="chip">${escapeHtml(t.trim())}</span>`).join('');
      return `
        <article class="card hover-float">
          <h3 style="margin:4px 0">${escapeHtml(p.title)}</h3>
          <div class="paper-sub">By ${escapeHtml(p.authors||'Unknown')} • ${escapeHtml(String(p.year||''))}</div>
          <div class="paper-tags">${tags}</div>
          <div style="margin-top:10px"><a class="btn small primary" href="/papers.html">Details</a></div>
        </article>`;
    }).join('');
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"] /g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"," ":"&nbsp;"}[s]));
  }

  renderRecent();
})();

