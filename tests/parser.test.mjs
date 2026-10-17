import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectBytes, interpret, csvOf } from '../src/parser.js';
import { fieldsFor, LAYOUTS } from '../src/layouts.js';

// Testes usam dados artificiais para não publicar dados bancários privados.
const set=(line,from,to,value)=>{
  const text=String(value).padEnd(to-from+1,' ').slice(0,to-from+1);
  return line.slice(0,from-1)+text+line.slice(to);
};
function fixture(bank='341',flow='rem',amount='0000000001234'){
  let head=' '.repeat(400),detail=' '.repeat(400),trailer=' '.repeat(400);
  head=set(head,1,1,'0');
  head=set(head,2,2,flow==='rem'?'1':'2');
  head=set(head,3,9,flow==='rem'?'REMESSA':'RETORNO');
  head=set(head,10,11,'01');
  head=set(head,12,26,'COBRANCA');
  head=set(head,47,76,'EMPRESA TESTE EXEMPLO');
  head=set(head,77,79,bank);
  head=set(head,80,94,bank==='341'?'BANCO ITAU SA':'BRADESCO');
  head=set(head,95,100,'171026');
  head=set(head,395,400,'000001');
  detail=set(detail,1,1,'1');
  detail=set(detail,109,110,'01');
  detail=set(detail,111,120,'TITULO-X');
  detail=set(detail,121,126,'311026');
  detail=set(detail,127,139,amount);
  detail=set(detail,395,400,'000002');
  if(bank==='341'){
    detail=set(detail,63,70,'01234567');
    detail=set(detail,235,264,'CLIENTE EXEMPLO');
  }else{
    detail=set(detail,71,81,'00001234567');
    detail=set(detail,82,82,'8');
    detail=set(detail,235,274,'CLIENTE EXEMPLO');
  }
  trailer=set(trailer,1,1,'9');
  trailer=set(trailer,395,400,'000003');
  return [head,detail,trailer];
}
const encode=(lines,eol='\r\n')=>new TextEncoder().encode(lines.join(eol)+eol);
test('todos os campos oficiais ocupam integralmente as 400 posições sem sobreposição',()=>{
  for(const [bank,modes] of Object.entries(LAYOUTS))
    for(const [flow,types] of Object.entries(modes))
      for(const type of Object.keys(types)){
        const {known,fields}=fieldsFor(bank,flow,type);
        assert.equal(known,true);
        assert.equal(fields[0].start,1);
        assert.equal(fields.at(-1).end,400);
        let cursor=1;
        for(const field of fields){assert.equal(field.start,cursor);cursor=field.end+1;}
        assert.equal(cursor,401);
      }
});
test('interpreta remessa Itaú com 3 registros e campos certos',()=>{
  const result=inspectBytes(encode(fixture('341')),'teste.rem');
  assert.equal(result.bank,'341');
  assert.equal(result.flow,'rem');
  assert.equal(result.records.length,3);
  assert.equal(result.detailCount,1);
  assert.equal(result.records[1].title.nosso,'01234567');
  assert.equal(result.records[1].title.payer,'CLIENTE EXEMPLO');
  assert.equal(result.records[1].title.due,'31/10/2026');
  assert.equal(result.records[1].title.amount,'R$\u00a012,34');
  assert.equal(result.issues.filter(x=>x.level==='error').length,0);
});
test('Bradesco tem layout próprio e Nosso Número em outras posições',()=>{
  const result=inspectBytes(encode(fixture('237')),'teste.rem');
  assert.equal(result.bank,'237');
  assert.equal(result.records[1].title.nosso,'00001234567');
  assert.equal(result.records[1].fields.find(f=>f.start===82).raw,'8');
  assert.equal(result.records[1].title.amount,'R$\u00a012,34');
});
test('aceita arquivos sem CRLF em blocos exatos de 400',()=>{
  const result=inspectBytes(new TextEncoder().encode(fixture().join('')),'fixo.rem');
  assert.equal(result.records.length,3);
  assert.equal(result.validSize,true);
});
test('detecta registro de 399 bytes e sequencial fora de ordem',()=>{
  const lines=fixture();
  lines[1]=lines[1].slice(0,-1);
  lines[2]=set(lines[2],395,400,'000010');
  const result=inspectBytes(encode(lines),'defeito.rem');
  assert(result.issues.some(i=>i.message.includes('399 bytes')));
  assert(result.issues.some(i=>i.message.includes('Sequencial 000010')));
});
test('não inventa layout para banco não cadastrado',()=>{
  const lines=fixture('999');
  const result=inspectBytes(encode(lines));
  assert.equal(result.records[1].known,false);
  assert(result.issues.some(i=>i.message.includes('não possui layout cadastrado')));
});
test('formata valores, datas e mantém CSV com campo bruto',()=>{
  assert.equal(interpret('0000000000000','money'),'R$\u00a00,00');
  assert.equal(interpret('000000','date6'),'Não informado');
  assert.equal(interpret('310226','date6'),'Data inválida: 310226');
  assert.equal(interpret('12345678','cep'),'12345-678');
  const csv=csvOf(inspectBytes(encode(fixture())));
  assert(csv.includes('Nosso Número'));
  assert(csv.includes('01234567'));
});
test('rejeita binário e arquivo vazio',()=>{
  assert.throws(()=>inspectBytes(new Uint8Array()),/vazio/);
  assert.throws(()=>inspectBytes(new Uint8Array([0,1,2])),/binário/);
});

test('ocorrências não confundem remessa com retorno',()=>{
  assert.match(interpret('02','occurrence',{flow:'rem'}),/Pedido de baixa/);
  assert.match(interpret('02','occurrence',{flow:'ret'}),/Entrada confirmada/);
  assert.match(interpret('06','occurrence',{flow:'ret'}),/Liquidação/);
});
