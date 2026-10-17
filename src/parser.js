import { BANKS, DESCRIPTIONS, fieldsFor } from './layouts.js';

export const BYTES_PER_RECORD = 400;
const decoder = new TextDecoder('windows-1252');
const moneyFormatter = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const intFormatter = new Intl.NumberFormat('pt-BR');

function allZero(s){return /^0+$/.test(s);}
function asDate(s,format){
  if(!/^\d+$/.test(s) || allZero(s)) return null;
  let day,month,year;
  if(format==='date6' && s.length===6){
    day=Number(s.slice(0,2));month=Number(s.slice(2,4));
    const yy=Number(s.slice(4,6));year=yy<=79?2000+yy:1900+yy;
  } else if(format==='date8' && s.length===8){
    const looksYearFirst=Number(s.slice(0,4))>=1900 && Number(s.slice(0,4))<=2199;
    if(looksYearFirst){year=Number(s.slice(0,4));month=Number(s.slice(4,6));day=Number(s.slice(6,8));}
    else {day=Number(s.slice(0,2));month=Number(s.slice(2,4));year=Number(s.slice(4,8));}
  } else return null;
  const d = new Date(Date.UTC(year,month-1,day));
  return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day
    ? String(day).padStart(2,'0')+'/'+String(month).padStart(2,'0')+'/'+year : null;
}
const REM_OCCURRENCES = {
 '01':'Entrada de título / registro','02':'Pedido de baixa','03':'Abatimento','04':'Alteração de vencimento',
 '05':'Alteração de dados','06':'Alteração de outros dados','07':'Alteração de desconto','08':'Protesto',
 '09':'Sustação de protesto','10':'Não protestar','11':'Prorrogação / instrução',
 '31':'Alteração de outros dados','34':'Alteração / instrução'
};
const RET_OCCURRENCES = {
 '02':'Entrada confirmada','03':'Entrada rejeitada','06':'Liquidação / pagamento',
 '07':'Exclusão de cadastro confirmada','08':'Exclusão de cadastro rejeitada',
 '09':'Baixa automática','10':'Baixa por instrução','11':'Título pendente',
 '12':'Abatimento concedido','13':'Abatimento cancelado','14':'Vencimento alterado',
 '15':'Liquidação em cartório','17':'Liquidação após baixa',
 '19':'Instrução de protesto confirmada','20':'Sustação de protesto confirmada',
 '23':'Entrada em cartório','24':'Rejeição por CEP','27':'Baixa rejeitada',
 '28':'Tarifas / custas','29':'Ocorrência do pagador','30':'Alteração rejeitada',
 '31':'Inclusão de cadastro confirmada','32':'Instrução rejeitada',
 '33':'Alteração confirmada','40':'Estorno de pagamento'
};
const REGISTRATIONS={'01':'CPF','02':'CNPJ','1':'CPF','2':'CNPJ'};
const EMISSIONS={'1':'Banco emite o boleto','2':'Empresa emite o boleto'};
const SPECIES={'01':'Duplicata','02':'Nota promissória','03':'Nota de seguro','05':'Recibo','10':'Letra de câmbio','11':'Nota de débito','12':'Duplicata de serviços','31':'Cartão de crédito','32':'Boleto de proposta','33':'Depósito / aporte','99':'Outros'};
export function interpret(raw,format,context={}){
  const s=raw.trim();
  if(!s) return '—';
  if(format==='filler') return allZero(s) ? 'Zeros de preenchimento' : 'Reservado / preenchimento';
  if(format==='money' && /^\d+$/.test(s)) return moneyFormatter.format(Number(s)/100);
  if(format==='percent2' && /^\d+$/.test(s)) return (Number(s)/100).toLocaleString('pt-BR',{maximumFractionDigits:2})+'%';
  if(format==='number5' && /^\d+$/.test(s)) return (Number(s)/100000).toLocaleString('pt-BR',{maximumFractionDigits:5});
  if(format==='date6'||format==='date8') return allZero(s)?'Não informado':(asDate(s,format) || 'Data inválida: '+s);
  if(format==='integer' && /^\d+$/.test(s)) return intFormatter.format(Number(s));
  if(format==='registration') return REGISTRATIONS[s] ? s+' — '+REGISTRATIONS[s] : s;
  if(format==='accept') return s==='A'?'A — Aceite':s==='N'?'N — Não aceite':s;
  if(format==='emission') return EMISSIONS[s] ? s+' — '+EMISSIONS[s] : s;
  if(format==='occurrence') { const labels=context.flow==='ret'?RET_OCCURRENCES:REM_OCCURRENCES; return labels[s] ? s+' — '+labels[s] : s; }
  if(format==='species') return SPECIES[s] ? s+' — '+SPECIES[s] : s;
  if(format==='cep' && /^\d{8}$/.test(s)) return s.slice(0,5)+'-'+s.slice(5);
  return s;
}
function splitRecords(bytes) {
  let input=bytes;
  if(input.length>=3 && input[0]===0xef && input[1]===0xbb && input[2]===0xbf) input=input.subarray(3);
  // DOS EOF 0x1A é permitido depois do trailer.
  while(input.length && [10,13,26].includes(input[input.length-1])) input=input.subarray(0,-1);
  const hasEol=input.some(b=>b===10||b===13);
  if(!hasEol && input.length>400 && input.length%400===0){
    const result=[];
    for(let pos=0;pos<input.length;pos+=400)result.push(input.subarray(pos,pos+400));
    return { lines:result, separated:false };
  }
  const result=[]; let start=0;
  for(let i=0;i<input.length;i++){
    if(input[i]!==13 && input[i]!==10)continue;
    result.push(input.subarray(start,i));
    if(input[i]===13 && input[i+1]===10)i++;
    start=i+1;
  }
  if(start<input.length)result.push(input.subarray(start));
  if(result.length===0 && input.length)result.push(input);
  return { lines:result, separated:hasEol };
}
function notice(level,message,record=null){return {level,message,record};}
export function inspectBytes(input,name='arquivo.rem'){
  const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
  if(!bytes.length)throw new Error('Arquivo vazio.');
  if(bytes.byteLength > 25*1024*1024)throw new Error('Arquivo acima do limite de 25 MB.');
  if(bytes.some(b=>b===0))throw new Error('O arquivo contém bytes NUL; confirme se é um CNAB texto, e não um arquivo binário.');
  const split=splitRecords(bytes);
  if(!split.lines.length)throw new Error('Não foram encontrados registros.');
  const decoded=split.lines.map(line=>decoder.decode(line));
  const header=decoded[0]||'';
  const bank=header.slice(76,79);
  const flow=header[1]==='1'?'rem':header[1]==='2'?'ret':'unknown';
  const issues=[];
  if(!split.separated) issues.push(notice('info','Arquivo sem quebras de linha: registros separados em blocos de 400 bytes.'));
  if(header[0]!=='0')issues.push(notice('error','O primeiro registro não é um cabeçalho de tipo 0.',1));
  if(!BANKS[bank])issues.push(notice('warning','Código bancário '+(bank||'ausente')+' não possui layout cadastrado. Os dados serão exibidos sem identificação de campos.'));
  if(flow==='unknown')issues.push(notice('warning','Operação de arquivo não identificada (posição 002). Os campos serão exibidos sem layout de remessa/retorno.'));
  const records=decoded.map((line,index)=>{
    const type=line[0]||'?';
    const {known,fields:defs}=fieldsFor(bank,flow,type);
    const fields=defs.map(def=>{
      const raw=line.slice(def.start-1,def.end);
      return {...def, raw, value:interpret(raw,def.format), length:def.end-def.start+1};
    });
    const entry={index:index+1,type,kind:DESCRIPTIONS[type]||'Registro '+type,
      raw:line,byteLength:split.lines[index].byteLength,fields,known,
      sequence:line.slice(394,400),title:null,errors:[]};
    if(entry.byteLength!==400){
      const msg='Registro '+(index+1)+' possui '+entry.byteLength+' bytes, esperado 400.';
      issues.push(notice('error',msg,index+1));entry.errors.push(msg);
    }
    if(!known){
      const msg='Tipo '+type+' sem layout confirmado para '+(BANKS[bank]||'banco desconhecido')+' / '+(flow==='rem'?'remessa':flow==='ret'?'retorno':'operação desconhecida')+'. Não atribuí nomes especulativos aos campos.';
      issues.push(notice('warning',msg,index+1));entry.errors.push(msg);
    }
    if(/^\d{6}$/.test(entry.sequence) && Number(entry.sequence)!==index+1){
      const msg='Sequencial '+entry.sequence+' difere do registro '+(index+1)+'.';
      issues.push(notice('warning',msg,index+1));entry.errors.push(msg);
    }
    if(known)for(const field of fields){
      const s=field.raw.trim();
      if(!s||/^0+$/.test(s))continue;
      if(['money','integer','percent2','number5','date6','date8'].includes(field.format)&& !/^\d+$/.test(s)){
        const msg='Campo '+field.name+' ('+field.start+'–'+field.end+') contém caracteres não numéricos.';
        issues.push(notice('warning',msg,index+1));entry.errors.push(msg);
      }
      if((field.format==='date6'||field.format==='date8')&&/^\d+$/.test(s)&&!asDate(s,field.format)){
        const msg='Campo '+field.name+' contém data inválida.';
        issues.push(notice('warning',msg,index+1));entry.errors.push(msg);
      }
    }
    if(type==='1') {
      const field=fields.find(x=>x.name==='Número do documento');
      const pagador=fields.find(x=>x.name==='Nome do pagador');
      const nosso=fields.find(x=>x.name==='Nosso Número');
      const amount=fields.find(x=>x.name==='Valor do título');
      const due=fields.find(x=>x.name==='Vencimento');
      entry.title={document:field?.raw.trim()||'',payer:pagador?.raw.trim()||'',
        nosso:nosso?.raw.trim()||'',amount:amount?.value||'',due:due?.value||'',
        cents:amount&&/^\d{13}$/.test(amount.raw)?Number(amount.raw):0 };
    }
    return entry;
  });
  if(records.at(-1)?.type!=='9')issues.push(notice('error','O último registro não é um trailer de tipo 9.',records.length));
  const detailCount=records.filter(r=>r.type==='1').length;
  if(!detailCount)issues.push(notice('warning','Nenhum registro de título (tipo 1) encontrado.'));
  const amount=records.filter(r=>r.type==='1').reduce((sum,r)=>sum+(r.title?.cents||0),0);
  const typed={};
  for(const r of records)typed[r.type]=(typed[r.type]||0)+1;
  return {
    name,size:bytes.byteLength,bank,bankName:BANKS[bank]||'Banco não identificado',
    flow,flowName:flow==='rem'?'Remessa':flow==='ret'?'Retorno':'Não identificado',
    date:records[0]?.fields.find(f=>f.name==='Data de geração'||f.name==='Data de gravação')?.value||'',
    company:records[0]?.fields.find(f=>f.name==='Nome da empresa')?.raw.trim()||'',
    records,issues,detailCount,typed,
    totalValue:moneyFormatter.format(amount/100),
    validSize:records.every(r=>r.byteLength===400),
    supported:records.every(r=>r.known)&&!!BANKS[bank]&&flow!=='unknown'
  };
}
export async function inspectFile(file){
  if(!file || typeof file.arrayBuffer!=='function')throw Error('Selecione um arquivo CNAB.');
  const data=await file.arrayBuffer();
  return inspectBytes(data,file.name);
}
export function csvOf(result,onlyRecord=null){
  const rows=[['Registro','Tipo','Posição inicial','Posição final','Tamanho','Grupo','Campo','Valor interpretado','Valor bruto']];
  const records=onlyRecord?[onlyRecord]:result.records;
  for(const r of records) for(const f of r.fields)
    rows.push([r.index,r.type,f.start,f.end,f.length,f.group,f.name,f.value,f.raw]);
  return '\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(';')).join('\r\n');
}
