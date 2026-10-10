/* Classic, dependency-free bootstrap: reports failures instead of inert controls. */
(function () {
  var done=false, notice=document.getElementById('bootNotice');
  function failed(message) {
    if(done||!notice)return;
    notice.hidden=false;notice.className='boot-notice boot-error';
    notice.replaceChildren(document.createTextNode('遊戲未完成啟動 / Game could not start. '+message+' '));
    var link=document.createElement('a');link.href='docs/guide.html';link.textContent='修復步驟 / Help';notice.appendChild(link);
    var retry=document.createElement('button');retry.type='button';retry.textContent='重新載入 / Reload';retry.onclick=function(){location.reload()};notice.appendChild(retry);
  }
  window.addEventListener('smartaction-ready',function(){done=true;if(notice)notice.hidden=true;});
  window.addEventListener('error',function(e){
    if(e.target&&e.target.tagName==='SCRIPT')failed('Missing script: '+(e.target.getAttribute('src')||''));
    else if(!done)failed(String(e.message||'JavaScript error').slice(0,180));
  },true);
  window.setTimeout(function(){if(!window.SmartActionBooted)failed('請先完整解壓縮，保留 js、assets、vendor 等資料夾。Extract the full project before opening index.html.');},12000);
})();
