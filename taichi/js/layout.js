/** Scene + controller layout. Browser measurements win over the fallback budgets.
 * No viewport emulation is presented as a real phone or audio-device test.
 */
const installations=new WeakMap();
export function calculatePracticeLayout({width,height,focus=false,headerHeight=0,dockHeight=0,topInset=0,orientation='auto'}={}){
  width=Math.max(280,Number(width)||390);height=Math.max(160,Number(height)||700);
  const landscape=orientation==='landscape'||orientation==='auto'&&width>height,shortLandscape=landscape&&height<=600;
  const portraitPads=width<=560&&!landscape;
  const header=headerHeight>0?headerHeight:shortLandscape?50:93;
  const dock=dockHeight>0?dockHeight:shortLandscape?(height<=350?150:184):portraitPads?250:192;
  const sceneMinimum=shortLandscape?64:80;
  const reserved=focus?Math.max(4,topInset)+2:width>860?116:16;
  const available=Math.max(0,height-reserved);
  const minimum=header+dock+sceneMinimum;
  const constrained=available<minimum;
  const shellHeight=Math.max(minimum,Math.min(focus?available:790,available));
  return {width,height,landscape,shortLandscape,portraitPads,headerHeight:header,dockHeight:dock,sceneMinimum,shellHeight,sceneHeight:Math.max(sceneMinimum,shellHeight-header-dock),constrained,touchTarget:44};
}
export function initPracticeLayout({window:win=globalThis.window,document:doc=globalThis.document}={}){
  if(!win||!doc)return null;
  if(installations.has(doc))return installations.get(doc);
  const shell=doc.getElementById('practiceShell'),dock=doc.getElementById('controlDock');
  if(!shell||!dock)return null;
  const topbar=shell.querySelector('.practice-topbar'),studio=doc.querySelector('.studio');
  let scheduled=0,lastLayout=null,disposed=false;
  const raf=callback=>win.requestAnimationFrame?win.requestAnimationFrame(callback):win.setTimeout(callback,16);
  const cancel=id=>win.cancelAnimationFrame?win.cancelAnimationFrame(id):win.clearTimeout(id);
  function update(){
    scheduled=0;if(disposed)return;
    const viewport=win.visualViewport,focus=doc.body.classList.contains('practice-focus');
    const width=viewport?.width||win.innerWidth||390,height=viewport?.height||win.innerHeight||700;
    const topInset=focus&&studio?parseFloat(win.getComputedStyle(studio).paddingTop)||4:0;
    const headerHeight=topbar.getBoundingClientRect().height,dockHeight=dock.getBoundingClientRect().height;
    const orientation=win.matchMedia?win.matchMedia('(orientation: landscape)').matches?'landscape':'portrait':'auto';
    lastLayout=calculatePracticeLayout({width,height,focus,headerHeight,dockHeight,topInset,orientation});
    const pixels=Math.floor(height)+'px',shellPixels=Math.floor(lastLayout.shellHeight)+'px';
    if(doc.documentElement.style.getPropertyValue('--practice-viewport-height')!==pixels)doc.documentElement.style.setProperty('--practice-viewport-height',pixels);
    if(shell.style.height!==shellPixels)shell.style.height=shellPixels;
    shell.style.setProperty('--practice-scene-min-height',lastLayout.sceneMinimum+'px');
    doc.body.dataset.layoutConstrained=String(focus&&lastLayout.constrained);
    doc.body.dataset.layoutOrientation=lastLayout.landscape?'landscape':'portrait';
  }
  function refresh(){if(!disposed&&!scheduled)scheduled=raf(update);}
  const handlers=[['resize',refresh],['orientationchange',refresh]];
  for(const[event,fn]of handlers)win.addEventListener(event,fn);
  for(const event of ['resize','scroll'])win.visualViewport?.addEventListener?.(event,refresh);
  doc.addEventListener('focusin',refresh);doc.addEventListener('focusout',refresh);
  const mutation=win.MutationObserver?new win.MutationObserver(refresh):null;
  mutation?.observe(doc.body,{attributes:true,attributeFilter:['class']});
  const size=win.ResizeObserver?new win.ResizeObserver(refresh):null;
  size?.observe(topbar);size?.observe(dock);
  const api={refresh,get layout(){return lastLayout;},destroy(){
    disposed=true;if(scheduled)cancel(scheduled);
    for(const[event,fn]of handlers)win.removeEventListener(event,fn);
    for(const event of ['resize','scroll'])win.visualViewport?.removeEventListener?.(event,refresh);
    doc.removeEventListener('focusin',refresh);doc.removeEventListener('focusout',refresh);
    mutation?.disconnect();size?.disconnect();installations.delete(doc);
  }};
  installations.set(doc,api);update();return api;
}
export function openPracticeDetails(id,{window:win=globalThis.window,document:doc=globalThis.document}={}){
  const details=doc?.getElementById(id);if(!details||details.tagName!=='DETAILS')return false;
  // Use the existing button so app.js's focused state stays in sync with its CSS class.
  if(doc.body.classList.contains('practice-focus'))doc.getElementById('focusBtn')?.click();
  details.open=true;
  const reveal=()=>{details.scrollIntoView?.({block:'start',behavior:'smooth'});details.querySelector('summary')?.focus({preventScroll:true});};
  win?.requestAnimationFrame?win.requestAnimationFrame(reveal):reveal();
  return true;
}
