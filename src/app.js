import {inspectFile,csvOf} from './parser.js';
import {SOURCES,BANKS} from './layouts.js';
import {BANK_CONFIG} from './config.js';

const $=id=>document.getElementById(id);
function renderBankConfig(){
  const automatic=BANK_CONFIG.mode==='auto';
  const label=BANKS[BANK_CONFIG.bank]||'banco não configurado';
  $('bank-mode-heading').textContent=automatic?'Identificação automática':'Layout '+label+' ('+BANK_CONFIG.bank+')';
  $('bank-mode-description').textContent=automatic
    ?'Reconhece Itaú (341) e Bradesco (237) pelo cabeçalho'
    :'Modo fixo: somente arquivos do '+label;
  $('hero-description').textContent=automatic
    ?'Carregue uma remessa ou retorno CNAB 400 e visualize as 400 posições de cada registro com nomes claros, datas, valores, explicações e validações.'
    :'Carregue uma remessa ou retorno CNAB 400 do '+label+' e visualize as 400 posições de cada registro com nomes claros, datas, valores, explicações e validações.';
  $('bradesco-manual').hidden=!automatic && BANK_CONFIG.bank!=='237';
}
function showUploadError(message){
  const el=$('upload-error');
  el.textContent=message||'';
  el.hidden=!message;
}
let current=null, selected=0, allMode=false, fieldFilter='',hideFillers=false;
let fullWarnings=false;
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function formatBytes(bytes){return bytes<1024?bytes+' bytes':bytes<1024*1024?(bytes/1024).toFixed(1)+' KB':(bytes/1048576).toFixed(2)+' MB'}
function toast(text){const el=$('toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,3700)}
function save(content,name,type){
  const link=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));
  link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function baseName(){return (current?.name||'cnab400').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'_')}
function renderMeta(){
  $('filename').textContent=current.name;
  const values=[current.bankName+' ('+(current.bank||'—')+')',
    current.bankMode==='fixed'?'Banco fixo':'Detecção automática',
    current.flowName,'400 posições por registro',
    formatBytes(current.size),current.company].filter(Boolean);
  $('metadata').innerHTML=values.map(x=>'<span>'+escapeHTML(x)+'</span>').join('');
  const errors=current.issues.filter(x=>x.level==='error').length;
  const warnings=current.issues.filter(x=>x.level==='warning').length;
  const status=errors?'Problemas detectados':warnings?'Revisão necessária':current.supported?'Estrutura conferida':'Layout não coberto';
  const stat=[
    ['Total de registros',String(current.records.length).padStart(2,'0')],
    ['Títulos / transações',String(current.detailCount).padStart(2,'0')],
    ['Valor nominal somado',current.totalValue],
    ['Conferência estrutural',status]
  ];
  $('stats').innerHTML=stat.map(([label,value],index)=>'<div class="stat"><label>'+escapeHTML(label)+'</label><strong class="'+(index===3?(errors?'bad':warnings?'bad':'good'):'')+'">'+escapeHTML(value)+'</strong></div>').join('');
  let messages=current.issues;
  const remaining=Math.max(0,messages.length-12);
  if(!fullWarnings)messages=messages.slice(0,12);
  const explanation='<div class="notice">Leitura de conferência, não homologação bancária. Códigos e exigências variam por carteira e contrato. '+(SOURCES[current.bank]?'<a href="'+SOURCES[current.bank]+'" target="_blank" rel="noopener noreferrer">Consultar manual oficial ↗</a>':'')+'</div>';
  $('warnings').innerHTML=explanation+messages.map(item=>
    '<div class="notice '+escapeHTML(item.level)+'"><strong>'+(
      item.level==='error'?'Erro':item.level==='warning'?'Atenção':'Informação'
    )+(item.record?' · Registro '+item.record:'')+'</strong> · '+escapeHTML(item.message)+'</div>').join('')+
    (remaining&&!fullWarnings?'<button id="more-warnings" class="mini-button">Mostrar todos os '+current.issues.length+' alertas</button>':'');
}
function searchBlob(r){return [r.index,r.type,r.kind,r.raw,r.title?.document,r.title?.payer,r.title?.nosso].join(' ').toLocaleLowerCase('pt-BR')}
function visibleRecords(){
  const query=$('record-search').value.trim().toLocaleLowerCase('pt-BR');
  return current.records.filter(r=>!query||searchBlob(r).includes(query));
}
function renderNavigation(){
  const found=visibleRecords();
  $('nav-count').textContent=found.length+'/'+current.records.length;
  $('select-all').classList.toggle('active',allMode);
  $('select-single').classList.toggle('active',!allMode);
  $('record-list').innerHTML=found.length?found.map(r=>{
    const title=r.title;
    const caption=title?
      [title.document||title.nosso,title.payer].filter(Boolean).join(' · ') :r.kind;
    return '<button class="record-item '+(!allMode&&selected===r.index-1?'active':'')+'" data-record="'+(r.index-1)+'">'+
      '<span class="record-number">'+String(r.index).padStart(3,'0')+'</span>'+
      '<span class="record-content"><strong>'+escapeHTML(r.kind)+' <span style="color:#8092ac">· '+escapeHTML(r.type)+'</span></strong>'+
      '<small>'+escapeHTML(caption||r.kind)+'</small></span>'+(r.errors.length?'<span class="tiny-alert" title="Possui alertas">⚠</span>':'')+'</button>';
  }).join(''):'<div class="empty-list">Nenhum registro corresponde à busca.</div>';
}
function summaryFor(r){
  if(r.title){
    return [['Documento',r.title.document||'Não informado'],['Nosso Número',r.title.nosso||'Não informado'],
      ['Vencimento',r.title.due||'—'],['Valor nominal',r.title.amount||'—'],
      ['Pagador',r.title.payer||'Não informado'],['Registro',r.index+' / '+current.records.length]];
  }
  if(r.type==='0'){
    return [['Banco',current.bankName],['Operação',current.flowName],
      ['Empresa',current.company||'Não informada'],['Data do arquivo',current.date||'—'],
      ['Tamanho',r.byteLength+' bytes'],['Registro',r.index+' / '+current.records.length]];
  }
  return [['Tipo',r.type],['Natureza',r.kind],['Sequencial',r.sequence],
    ['Tamanho',r.byteLength+' bytes'],['Layout',r.known?'Mapeado':'Não mapeado'],['Registro',r.index+' / '+current.records.length]];
}
function fieldRows(r){
  const filter=fieldFilter.trim().toLocaleLowerCase('pt-BR');
  const grouped=new Map();
  r.fields.forEach(f=>{
    if(hideFillers&&f.format==='filler')return;
    if(filter && ![f.name,f.value,f.raw,f.group,String(f.start),String(f.end)].join(' ').toLocaleLowerCase('pt-BR').includes(filter))return;
    if(!grouped.has(f.group))grouped.set(f.group,[]);
    grouped.get(f.group).push(f);
  });
  if(!grouped.size)return '<div class="empty-list">Nenhum campo corresponde ao filtro.</div>';
  return Array.from(grouped,([group,fields])=>{
    const rows=fields.map(f=>
      '<tr class="'+(f.format==='filler'?'filler-row':'')+'">'+
      '<td><span class="field-pos">'+String(f.start).padStart(3,'0')+'–'+String(f.end).padStart(3,'0')+'</span></td>'+
      '<td>'+escapeHTML(f.name)+(f.note?'<div style="font-weight:400;color:#8994a6;font-size:10px">'+escapeHTML(f.note)+'</div>':'')+'</td>'+
      '<td>'+escapeHTML(f.value)+'</td>'+
      '<td><span class="field-raw" title="Valor literal de '+f.length+' posições">'+escapeHTML(f.raw.replaceAll(' ','·'))+'</span></td></tr>'
    ).join('');
    return '<section class="fields-group"><h3>'+escapeHTML(group)+' · '+fields.length+' campos</h3>'+
      '<table class="fields-table"><thead><tr><th>Posições</th><th>Campo</th><th>Interpretado</th><th>Bruto · espaços como ·</th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></section>';
  }).join('');
}
function rawBlock(r){
  const lines=[];
  for(let i=0;i<r.raw.length;i+=40){
    lines.push('<div class="raw-line"><span class="raw-offset">'+String(i+1).padStart(3,'0')+'–'+String(Math.min(i+40,r.raw.length)).padStart(3,'0')+'</span><span class="raw-value">'+escapeHTML(r.raw.slice(i,i+40).replaceAll(' ','·'))+'</span></div>');
  }
  return '<div class="raw-card"><h3>REGISTRO ORIGINAL · '+r.byteLength+' BYTES <span>400 posições</span></h3>'+
    '<div class="raw-lines">'+lines.join('')+'</div>'+
    '<p class="raw-note">Espaços aparecem como pontos centrais (·). A representação é apenas visual; o valor original não é alterado.</p></div>';
}
function renderRecord(r){
  const fieldsCount=r.fields.length;
  return '<div class="record-header"><div><div class="eyebrow">REGISTRO Nº '+String(r.index).padStart(3,'0')+' · TIPO '+escapeHTML(r.type)+'</div>'+
    '<h2>'+escapeHTML(r.kind)+'</h2><p>'+fieldsCount+' campos · '+r.byteLength+' bytes · sequencial '+escapeHTML(r.sequence)+'</p></div>'+
    '<span class="pill '+(r.known?'':'unknown')+'">'+(r.known?'✓ Layout identificado':'⚠ Layout não identificado')+'</span></div>'+
    '<div class="summary-grid">'+summaryFor(r).map(([label,value])=>'<div class="info-cell"><small>'+escapeHTML(label)+'</small><strong>'+escapeHTML(value)+'</strong></div>').join('')+'</div>'+
    fieldRows(r)+rawBlock(r);
}
function renderDetails(){
  const area=$('detail-area');
  if(allMode){
    const found=visibleRecords();
    area.innerHTML='<div class="detail-tools"><strong>Arquivo inteiro · '+found.length+' registros</strong><label><input type="checkbox" id="hide-fillers" '+(hideFillers?'checked':'')+'> Ocultar campos de preenchimento</label></div>'+
      '<div class="all-records">'+found.map(r=>'<article class="record-panel" id="registro-'+r.index+'">'+renderRecord(r)+'</article>').join('')+'</div>';
  }else{
    const r=current.records[selected];
    if(!r){area.innerHTML='<div class="empty-list">Selecione um registro.</div>';return}
    area.innerHTML= '<div class="detail-tools"><input class="field-search" id="field-search" type="search" placeholder="Buscar campo, posição ou valor..." aria-label="Buscar campos" value="'+escapeHTML(fieldFilter)+'">'+
      '<label><input type="checkbox" id="hide-fillers" '+(hideFillers?'checked':'')+'> Ocultar reservas</label>'+
      '<button class="mini-button" id="export-record">↓ Exportar registro CSV</button></div>'+renderRecord(r);
  }
}
function renderAll(){if(!current)return;renderMeta();renderNavigation();renderDetails()}
function route(){
  const viewing=Boolean(current)&&location.hash.startsWith('#/arquivo');
  $('upload-page').hidden=viewing;$('result-page').hidden=!viewing;
  if(viewing)renderAll();
}
async function readFile(file){
  if(!file)return;
  showUploadError('');
  try{
    if(file.size>25*1048576)throw Error('Arquivo acima de 25 MB.');
    current=await inspectFile(file);selected=0;allMode=false;fieldFilter='';hideFillers=false;fullWarnings=false;
    $('record-search').value='';$('file-input').value='';
    location.hash='#/arquivo';
    route();window.scrollTo({top:0,behavior:'instant'});
    toast('Arquivo analisado localmente: '+current.records.length+' registros.');
  }catch(error){
    const message='Não foi possível analisar: '+error.message;
    showUploadError(message);
    $('file-input').value='';
    toast(message);
  }
}
const drop=$('dropzone');
drop.addEventListener('click',event=>{
  if(event.target.closest('label') || event.target=== $('file-input'))return;
  $('file-input').click();
});
drop.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();$('file-input').click()}
});
drop.addEventListener('dragover',event=>{event.preventDefault();drop.classList.add('dragging')});
drop.addEventListener('dragleave',event=>{event.preventDefault();drop.classList.remove('dragging')});
drop.addEventListener('drop',event=>{event.preventDefault();drop.classList.remove('dragging');readFile(event.dataTransfer.files[0])});
$('file-input').addEventListener('change',event=>readFile(event.target.files[0]));
$('new-file').addEventListener('click',()=>{current=null;location.hash='#/';$('file-input').focus()});
$('record-search').addEventListener('input',()=>{if(current){renderNavigation();if(allMode)renderDetails()}});
$('record-list').addEventListener('click',event=>{
  const item=event.target.closest('[data-record]');if(!item||!current)return;
  selected=Number(item.dataset.record);allMode=false;fieldFilter='';renderNavigation();renderDetails();
  if(window.innerWidth<760)$('detail-area').scrollIntoView({behavior:'smooth'});
});
$('select-all').addEventListener('click',()=>{if(!current)return;allMode=true;renderNavigation();renderDetails()});
$('select-single').addEventListener('click',()=>{if(!current)return;allMode=false;renderNavigation();renderDetails()});
$('warnings').addEventListener('click',event=>{if(event.target.id==='more-warnings'){fullWarnings=true;renderMeta()}});
$('detail-area').addEventListener('input',event=>{
  if(event.target.id==='field-search'){
    fieldFilter=event.target.value;
    const caret=event.target.selectionStart;
    renderDetails();$('field-search')?.focus();$('field-search')?.setSelectionRange(caret,caret);
  }
  if(event.target.id==='hide-fillers'){hideFillers=event.target.checked;renderDetails()}
});
$('detail-area').addEventListener('click',event=>{
  if(event.target.id==='export-record' && current){
    save(csvOf(current,current.records[selected]),baseName()+'_registro_'+(selected+1)+'.csv','text/csv;charset=utf-8');
  }
});
$('export-csv').addEventListener('click',()=>{if(current)save(csvOf(current),baseName()+'_campos.csv','text/csv;charset=utf-8')});
$('export-json').addEventListener('click',()=>{
  if(current)save(JSON.stringify(current,null,2),baseName()+'_analise.json','application/json;charset=utf-8');
});
$('print-button').addEventListener('click',()=>{
  if(!current)return;const previous=allMode;allMode=true;renderNavigation();renderDetails();
  window.print();allMode=previous;renderNavigation();renderDetails();
});
window.addEventListener('hashchange',route);renderBankConfig();route();
