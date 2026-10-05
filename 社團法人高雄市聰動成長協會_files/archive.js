(() => {
  const input=document.getElementById('article-search');
  const rows=[...document.querySelectorAll('#article-list li')];
  input?.addEventListener('input',()=>{
    const query=input.value.trim().toLocaleLowerCase();let count=0;
    rows.forEach(row=>{row.hidden=!row.textContent.toLocaleLowerCase().includes(query);if(!row.hidden)count++;});
    document.getElementById('article-count').textContent=`共 ${count} 筆`;
  });
})();
