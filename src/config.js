// Configuração centralizada do banco habilitado para análise.
//
// mode: 'fixed' -> aceita somente arquivos do banco definido em bank.
// mode: 'auto'  -> volta a reconhecer Itaú (341) e Bradesco (237) pelo cabeçalho.
//
// Os layouts de ambos os bancos continuam implementados em src/layouts.js.
// Para reativar a identificação automática, altere apenas mode para 'auto'.
export const BANK_CONFIG = Object.freeze({
  mode: 'fixed',
  bank: '341'
});
