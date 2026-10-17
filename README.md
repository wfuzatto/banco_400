# CNAB 400 — Visualizador bancário

Visualizador web estático que transforma arquivos de **cobrança CNAB 400** em uma conferência legível: posições, campos oficiais, valores interpretados e bytes originais. Não possui backend nem dependências externas.

## Como usar

1. Abra a página e clique em **Entre com arquivo** (ou arraste o arquivo).
2. Selecione .REM, .RET, .TXT, .TST, .RST, .CNAB ou .400, até 25 MB.
3. O sistema reconhece o banco pelas posições 077–079 do header e o fluxo pela posição 002.
4. Na página de análise, escolha um registro ou clique em **Ver arquivo inteiro**.
5. Busque documento, pagador ou conteúdo, veja a interpretação e os dados originais.
6. Exporte CSV/JSON ou imprima.

Os espaços no campo bruto são representados por ·, sem alterar os dados originais. Também é possível conferir o registro inteiro dividido em linhas de 40 posições.

## Bancos e registros mapeados

| Banco | Remessa | Retorno |
|---|---|---|
| Itaú (341) | 0, 1, 2, 4, 5, 9 | 0, 1, 9 |
| Bradesco (237) | 0, 1, 2, 3, 6, 7, 9 | 0, 1, 3, 9 |

Os tipos que não constam da lista aparecem na íntegra, com **aviso de layout não confirmado** em vez de receber rótulos presumidos.

### Exemplos enviados para análise

- 061026B.REM
- 120926B.REM
- 180926B.REM

**Resultado:** os três são arquivos de remessa CNAB 400 de **Itaú (341)** e contêm 3 registros de 400 bytes: header 0, transação 1, trailer 9. Embora sejam CNAB 400, **não seguem o layout Bradesco (237)**. Os dados bancários reais **não foram adicionados** ao repositório público.

## Validações

- Registros com exatamente 400 bytes, mesmo sem CRLF;
- Header tipo 0 e trailer tipo 9;
- Número de sequência do registro (posições 395–400);
- Identificação de banco, remessa e retorno;
- Campos monetários, datas, códigos e CEP formatados;
- Datas inválidas e caracteres não numéricos em campos tipados;
- Campo bruto e registro original preservados visualmente.

**Atenção:** é um visualizador para conferência, não um homologador de remessas. As regras negociais variam por carteira, modalidade e convênio. Confirme requisitos obrigatórios e instruções com a agência/banco.

## Executar localmente

Como o projeto utiliza módulos JavaScript, abra-o por HTTP. Por exemplo, na raiz do repositório:

    python -m http.server 8000

Acesse http://localhost:8000

### GitHub Pages

Em **Settings → Pages** do repositório, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**. O visualizador não precisa de servidor, banco de dados ou build. Publique o Pages apenas se desejar disponibilizar a interface via site.

## Testes

Com Node 20 ou superior, na raiz:

    node --test tests/*.test.mjs

Os testes usam dados sintéticos, sem informações pessoais dos arquivos recebidos.

## Segurança e privacidade

- Leitura 100% na memória do navegador;
- Não há envio dos arquivos para servidores, cookies ou armazenamento permanente;
- CSV e JSON exportados localmente contêm dados bancários e devem ser mantidos em local seguro;
- Não adicione arquivos reais de cobrança ao GitHub, especialmente em repositórios públicos.

## Documentação bancária oficial

- [Itaú — Cobrança CNAB 400, janeiro/2017](https://download.itau.com.br/bankline/layout_cobranca_400bytes_cnab_itau.pdf)
- [Bradesco — Manual de Procedimentos Operacionais de Cobrança CNAB 400, versão 17](https://banco.bradesco/assets/pessoajuridica/pdf/4008-524-0121-layout-cobranca-versao-portugues.pdf)

### Limitações

- Cobrança CNAB 400; outros serviços financeiros com registros de 400 bytes podem usar estrutura distinta.
- Registros opcionais de convênios específicos não confirmados pelo manual são apresentados sem classificação.
- Retornos Itaú com registros especiais adicionais podem exigir um manual complementar.
- Os bytes são decodificados para visualização com Windows-1252, padrão de texto bancário tradicional.

## Arquivos

- **index.html** — página inicial e página de análise.
- **src/app.js** — interface, navegação, busca e exportação.
- **src/parser.js** — parser posicional por bytes e verificações.
- **src/layouts.js** — layouts bancários declarativos separados por tipo/operação.
- **src/styles.css** — identidade visual responsiva.
- **tests/parser.test.mjs** — testes automatizados com exemplos sintéticos.
