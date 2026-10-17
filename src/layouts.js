// Layouts de cobrança CNAB 400. Posições inclusivas, começando em 1.
// Referências oficiais: links constantes em SOURCES. Não aplicar layouts de remessa a retorno.
export const SOURCES = {
  '341': 'https://download.itau.com.br/bankline/layout_cobranca_400bytes_cnab_itau.pdf',
  '237': 'https://banco.bradesco/assets/pessoajuridica/pdf/4008-524-0121-layout-cobranca-versao-portugues.pdf'
};
export const BANKS = { '341': 'Itaú Unibanco', '237': 'Bradesco' };
const f = (start, end, name, format='text', group='Outros', note='') =>
  ({ start, end, name, format, group, note });
const A='Arquivo', B='Beneficiário', T='Título', P='Pagador', I='Instruções', R='Registro', C='Complementos', D='Datas e valores';
const commonHeader = [
 f(1,1,'Tipo de registro','code',A),f(2,2,'Operação (1 = remessa)','code',A),
 f(3,9,'Literal REMESSA','text',A),f(10,11,'Código do serviço','code',A),
 f(12,26,'Literal COBRANCA','text',A)
];
const commonTrailer = [
 f(1,1,'Tipo de registro','code',R),
 f(2,394,'Brancos / reserva','filler',R),
 f(395,400,'Sequencial do registro','integer',R)
];
const itauHeader = [
 ...commonHeader,
 f(27,30,'Agência','code',B),f(31,32,'Zeros','filler',B),
 f(33,37,'Conta corrente','code',B),f(38,38,'Dígito da conta','code',B),
 f(39,46,'Brancos','filler',B),f(47,76,'Nome da empresa','text',B),
 f(77,79,'Código do banco','code',A),f(80,94,'Nome do banco','text',A),
 f(95,100,'Data de geração','date6',A),f(101,394,'Brancos','filler',R),
 f(395,400,'Sequencial do registro','integer',R)
];
const bradescoHeader = [
 ...commonHeader,f(27,46,'Código da empresa no Bradesco','code',B),
 f(47,76,'Nome da empresa','text',B),f(77,79,'Código do banco','code',A),
 f(80,94,'Nome do banco','text',A),f(95,100,'Data de gravação','date6',A),
 f(101,108,'Brancos','filler',R),f(109,110,'Identificação do sistema','text',A),
 f(111,117,'Sequencial da remessa','integer',A),f(118,394,'Brancos','filler',R),
 f(395,400,'Sequencial do registro','integer',R)
];
const itauDetail = [
 f(1,1,'Tipo de registro','code',R),f(2,3,'Tipo de inscrição do beneficiário','registration',B),
 f(4,17,'CPF/CNPJ do beneficiário','code',B),f(18,21,'Agência','code',B),
 f(22,23,'Zeros','filler',B),f(24,28,'Conta corrente','code',B),
 f(29,29,'Dígito da conta','code',B),f(30,33,'Brancos','filler',R),
 f(34,37,'Instrução / alegação a cancelar','code',I),
 f(38,62,'Identificação interna do título','text',T),
 f(63,70,'Nosso Número','code',T),
 f(71,83,'Quantidade de moeda variável','number5',T),
 f(84,86,'Número da carteira','code',T),
 f(87,107,'Uso do banco','text',T),
 f(108,108,'Código da carteira','code',T),
 f(109,110,'Código da ocorrência','occurrence',I),
 f(111,120,'Número do documento','text',T),
 f(121,126,'Vencimento','date6',D),
 f(127,139,'Valor do título','money',D),
 f(140,142,'Banco de cobrança','code',B),
 f(143,147,'Agência cobradora','code',B),
 f(148,149,'Espécie do título','species',T),
 f(150,150,'Aceite','accept',T),
 f(151,156,'Data de emissão','date6',D),
 f(157,158,'Instrução 1','code',I),f(159,160,'Instrução 2','code',I),
 f(161,173,'Juros por dia de atraso','money',D),
 f(174,179,'Data-limite de desconto','date6',D),
 f(180,192,'Valor do desconto','money',D),
 f(193,205,'Valor do IOF','money',D),
 f(206,218,'Abatimento','money',D),
 f(219,220,'Tipo de inscrição do pagador','registration',P),
 f(221,234,'CPF/CNPJ do pagador','code',P),
 f(235,264,'Nome do pagador','text',P),
 f(265,274,'Brancos','filler',R),
 f(275,314,'Endereço do pagador','text',P),
 f(315,326,'Bairro','text',P),
 f(327,334,'CEP','cep',P),
 f(335,349,'Cidade','text',P),f(350,351,'UF','text',P),
 f(352,381,'Sacador / avalista','text',P),
 f(382,385,'Brancos','filler',R),
 f(386,391,'Data de mora','date6',D),
 f(392,393,'Prazo (dias)','integer',I),
 f(394,394,'Branco','filler',R),
 f(395,400,'Sequencial do registro','integer',R)
];
const bradescoDetail = [
 f(1,1,'Tipo de registro','code',R),
 f(2,6,'Agência de débito (opcional)','code',P),
 f(7,7,'Dígito da agência de débito','code',P),
 f(8,12,'Razão da conta-corrente','code',P),
 f(13,19,'Conta-corrente do pagador (débito)','code',P),
 f(20,20,'Dígito da conta do pagador','code',P),
 f(21,37,'Identificação do beneficiário no Bradesco','code',B),
 f(38,62,'Controle do participante','text',T),
 f(63,65,'Banco para débito em conta','code',B),
 f(66,66,'Indicador de multa','code',I),
 f(67,70,'Percentual de multa (2 decimais)','percent2',I),
 f(71,81,'Nosso Número','code',T),
 f(82,82,'Dígito do Nosso Número','code',T),
 f(83,92,'Desconto / bonificação por dia','money',D),
 f(93,93,'Emissão do boleto','emission',I),
 f(94,94,'Emissão para débito automático','code',I),
 f(95,104,'Brancos','filler',R),f(105,105,'Indicador de rateio','code',I),
 f(106,106,'Endereçamento do aviso de débito','code',I),
 f(107,108,'Quantidade de pagamentos','integer',I),
 f(109,110,'Código de ocorrência','occurrence',I),
 f(111,120,'Número do documento','text',T),
 f(121,126,'Vencimento','date6',D),
 f(127,139,'Valor do título','money',D),
 f(140,142,'Banco encarregado da cobrança','code',B),
 f(143,147,'Agência depositária','code',B),
 f(148,149,'Espécie do título','species',T),
 f(150,150,'Aceite','accept',T),
 f(151,156,'Data de emissão','date6',D),
 f(157,158,'Instrução 1','code',I),
 f(159,160,'Instrução 2','code',I),
 f(161,173,'Juros por dia de atraso','money',D),
 f(174,179,'Data-limite do desconto','date6',D),
 f(180,192,'Valor do desconto','money',D),
 f(193,205,'Valor do IOF','money',D),
 f(206,218,'Abatimento','money',D),
 f(219,220,'Tipo de inscrição do pagador','registration',P),
 f(221,234,'CPF/CNPJ do pagador','code',P),
 f(235,274,'Nome do pagador','text',P),
 f(275,314,'Endereço completo','text',P),
 f(315,326,'Primeira mensagem','text',I),
 f(327,331,'CEP (5 dígitos)','code',P),
 f(332,334,'Sufixo do CEP (3 dígitos)','code',P),
 f(335,394,'Beneficiário final ou segunda mensagem','text',P),
 f(395,400,'Sequencial do registro','integer',R)
];
const bradescoMessage = [
 f(1,1,'Tipo de registro','code',R),
 f(2,81,'Mensagem 1','text',I),f(82,161,'Mensagem 2','text',I),
 f(162,241,'Mensagem 3','text',I),f(242,321,'Mensagem 4','text',I),
 f(322,327,'Limite do desconto 2','date6',D),
 f(328,340,'Valor do desconto 2','money',D),
 f(341,346,'Limite do desconto 3','date6',D),
 f(347,359,'Valor do desconto 3','money',D),
 f(360,366,'Reserva','filler',R),
 f(367,369,'Carteira','code',B),f(370,374,'Agência','code',B),
 f(375,381,'Conta-corrente','code',B),f(382,382,'Dígito da conta','code',B),
 f(383,393,'Nosso Número','code',T),f(394,394,'Dígito do Nosso Número','code',T),
 f(395,400,'Sequencial','integer',R)
];
const bradescoRateio = [
 f(1,1,'Tipo de registro','code',R),f(2,17,'Identificação da empresa','code',B),
 f(18,29,'Nosso Número com dígito','code',T),
 f(30,30,'Base do cálculo do rateio','code',I),
 f(31,31,'Tipo de valor (percentual / valor)','code',I),
 f(32,43,'Brancos','filler',R)
];
for(let n=0;n<3;n++){
 const k=44+n*117, label=String(n+1)+'º beneficiário';
 bradescoRateio.push(
  f(k,k+2,'Banco do '+label,'code',B),
  f(k+3,k+7,'Agência do '+label,'code',B),
  f(k+8,k+8,'Dígito agência do '+label,'code',B),
  f(k+9,k+20,'Conta do '+label,'code',B),
  f(k+21,k+21,'Dígito conta do '+label,'code',B),
  f(k+22,k+36,'Valor / percentual do '+label,'code',D),
  f(k+37,k+76,'Nome do '+label,'text',B),
  f(k+77,k+107,'Brancos','filler',R),
  f(k+108,k+113,'Parcela do '+label,'code',T),
  f(k+114,k+116,'Floating do '+label,'integer',I)
 );
}
bradescoRateio.push(f(395,400,'Sequencial','integer',R));
const bradescoDebit = [
 f(1,1,'Tipo de registro','code',R),f(2,4,'Carteira','code',B),
 f(5,9,'Agência','code',B),f(10,16,'Conta-corrente','code',B),
 f(17,27,'Nosso Número','code',T),f(28,28,'Dígito Nosso Número','code',T),
 f(29,29,'Tipo de operação','code',I),f(30,30,'Uso do cheque especial (S/N)','code',I),
 f(31,31,'Consulta de saldo (S/N)','code',I),
 f(32,56,'Identificação do contrato','text',T),
 f(57,64,'Prazo de validade do contrato','date8',D),
 f(65,394,'Brancos','filler',R),f(395,400,'Sequencial','integer',R)
];
const bradescoFinal = [
 f(1,1,'Tipo de registro','code',R),f(2,46,'Endereço do beneficiário final','text',B),
 f(47,51,'CEP (5 dígitos)','code',B),f(52,54,'Sufixo CEP','code',B),
 f(55,74,'Cidade','text',B),f(75,76,'UF','text',B),
 f(77,366,'Reserva','filler',R),f(367,369,'Carteira','code',B),
 f(370,374,'Agência','code',B),f(375,381,'Conta-corrente','code',B),
 f(382,382,'Dígito conta','code',B),f(383,393,'Nosso Número','code',T),
 f(394,394,'Dígito Nosso Número','code',T),
 f(395,400,'Sequencial','integer',R)
];
const itauFine = [
 f(1,1,'Tipo de registro','code',R),f(2,2,'Código da multa','code',I),
 f(3,10,'Data da multa','date8',D),
 f(11,23,'Valor / percentual da multa','code',D,'Decimais dependem do código da multa'),
 f(24,394,'Brancos','filler',R),f(395,400,'Sequencial','integer',R)
];
const itauShare = [
 f(1,1,'Tipo de registro','code',R),
 f(2,3,'Tipo de inscrição da empresa','registration',B),
 f(4,17,'CPF/CNPJ empresa','code',B),f(18,21,'Agência','code',B),
 f(22,23,'Zeros','filler',R),f(24,28,'Conta','code',B),
 f(29,29,'Dígito da conta','code',B),f(30,32,'Carteira','code',T),
 f(33,40,'Nosso Número','code',T),f(41,41,'DAC Nosso Número','code',T),
 f(42,43,'Sequência do rateio','integer',R)
];
for(let n=0;n<14;n++){
 const start=44+n*25, name='Conta de rateio '+(n+1);
 itauShare.push(
  f(start,start+3,'Agência – '+name,'code',B),
  f(start+4,start+10,'Conta – '+name,'code',B),
  f(start+11,start+11,'DAC – '+name,'code',B),
  f(start+12,start+24,'Valor – '+name,'money',D)
 );
}
itauShare.push(f(394,394,'Tipo do valor de rateio','code',I),f(395,400,'Sequencial','integer',R));
const itauEmail = [
 f(1,1,'Tipo de registro','code',R),f(2,121,'E-mail do pagador','text',P),
 f(122,123,'Tipo de inscrição do sacador/avalista','registration',P),
 f(124,137,'CPF/CNPJ do sacador/avalista','code',P),
 f(138,177,'Endereço do sacador/avalista','text',P),
 f(178,189,'Bairro do sacador/avalista','text',P),
 f(190,197,'CEP do sacador/avalista','cep',P),
 f(198,212,'Cidade do sacador/avalista','text',P),
 f(213,214,'UF do sacador/avalista','text',P),
 f(215,394,'Brancos','filler',R),f(395,400,'Sequencial','integer',R)
];
const itauReturnHeader = [
 f(1,1,'Tipo de registro','code',R),f(2,2,'Operação = retorno','code',A),
 f(3,9,'Literal RETORNO','text',A),f(10,11,'Código do serviço','code',A),
 f(12,26,'Literal COBRANCA','text',A),
 ...itauHeader.filter(x=>x.start>=27&&x.start<=100),
 f(101,105,'Densidade','code',A),f(106,108,'Unidade de densidade','text',A),
 f(109,113,'Sequencial do arquivo retorno','integer',A),
 f(114,119,'Data do crédito','date6',D),
 f(120,394,'Brancos','filler',R),f(395,400,'Sequencial','integer',R)
];
const itauReturnDetail = [
 ...itauDetail.filter(x=>x.end<=29),
 f(30,37,'Brancos','filler',R),
 f(38,62,'Identificação interna do título','text',T),
 f(63,70,'Nosso Número','code',T),f(71,82,'Brancos','filler',R),
 f(83,85,'Carteira','code',T),f(86,93,'Nosso Número (confirmação)','code',T),
 f(94,94,'Dígito Nosso Número','code',T),
 f(95,107,'Brancos','filler',R),f(108,108,'Código da carteira','code',T),
 f(109,110,'Ocorrência de retorno','occurrence',I),
 f(111,116,'Data da ocorrência','date6',D),
 f(117,126,'Documento','text',T),f(127,134,'Nosso Número','code',T),
 f(135,146,'Brancos','filler',R),f(147,152,'Vencimento','date6',D),
 f(153,165,'Valor do título','money',D),f(166,168,'Banco cobrador','code',B),
 f(169,172,'Agência cobradora','code',B),f(173,173,'DAC agência','code',B),
 f(174,175,'Espécie','species',T),f(176,188,'Tarifa de cobrança','money',D),
 f(189,214,'Brancos','filler',R),f(215,227,'IOF','money',D),
 f(228,240,'Abatimento','money',D),f(241,253,'Desconto','money',D),
 f(254,266,'Valor creditado','money',D),f(267,279,'Juros / multa','money',D),
 f(280,292,'Outros créditos','money',D),f(293,293,'Indicador DDA','code',I),
 f(294,295,'Brancos','filler',R),f(296,301,'Data de crédito','date6',D),
 f(302,305,'Instrução cancelada','code',I),
 f(306,311,'Brancos','filler',R),f(312,324,'Zeros','filler',R),
 f(325,354,'Nome do pagador','text',P),f(355,377,'Brancos','filler',R),
 f(378,385,'Erros / informações','text',I),
 f(386,392,'Brancos','filler',R),f(393,394,'Código de liquidação','code',I),
 f(395,400,'Sequencial','integer',R)
];
export const LAYOUTS = {
 '341': { rem: { '0':itauHeader,'1':itauDetail,'2':itauFine,'4':itauShare,'5':itauEmail,'9':commonTrailer },
          ret: { '0':itauReturnHeader,'1':itauReturnDetail,'9':commonTrailer } },
 '237': { rem: { '0':bradescoHeader,'1':bradescoDetail,'2':bradescoMessage,'3':bradescoRateio,'6':bradescoDebit,'7':bradescoFinal,'9':commonTrailer },
          ret: {} }
};
export const DESCRIPTIONS = { '0':'Cabeçalho do arquivo','1':'Título / transação','2':'Registro complementar','3':'Rateio de crédito','4':'Rateio de crédito','5':'E-mail / sacador avalista','6':'Informações de débito','7':'Beneficiário final','8':'Mensagem','9':'Trailer / encerramento' };
export function fieldsFor(bank, flow, type) {
  const specified=LAYOUTS[bank]?.[flow]?.[type];
  if(!specified) return { known:false, fields: [
    f(1,1,'Identificador de registro','code',R),
    f(2,394,'Conteúdo não mapeado para este layout','text',R),
    f(395,400,'Posições finais (verificar manual)','code',R)
  ]};
  const fields=[...specified].sort((a,b)=>a.start-b.start);
  let cursor=1, covered=[];
  for(const item of fields) {
    if(item.start<cursor || item.end>400 || item.end<item.start)
      throw Error('Layout inválido: '+bank+'/'+flow+'/'+type+' pos '+item.start+'-'+item.end);
    if(item.start>cursor) covered.push(f(cursor,item.start-1,'Posições sem campo definido no manual','text',R));
    covered.push(item);cursor=item.end+1;
  }
  if(cursor<=400) covered.push(f(cursor,400,'Posições sem campo definido no manual','text',R));
  return { known:true, fields:covered };
}


// Arquivos de retorno Bradesco, conforme manual oficial, págs. 35–40.
const bradescoReturnHeader=[
 f(1,1,'Tipo de registro','code',R),f(2,2,'Operação de retorno','code',A),
 f(3,9,'Literal RETORNO','text',A),f(10,11,'Código do serviço','code',A),
 f(12,26,'Literal COBRANCA','text',A),
 f(27,46,'Código da empresa','code',B),f(47,76,'Nome da empresa','text',B),
 f(77,79,'Código do banco','code',A),f(80,94,'Nome do banco','text',A),
 f(95,100,'Data de gravação','date6',A),
 f(101,108,'Densidade de gravação','code',A),
 f(109,113,'Número do aviso bancário','code',A),
 f(114,379,'Brancos','filler',R),f(380,385,'Data do crédito','date6',D),
 f(386,394,'Brancos','filler',R),f(395,400,'Sequencial','integer',R)
];
const bradescoReturnDetail=[
 f(1,1,'Tipo de registro','code',R),f(2,3,'Tipo de inscrição empresa','registration',B),
 f(4,17,'CPF/CNPJ empresa','code',B),f(18,20,'Zeros','filler',R),
 f(21,37,'Identificação do beneficiário no banco','code',B),
 f(38,62,'Controle do participante','text',T),
 f(63,70,'Zeros','filler',R),f(71,82,'Nosso Número com dígito','code',T),
 f(83,92,'Uso do banco','text',R),f(93,104,'Uso do banco','text',R),
 f(105,105,'Indicador de rateio','code',I),
 f(106,107,'Pagamento parcial','code',I),
 f(108,108,'Carteira','code',T),
 f(109,110,'Código da ocorrência','occurrence',I),
 f(111,116,'Data da ocorrência','date6',D),
 f(117,126,'Número do documento','text',T),
 f(127,146,'Identificação do título no banco','code',T),
 f(147,152,'Vencimento','date6',D),
 f(153,165,'Valor do título','money',D),
 f(166,168,'Banco cobrador','code',B),f(169,173,'Agência cobradora','code',B),
 f(174,175,'Espécie do título','species',T),
 f(176,188,'Despesas de cobrança','money',D),
 f(189,201,'Outras despesas / custas','money',D),
 f(202,214,'Juros de operação em atraso','money',D),
 f(215,227,'IOF devido','money',D),
 f(228,240,'Abatimento concedido','money',D),
 f(241,253,'Desconto concedido','money',D),
 f(254,266,'Valor pago','money',D),
 f(267,279,'Juros de mora','money',D),
 f(280,292,'Outros créditos','money',D),
 f(293,294,'Brancos','filler',R),
 f(295,295,'Motivo da confirmação de protesto','code',I),
 f(296,301,'Data do crédito','date6',D),
 f(302,304,'Origem do pagamento','code',I),
 f(305,314,'Brancos','filler',R),
 f(315,318,'Código do banco do cheque','code',I),
 f(319,328,'Motivos de rejeição / ocorrência','text',I),
 f(329,368,'Brancos','filler',R),
 f(369,370,'Número do cartório','code',I),
 f(371,380,'Número do protocolo','code',I),
 f(381,394,'Brancos','filler',R),
 f(395,400,'Sequencial','integer',R)
];
const bradescoReturnRateio=[
 f(1,1,'Tipo de registro','code',R),f(2,17,'Identificação da empresa','code',B),
 f(18,29,'Nosso Número','code',T),
 f(30,30,'Código de cálculo do rateio','code',I),
 f(31,31,'Tipo de valor','code',I),f(32,43,'Brancos','filler',R)
];
for(let n=0;n<3;n++){
 const start=44+117*n, ordinal=String(n+1)+'º beneficiário';
 const base=start;
 bradescoReturnRateio.push(
  f(base,base+2,'Banco do '+ordinal,'code',B),
  f(base+3,base+7,'Agência do '+ordinal,'code',B),
  f(base+8,base+8,'Dígito da agência do '+ordinal,'code',B),
  f(base+9,base+20,'Conta do '+ordinal,'code',B),
  f(base+21,base+21,'Dígito da conta do '+ordinal,'code',B),
  f(base+22,base+36,'Valor do rateio '+ordinal,'money',D),
  f(base+37,base+76,'Nome do '+ordinal,'text',B),
  f(base+77,base+97,'Brancos','filler',R),
  f(base+98,base+103,'Parcela do '+ordinal,'code',I),
  f(base+104,base+106,'Floating do '+ordinal,'integer',I),
  f(base+107,base+114,'Data do crédito do '+ordinal,'date8',D),
  f(base+115,base+116,'Status do '+ordinal,'code',I)
 );
}
bradescoReturnRateio.push(f(395,400,'Sequencial','integer',R));
const bradescoReturnTrailer=[
 f(1,1,'Tipo de registro','code',R),f(2,2,'Operação retorno','code',A),
 f(3,4,'Tipo de registro','code',R),f(5,7,'Código do banco','code',A),
 f(8,17,'Brancos','filler',R),
 f(18,25,'Quantidade de títulos','integer',T),
 f(26,39,'Valor total em cobrança','money',D),
 f(40,47,'Aviso bancário','code',A),
 f(48,57,'Brancos','filler',R),
 f(58,62,'Quantidade de entradas confirmadas','integer',T),
 f(63,74,'Valor das entradas confirmadas','money',D),
 f(75,86,'Valor de liquidação informado','money',D),
 f(87,91,'Quantidade de liquidações','integer',T),
 f(92,103,'Valor de liquidações','money',D),
 f(104,108,'Quantidade de baixas','integer',T),
 f(109,120,'Valor de baixas','money',D),
 f(121,125,'Quantidade de cancelamentos de abatimento','integer',T),
 f(126,137,'Valor de cancelamentos de abatimento','money',D),
 f(138,142,'Quantidade de alterações de vencimento','integer',T),
 f(143,154,'Valor das alterações de vencimento','money',D),
 f(155,159,'Quantidade de abatimentos concedidos','integer',T),
 f(160,171,'Valor dos abatimentos concedidos','money',D),
 f(172,176,'Quantidade de confirmações de protesto','integer',T),
 f(177,188,'Valor de confirmações de protesto','money',D),
 f(189,362,'Brancos','filler',R),
 f(363,377,'Valor total de rateios','money',D),
 f(378,385,'Quantidade de rateios','integer',T),
 f(386,394,'Brancos','filler',R),
 f(395,400,'Sequencial','integer',R)
];
LAYOUTS['237'].ret={
 '0':bradescoReturnHeader,
 '1':bradescoReturnDetail,
 '3':bradescoReturnRateio,
 '9':bradescoReturnTrailer
};
