// Estruturas de dados
let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let contasRecorrentes = JSON.parse(localStorage.getItem('contasRecorrentes')) || [];
let configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || {
    saldoInicial: 0,
    chequeEspecial: 0
};

// Elementos DOM
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const modalTransacao = document.getElementById('modal-transacao');
const modalRecorrente = document.getElementById('modal-recorrente');
const modalEditarTransacao = document.getElementById('modal-editar-transacao');
const btnNovaTransacao = document.getElementById('btn-nova-transacao');
const btnNovaRecorrente = document.getElementById('btn-nova-recorrente');
const closeBtns = document.querySelectorAll('.close');
const formNovaTransacao = document.getElementById('form-nova-transacao');
const formNovaRecorrente = document.getElementById('form-nova-recorrente');
const formEditarTransacao = document.getElementById('form-editar-transacao');
const formConfig = document.getElementById('form-config');
const saldoAtual = document.getElementById('saldo-atual');
const entradasMes = document.getElementById('entradas-mes');
const saidasMes = document.getElementById('saidas-mes');
const limiteChequeTxt = document.getElementById('limite-cheque');
const progressoCheque = document.getElementById('progresso-cheque');
const ultimasTransacoes = document.getElementById('ultimas-transacoes');
const listaTransacoes = document.getElementById('lista-transacoes');
const listaRecorrentes = document.getElementById('lista-recorrentes');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroMes = document.getElementById('filtro-mes');
const inputSaldoInicial = document.getElementById('saldo-inicial');
const inputChequeEspecial = document.getElementById('cheque-especial');
const inputComprovante = document.getElementById('novo-comprovante');
const previewComprovante = document.getElementById('preview-comprovante');
const editarId = document.getElementById('editar-id');
const editarDescricao = document.getElementById('editar-descricao');
const editarCategoria = document.getElementById('editar-categoria');
const editarValor = document.getElementById('editar-valor');
const editarTipo = document.getElementById('editar-tipo');
const editarData = document.getElementById('editar-data');
const editarComprovante = document.getElementById('editar-comprovante');
const editarPreviewComprovante = document.getElementById('editar-preview-comprovante');
const comprovanteAtual = document.getElementById('comprovante-atual');
const btnExportar = document.getElementById('btn-exportar');
const btnImportar = document.getElementById('btn-importar');
const importFile = document.getElementById('import-file');
const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
const relatorioMes = document.getElementById('relatorio-mes');
const relatorioAno = document.getElementById('relatorio-ano');

// Elementos DOM para o extrato bancário
const extratoData = document.getElementById('extrato-data');
const extratoBtnImprimir = document.getElementById('btn-imprimir-extrato');
const extratoTransacoes = document.getElementById('extrato-transacoes');
const saldoAnterior = document.getElementById('saldo-anterior');
const totalEntradas = document.getElementById('total-entradas');
const totalSaidas = document.getElementById('total-saidas');
const saldoFinal = document.getElementById('saldo-final');
const btnNovaTransacaoExtrato = document.getElementById('btn-nova-transacao-extrato');
const extratoEmpty = document.getElementById('extrato-empty');
const filtroAno = document.getElementById('filtro-ano');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    criarTransacaoSaldoInicial();
    atualizarDashboard();
    renderizarTransacoes();
    renderizarContasRecorrentes();
    
    // Definir mês atual nos seletores
    const dataAtual = new Date();
    filtroMes.value = dataAtual.getMonth() + 1;
    relatorioMes.value = dataAtual.getMonth() + 1;
    
    // Adicionar data atual ao campo de data
    document.getElementById('nova-data').valueAsDate = new Date();

    // Definir data atual no extrato e filtro
    extratoData.textContent = `${obterNomeMes(dataAtual.getMonth() + 1)}/${dataAtual.getFullYear()}`;
    filtroAno.value = dataAtual.getFullYear();
    
    // Atualizar o extrato bancário
    atualizarExtratoBancario();
    
    // Adicionar botão de debug ao lado do filtro
    const containerFiltro = document.querySelector('.filtro-container') || document.getElementById('transacoes');
    
    if (containerFiltro) {
        const btnDebug = document.createElement('button');
        btnDebug.textContent = 'Verificar Transações';
        btnDebug.className = 'btn btn-secondary';
        btnDebug.style.marginLeft = '10px';
        btnDebug.addEventListener('click', debugTransacoes);
        containerFiltro.appendChild(btnDebug);
    }
    
    // Garantir que a aba de Transações seja carregada corretamente
    // Certificar-se que o filtro está configurado para mostrar o mês atual
    const currentTab = document.querySelector('.tab-btn.active');
    if (currentTab && currentTab.getAttribute('data-tab') === 'transacoes') {
        console.log('Aba de transações já está ativa, atualizando...');
        const dataAtual = new Date();
        filtroMes.value = dataAtual.getMonth() + 1;
        filtroAno.value = dataAtual.getFullYear();
        atualizarExtratoBancario();
    }
    
    // Força a atualização para garantir que o filtro de data seja respeitado
    renderizarTransacoes();
});

// Sistema de navegação por abas
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Se a aba de transações estiver sendo ativada, atualizar o extrato
        if (tabId === 'transacoes') {
            console.log('Aba de transações ativada, atualizando extrato...');
            atualizarExtratoBancario();
        }
    });
});

// Funções para Modal
btnNovaTransacao.addEventListener('click', () => {
    modalTransacao.style.display = 'block';
});

btnNovaRecorrente.addEventListener('click', () => {
    modalRecorrente.style.display = 'block';
});

btnNovaTransacaoExtrato.addEventListener('click', () => {
    modalTransacao.style.display = 'block';
});

// Adicionar evento de submissão ao formulário de edição
formEditarTransacao.addEventListener('submit', (e) => {
    e.preventDefault();
    salvarTransacaoEditada();
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modalTransacao.style.display = 'none';
        modalRecorrente.style.display = 'none';
        modalEditarTransacao.style.display = 'none';
        limparFormularios();
    });
});

window.addEventListener('click', (e) => {
    if (e.target === modalTransacao) {
        modalTransacao.style.display = 'none';
        limparFormularios();
    }
    if (e.target === modalRecorrente) {
        modalRecorrente.style.display = 'none';
        limparFormularios();
    }
    if (e.target === modalEditarTransacao) {
        modalEditarTransacao.style.display = 'none';
        limparFormularios();
    }
});

// Preview de comprovante
inputComprovante.addEventListener('change', () => {
    const file = inputComprovante.files[0];
    if (!file) {
        previewComprovante.innerHTML = '';
        return;
    }
    
    if (file.type === 'application/pdf') {
        // Para arquivos PDF, mostrar ícone e nome
        previewComprovante.innerHTML = `
            <div class="pdf-preview">
                <i class="fas fa-file-pdf"></i>
                <p>${file.name}</p>
            </div>
        `;
    } else if (file.type.startsWith('image/')) {
        // Para imagens, mostrar a prévia
        const reader = new FileReader();
        reader.onload = function(e) {
            previewComprovante.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Adicionar evento para o botão de impressão
extratoBtnImprimir.addEventListener('click', imprimirExtrato);

// Processar formulário de nova transação com tratamento específico para despesas
formNovaTransacao.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const descricao = document.getElementById('nova-descricao').value;
    const categoria = document.getElementById('nova-categoria').value;
    const valor = parseFloat(document.getElementById('novo-valor').value);
    const tipo = document.getElementById('novo-tipo').value;
    const data = document.getElementById('nova-data').value;
    
    // Verificar se o valor é válido
    if (isNaN(valor) || valor <= 0) {
        mostrarNotificacao('Informe um valor válido maior que zero.', 'erro');
        return;
    }
    
    // Processar comprovante se existir
    let comprovante = null;
    if (inputComprovante.files[0]) {
        comprovante = await getBase64(inputComprovante.files[0]);
    }
    
    // Valor efetivo (positivo para receita, negativo para despesa)
    const valorEfetivo = tipo === 'receita' ? valor : -valor;
    
    console.log('Adicionando nova transação:', {
        tipo,
        valor,
        valorEfetivo,
        data
    });
    
    // Verificar se a despesa ultrapassaria o limite do cheque especial
    if (valorEfetivo < 0) {
        const saldoAtual = transacoes.reduce((acc, t) => acc + t.valor, 0);
        const novoSaldo = saldoAtual + valorEfetivo;
        
        if (novoSaldo < -configuracoes.chequeEspecial) {
            mostrarNotificacao('Transação não permitida: Limite de cheque especial seria excedido!', 'erro');
            return;
        }
    }
    
    // Criar nova transação
    const novaTransacao = {
        id: Date.now().toString(),
        descricao,
        categoria,
        valor: valorEfetivo,
        data,
        comprovante
    };
    
    // Adicionar a transação
    transacoes.push(novaTransacao);
    salvarTransacoes();
    
    // Atualizar interface
    atualizarDashboard();
    renderizarTransacoes();
    atualizarExtratoBancario();
    
    // Fechar o modal e limpar formulário
    modalTransacao.style.display = 'none';
    limparFormularios();
    
    // Mostrar notificação de sucesso
    mostrarNotificacao(`${tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
});

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function adicionarTransacao(transacao) {
    // Resolve a promise se o comprovante existir
    if (transacao.comprovante instanceof Promise) {
        transacao.comprovante = await transacao.comprovante;
    }
    
    transacoes.push(transacao);
    salvarTransacoes();
    atualizarDashboard();
    renderizarTransacoes();
    atualizarExtratoBancario();
}

async function adicionarTransacaoSilenciosa(transacao) {
    // Resolve a promise se o comprovante existir
    if (transacao.comprovante instanceof Promise) {
        transacao.comprovante = await transacao.comprovante;
    }
    
    // Remove transação com o mesmo ID se existir
    transacoes = transacoes.filter(t => t.id !== transacao.id);
    
    transacoes.push(transacao);
    salvarTransacoes();
}

function removerTransacao(id, silencioso = false) {
    // Verificar se é a transação de saldo inicial
    const transacao = transacoes.find(t => t.id == id);
    if (transacao && transacao.categoria === 'sistema' && transacao.descricao === '[Saldo Inicial]') {
        mostrarNotificacao('O saldo inicial não pode ser removido. Altere-o nas configurações.', 'erro');
        return;
    }
    
    if (!silencioso) {
        // Agora usamos a função confirmarExclusao em vez do confirm padrão
        confirmarExclusao(id);
        return;
    }
    
    // Remover a transação do array
    transacoes = transacoes.filter(t => t.id != id);
    
    // Salvar no localStorage
    salvarTransacoes();
    
    if (!silencioso) {
        // Forçar a atualização do dashboard e da lista
        atualizarDashboard();
        renderizarTransacoes();
        atualizarExtratoBancario();
        mostrarNotificacao('Transação removida com sucesso!');
    }
}

// Função para confirmar exclusão de transação com modal personalizado
function confirmarExclusao(id) {
    // Verificar se é a transação de saldo inicial
    const transacao = transacoes.find(t => t.id == id);
    if (transacao && transacao.categoria === 'sistema' && transacao.descricao === '[Saldo Inicial]') {
        mostrarNotificacao('O saldo inicial não pode ser removido. Altere-o nas configurações.', 'erro');
        return;
    }

    // Criar modal de confirmação
    const modalConfirmacao = document.createElement('div');
    modalConfirmacao.className = 'modal modal-confirmacao';
    modalConfirmacao.style.display = 'block';
    
    modalConfirmacao.innerHTML = `
        <div class="modal-content modal-confirmacao-content">
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta transação?</p>
            <div class="transaction-preview">
                <strong>${transacao.descricao}</strong>
                <span class="${transacao.valor >= 0 ? 'positivo' : 'negativo'}">
                    ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-cancelar">Cancelar</button>
                <button class="btn btn-danger" id="btn-confirmar">Excluir</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalConfirmacao);

    // Adicionar eventos aos botões
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        modalConfirmacao.remove();
    });

    document.getElementById('btn-confirmar').addEventListener('click', () => {
        // Remover a transação do array
        transacoes = transacoes.filter(t => t.id != id);
        
        // Salvar no localStorage
        salvarTransacoes();
        
        // Atualizar interface
        atualizarDashboard();
        renderizarTransacoes();
        atualizarExtratoBancario();
        
        // Feedback visual
        mostrarNotificacao('Transação removida com sucesso!');
        
        // Fechar modal
        modalConfirmacao.remove();
    });

    // Fechar ao clicar fora do modal
    modalConfirmacao.addEventListener('click', (e) => {
        if (e.target === modalConfirmacao) {
            modalConfirmacao.remove();
        }
    });
}

function renderizarTransacoes() {
    // Filtrar transações
    let transacoesFiltradas = [...transacoes];
    
    // Filtrar transações não-sistema para exibição na lista completa
    transacoesFiltradas = transacoesFiltradas.filter(t => !(t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]'));
    
    if (filtroTipo.value === 'receitas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor > 0);
    } else if (filtroTipo.value === 'despesas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor < 0);
    }
    
    if (filtroMes.value !== 'todos') {
        const mes = parseInt(filtroMes.value);
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const data = new Date(t.data);
            return data.getMonth() + 1 === mes;
        });
    }
    
    // Ordenar por data (mais recente primeiro)
    transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Renderizar na lista completa de transações
    listaTransacoes.innerHTML = '';
    transacoesFiltradas.forEach(transacao => {
        const li = criarElementoTransacao(transacao);
        listaTransacoes.appendChild(li);
    });
    
    // Renderizar nas últimas transações do dashboard (5 mais recentes)
    ultimasTransacoes.innerHTML = '';
    transacoes
        .filter(t => !(t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]')) // Não mostrar transação de saldo inicial
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 5)
        .forEach(transacao => {
            const li = criarElementoTransacao(transacao);
            ultimasTransacoes.appendChild(li);
        });
}

function criarElementoTransacao(transacao) {
    const li = document.createElement('li');
    li.className = transacao.valor >= 0 ? 'receita' : 'despesa';
    
    const data = new Date(transacao.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    
    // Não exibir botões de edição para a transação de saldo inicial do sistema
    const ehTransacaoSistema = transacao.categoria === 'sistema' && transacao.descricao === '[Saldo Inicial]';
    
    li.innerHTML = `
        <div class="transacao-info">
            <div class="transacao-descricao">${transacao.descricao}</div>
            <div class="transacao-data">${dataFormatada} 
                <span class="transacao-categoria">${transacao.categoria}</span>
                ${transacao.comprovante ? '<span class="btn-ver-comprovante" data-id="' + transacao.id + '">Ver comprovante</span>' : ''}
            </div>
        </div>
        <div class="transacao-valor">
            ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        <div class="transacao-actions">
            ${!ehTransacaoSistema ? `
                <button class="btn-acao edit" onclick="editarTransacao('${transacao.id}')">
                    <i class="fas fa-pencil-alt"></i>
                </button>
            ` : ''}
            <button class="btn-acao delete" onclick="confirmarExclusao('${transacao.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Adicionar evento para visualizar comprovante
    if (transacao.comprovante) {
        li.querySelector('.btn-ver-comprovante').addEventListener('click', () => {
            visualizarComprovante(transacao);
        });
    }
    
    return li;
}

function visualizarComprovante(transacao) {
    const tipoArquivo = detectarTipoArquivo(transacao.comprovante);
    
    if (tipoArquivo === 'pdf') {
        // Abrir o PDF em uma nova janela
        const win = window.open("", "Comprovante", "width=800,height=600");
        win.document.write(`
            <html>
                <head>
                    <title>Comprovante - ${transacao.descricao}</title>
                    <style>
                        body { font-family: Arial; margin: 0; padding: 0; height: 100vh; }
                        .header { padding: 10px 20px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
                        h1 { color: #2563eb; margin: 0; font-size: 1.2rem; }
                        .info { margin: 5px 0; font-size: 0.9rem; color: #64748b; }
                        .pdf-container { width: 100%; height: calc(100vh - 80px); }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Comprovante: ${transacao.descricao}</h1>
                        <p class="info">Data: ${new Date(transacao.data).toLocaleDateString('pt-BR')} | 
                        Valor: ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <embed src="${transacao.comprovante}" type="application/pdf" width="100%" height="100%" class="pdf-container">
                </body>
            </html>
        `);
    } else {
        // Para imagens, manter o comportamento anterior
        const win = window.open("", "Comprovante", "width=800,height=600");
        win.document.write(`
            <html>
                <head>
                    <title>Comprovante - ${transacao.descricao}</title>
                    <style>
                        body { font-family: Arial; margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; max-height: 80vh; }
                        h1 { color: #2563eb; }
                    </style>
                </head>
                <body>
                    <h1>Comprovante: ${transacao.descricao}</h1>
                    <p>Data: ${new Date(transacao.data).toLocaleDateString('pt-BR')} | 
                    Valor: ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <img src="${transacao.comprovante}" alt="Comprovante">
                </body>
            </html>
        `);
    }
}

// Função para detectar se é um PDF ou imagem com base no data URL
function detectarTipoArquivo(dataUrl) {
    if (dataUrl.startsWith('data:application/pdf')) {
        return 'pdf';
    } else {
        return 'imagem';
    }
}

// Função para editar transação
function editarTransacao(id) {
    // Encontrar a transação pelo ID
    const transacao = transacoes.find(t => t.id == id);
    if (!transacao) return;
    
    // Verificar se é a transação de saldo inicial do sistema
    if (transacao.categoria === 'sistema' && transacao.descricao === '[Saldo Inicial]') {
        mostrarNotificacao('O saldo inicial não pode ser editado diretamente. Altere-o nas configurações.', 'erro');
        return;
    }
    
    // Exibir modal de edição
    modalEditarTransacao.style.display = 'block';
    
    // Preencher o formulário com os dados da transação
    editarId.value = transacao.id;
    editarDescricao.value = transacao.descricao;
    editarCategoria.value = transacao.categoria;
    editarValor.value = Math.abs(transacao.valor);
    editarTipo.value = transacao.valor >= 0 ? 'receita' : 'despesa';
    
    // Formatar a data corretamente para o input date (YYYY-MM-DD)
    const data = new Date(transacao.data);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    editarData.value = `${ano}-${mes}-${dia}`;
    
    // Exibir comprovante atual se existir
    if (transacao.comprovante) {
        if (detectarTipoArquivo(transacao.comprovante) === 'pdf') {
            comprovanteAtual.innerHTML = `
                <div class="comprovante-info">
                    <p>Comprovante atual: <i class="fas fa-file-pdf"></i> PDF</p>
                    <span class="btn-ver" onclick="visualizarComprovante(${JSON.stringify(transacao).replace(/"/g, '&quot;')})">
                        Visualizar
                    </span>
                </div>
            `;
        } else {
            comprovanteAtual.innerHTML = `
                <div class="comprovante-info">
                    <p>Comprovante atual:</p>
                    <img src="${transacao.comprovante}" alt="Comprovante" height="100">
                    <span class="btn-ver" onclick="visualizarComprovante(${JSON.stringify(transacao).replace(/"/g, '&quot;')})">
                        Visualizar
                    </span>
                </div>
            `;
        }
    } else {
        comprovanteAtual.innerHTML = '<p>Sem comprovante</p>';
    }
    
    // Limpar preview do comprovante novo
    editarPreviewComprovante.innerHTML = '';
}

// Função para salvar transação editada
function salvarTransacaoEditada() {
    const id = editarId.value;
    const descricao = editarDescricao.value;
    const categoria = editarCategoria.value;
    const valor = parseFloat(editarValor.value);
    const tipo = editarTipo.value;
    const data = new Date(editarData.value);
    
    // Validação básica
    if (!descricao || !categoria || isNaN(valor) || valor <= 0 || !data) {
        mostrarNotificacao('Por favor, preencha todos os campos corretamente', 'erro');
        return;
    }
    
    // Encontrar índice da transação
    const index = transacoes.findIndex(t => t.id == id);
    if (index === -1) return;
    
    // Criar objeto com os dados atualizados
    const transacaoAtualizada = {
        ...transacoes[index],
        descricao,
        categoria,
        valor: tipo === 'receita' ? valor : -valor,
        data,
    };
    
    // Verificar se há um novo comprovante
    const novoComprovante = editarComprovante.files[0];
    if (novoComprovante) {
        const reader = new FileReader();
        reader.onload = function(e) {
            transacaoAtualizada.comprovante = e.target.result;
            
            // Atualizar transação na lista
            transacoes[index] = transacaoAtualizada;
            
            // Salvar no localStorage e atualizar UI
            salvarTransacoes();
            atualizarDashboard();
            renderizarTransacoes();
            fecharModalEditarTransacao();
            mostrarNotificacao('Transação atualizada com sucesso!', 'sucesso');
        };
        reader.readAsDataURL(novoComprovante);
    } else {
        // Atualizar transação na lista sem alterar o comprovante
        transacoes[index] = transacaoAtualizada;
        
        // Salvar no localStorage e atualizar UI
        salvarTransacoes();
        atualizarDashboard();
        renderizarTransacoes();
        fecharModalEditarTransacao();
        mostrarNotificacao('Transação atualizada com sucesso!', 'sucesso');
    }
}

// Função para fechar o modal de edição
function fecharModalEditarTransacao() {
    modalEditarTransacao.style.display = 'none';
    formEditarTransacao.reset();
    editarPreviewComprovante.innerHTML = '';
    comprovanteAtual.innerHTML = '';
}

// Manipulação de Contas Recorrentes
formNovaRecorrente.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const descricao = document.getElementById('recorrente-descricao').value;
    const categoria = document.getElementById('recorrente-categoria').value;
    const valor = parseFloat(document.getElementById('recorrente-valor').value);
    const tipo = document.getElementById('recorrente-tipo').value;
    const dia = parseInt(document.getElementById('recorrente-dia').value);
    
    contasRecorrentes.push({
        id: Date.now(),
        descricao,
        categoria,
        valor: tipo === 'receita' ? valor : -valor,
        dia
    });
    
    salvarContasRecorrentes();
    renderizarContasRecorrentes();
    modalRecorrente.style.display = 'none';
    limparFormularios();
});

function removerContaRecorrente(id) {
    contasRecorrentes = contasRecorrentes.filter(c => c.id !== id);
    salvarContasRecorrentes();
    renderizarContasRecorrentes();
}

function renderizarContasRecorrentes() {
    listaRecorrentes.innerHTML = '';
    
    contasRecorrentes.forEach(conta => {
        const li = document.createElement('li');
        li.className = conta.valor >= 0 ? 'receita' : 'despesa';
        
        li.innerHTML = `
            <div class="recorrente-info">
                <div class="recorrente-descricao">${conta.descricao}</div>
                <div class="recorrente-dia">Todo dia ${conta.dia} do mês
                    <span class="recorrente-categoria">${conta.categoria}</span>
                </div>
            </div>
            <div class="recorrente-valor">
                ${conta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div class="recorrente-actions">
                <button class="btn-acao" onclick="gerarTransacaoDeRecorrente(${conta.id})">
                    <i class="fas fa-sync"></i>
                </button>
                <button class="btn-acao delete" onclick="removerContaRecorrente(${conta.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        listaRecorrentes.appendChild(li);
    });
}

function gerarTransacaoDeRecorrente(id) {
    const conta = contasRecorrentes.find(c => c.id === id);
    if (!conta) return;
    
    const hoje = new Date();
    const dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), conta.dia);
    
    // Se o dia já passou este mês, ajustar para o próximo mês
    if (hoje.getDate() > conta.dia) {
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
    }
    
    adicionarTransacao({
        id: Date.now(),
        descricao: conta.descricao,
        categoria: conta.categoria,
        valor: conta.valor,
        data: dataVencimento.toISOString().split('T')[0],
        comprovante: null
    });
}

// Funções específicas para o saldo inicial
function criarTransacaoSaldoInicial() {
    // Verifica se já existe uma transação de saldo inicial
    const saldoInicialExistente = transacoes.find(t => t.descricao === '[Saldo Inicial]' && t.categoria === 'sistema');
    
    // Se não existir e o valor for maior que 0, cria a transação
    if (!saldoInicialExistente && configuracoes.saldoInicial > 0) {
        const dataInicial = new Date(2025, 0, 1); // 1º de janeiro de 2025
        
        adicionarTransacaoSilenciosa({
            id: 'saldo-inicial',
            descricao: '[Saldo Inicial]',
            categoria: 'sistema',
            valor: configuracoes.saldoInicial,
            data: dataInicial.toISOString().split('T')[0],
            comprovante: null
        });
    } 
    // Se existir mas o valor está diferente, atualiza
    else if (saldoInicialExistente && saldoInicialExistente.valor !== configuracoes.saldoInicial) {
        removerTransacao('saldo-inicial', true);
        
        // Se o novo valor for > 0, cria a transação novamente
        if (configuracoes.saldoInicial > 0) {
            const dataInicial = new Date(2025, 0, 1); // 1º de janeiro de 2025
            
            adicionarTransacaoSilenciosa({
                id: 'saldo-inicial',
                descricao: '[Saldo Inicial]',
                categoria: 'sistema',
                valor: configuracoes.saldoInicial,
                data: dataInicial.toISOString().split('T')[0],
                comprovante: null
            });
        }
    }
}

// Configurações
formConfig.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const novoSaldoInicial = parseFloat(inputSaldoInicial.value) || 0;
    configuracoes.saldoInicial = novoSaldoInicial;
    configuracoes.chequeEspecial = parseFloat(inputChequeEspecial.value) || 0;
    
    salvarConfiguracoes();
    criarTransacaoSaldoInicial();
    atualizarDashboard();
    renderizarTransacoes();
    
    // Mostrar feedback visual
    mostrarNotificacao('Configurações salvas com sucesso!');
});

function carregarConfiguracoes() {
    // Garantir que recuperou corretamente os valores
    const configSalvas = JSON.parse(localStorage.getItem('configuracoes')) || { saldoInicial: 0, chequeEspecial: 0 };
    configuracoes = configSalvas;
    
    // Compatibilidade com versão anterior que usava "salario" ao invés de "saldoInicial"
    if (configuracoes.salario !== undefined && configuracoes.saldoInicial === undefined) {
        configuracoes.saldoInicial = configuracoes.salario;
        delete configuracoes.salario;
        salvarConfiguracoes();
    }
    
    // Preencher os campos com os valores reais do localStorage
    inputSaldoInicial.value = configuracoes.saldoInicial || '';
    inputChequeEspecial.value = configuracoes.chequeEspecial || '';
    
    console.log('Configurações carregadas:', configuracoes);
}

// Dashboard
function atualizarDashboard() {
    // Calcula saldo atual
    const saldo = transacoes.reduce((acc, t) => acc + t.valor, 0);
    
    // Atualiza saldo e aplica cor baseada no valor
    saldoAtual.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (saldo < 0) {
        saldoAtual.style.color = '#ef4444'; // Vermelho
    } else {
        saldoAtual.style.color = '#10b981'; // Verde
    }
    
    // Calcula receitas e despesas do mês atual
    const dataAtual = new Date();
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    
    const transacoesMes = transacoes.filter(t => {
        // Ignorar transação de saldo inicial nos totais mensais
        if (t.descricao === '[Saldo Inicial]' && t.categoria === 'sistema') {
            return false;
        }
        
        const data = new Date(t.data);
        return data.getMonth() === mes && data.getFullYear() === ano;
    });
    
    // Transações do mês anterior para cálculo de percentuais
    const mesAnterior = mes === 0 ? 11 : mes - 1;
    const anoAnterior = mes === 0 ? ano - 1 : ano;
    
    const transacoesMesAnterior = transacoes.filter(t => {
        // Ignorar transação de saldo inicial
        if (t.descricao === '[Saldo Inicial]' && t.categoria === 'sistema') {
            return false;
        }
        
        const data = new Date(t.data);
        return data.getMonth() === mesAnterior && data.getFullYear() === anoAnterior;
    });
    
    // Cálculos do mês atual
    const totalReceitas = transacoesMes
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
        
    const totalDespesas = transacoesMes
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    // Cálculos do mês anterior
    const totalReceitasMesAnterior = transacoesMesAnterior
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
        
    const totalDespesasMesAnterior = transacoesMesAnterior
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
    
    // Quantidade de entradas e saídas no mês atual
    const qtdEntradas = transacoesMes.filter(t => t.valor > 0).length;
    const qtdSaidas = transacoesMes.filter(t => t.valor < 0).length;
    
    // Cálculo de percentuais comparativos
    let percentualEntradas = 0;
    let percentualSaidas = 0;
    let entradasCrescimento = true;
    let saidasCrescimento = false; // Crescimento das despesas é ruim, portanto invertemos a lógica
    
    if (totalReceitasMesAnterior > 0) {
        const diferencaEntradas = totalReceitas - totalReceitasMesAnterior;
        percentualEntradas = Math.round((diferencaEntradas / totalReceitasMesAnterior) * 100);
        entradasCrescimento = diferencaEntradas >= 0;
    }
    
    if (totalDespesasMesAnterior > 0) {
        const diferencaSaidas = totalDespesas - totalDespesasMesAnterior;
        percentualSaidas = Math.round((diferencaSaidas / totalDespesasMesAnterior) * 100);
        saidasCrescimento = diferencaSaidas < 0; // Crescimento negativo (redução) é bom para despesas
    }
    
    // Atualizar valores nos placares
    entradasMes.textContent = totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    saidasMes.textContent = totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Atualizar quantidades
    document.getElementById('qtd-entradas').textContent = qtdEntradas;
    document.getElementById('qtd-saidas').textContent = qtdSaidas;
    
    // Atualizar percentuais
    const percentualEntradasEl = document.getElementById('percentual-entradas');
    const percentualSaidasEl = document.getElementById('percentual-saidas');
    
    // Entradas - diferença percentual em relação ao mês anterior
    percentualEntradasEl.innerHTML = `
        <i class="fas fa-arrow-${entradasCrescimento ? 'up' : 'down'}"></i> 
        ${Math.abs(percentualEntradas)}%
    `;
    percentualEntradasEl.className = `placar-percentual ${entradasCrescimento ? 'positivo' : 'negativo'}`;
    
    // Saídas - diferença percentual em relação ao mês anterior
    percentualSaidasEl.innerHTML = `
        <i class="fas fa-arrow-${saidasCrescimento ? 'down' : 'up'}"></i> 
        ${Math.abs(percentualSaidas)}%
    `;
    percentualSaidasEl.className = `placar-percentual ${saidasCrescimento ? 'positivo' : 'negativo'}`;
    
    // Calcular limite de cheque especial disponível
    let limiteDisponivel = configuracoes.chequeEspecial;
    
    // Se o saldo é negativo, reduz o limite disponível
    if (saldo < 0) {
        limiteDisponivel = Math.max(0, configuracoes.chequeEspecial - Math.abs(saldo));
    }
    
    // Atualiza display do cheque especial (mostra o limite disponível)
    limiteChequeTxt.textContent = limiteDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Calcula uso do cheque especial se saldo for negativo
    if (saldo < 0 && configuracoes.chequeEspecial > 0) {
        const usoPercentual = Math.min((Math.abs(saldo) / configuracoes.chequeEspecial) * 100, 100);
        progressoCheque.style.width = `${usoPercentual}%`;
        
        // Mudar cor da barra de progresso conforme uso
        if (usoPercentual > 80) {
            progressoCheque.style.backgroundColor = '#ef4444'; // Vermelho
        } else if (usoPercentual > 50) {
            progressoCheque.style.backgroundColor = '#f59e0b'; // Amarelo/Laranja
        } else {
            progressoCheque.style.backgroundColor = '#2563eb'; // Azul
        }
    } else {
        progressoCheque.style.width = '0%';
    }
}

// Relatórios
btnGerarRelatorio.addEventListener('click', gerarRelatorio);

function gerarRelatorio() {
    const mes = parseInt(relatorioMes.value);
    const ano = parseInt(relatorioAno.value);
    
    const transacoesPeriodo = transacoes.filter(t => {
        const data = new Date(t.data);
        return data.getMonth() + 1 === mes && data.getFullYear() === ano;
    });
    
    const totalReceitas = transacoesPeriodo
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
        
    const totalDespesas = transacoesPeriodo
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
    const saldo = totalReceitas - totalDespesas;
    
    document.getElementById('relatorio-receitas').textContent = totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('relatorio-despesas').textContent = totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('relatorio-saldo').textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Gerar gráfico se existirem dados
    if (transacoesPeriodo.length > 0) {
        gerarGrafico(transacoesPeriodo, mes, ano);
    }
}

function gerarGrafico(transacoesPeriodo, mes, ano) {
    const ctx = document.getElementById('grafico-mensal').getContext('2d');
    
    // Categoriza as despesas
    const categoriasMap = {};
    
    transacoesPeriodo.filter(t => t.valor < 0).forEach(t => {
        if (!categoriasMap[t.categoria]) {
            categoriasMap[t.categoria] = 0;
        }
        categoriasMap[t.categoria] += Math.abs(t.valor);
    });
    
    const categorias = Object.keys(categoriasMap);
    const valores = Object.values(categoriasMap);
    
    // Cores para o gráfico
    const cores = [
        '#2563eb', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', 
        '#db2777', '#e11d48', '#f97316', '#eab308', '#84cc16'
    ];
    
    // Verificar se já existe um gráfico e destruí-lo antes de criar um novo
    if (window.graficoMensal) {
        window.graficoMensal.destroy();
    }
    
    // Cria um novo gráfico
    window.graficoMensal = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Despesas por Categoria',
                data: valores,
                backgroundColor: cores.slice(0, categorias.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: `Despesas por Categoria - ${obterNomeMes(mes)}/${ano}`
                }
            }
        }
    });
}

function obterNomeMes(numeroMes) {
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Converter para número para garantir o tipo correto
    numeroMes = parseInt(numeroMes);
    
    // Garantir que o número do mês seja válido (entre 1 e 12)
    if (numeroMes >= 1 && numeroMes <= 12) {
        return meses[numeroMes - 1];
    } else {
        console.error('Número de mês inválido:', numeroMes);
        return 'Mês desconhecido';
    }
}

// Filtros
filtroTipo.addEventListener('change', () => {
    renderizarTransacoes();
    atualizarExtratoBancario();
});
filtroMes.addEventListener('change', () => {
    renderizarTransacoes();
    atualizarExtratoBancario();
});
filtroAno.addEventListener('change', () => {
    renderizarTransacoes();
    atualizarExtratoBancario();
});

// Exportar e Importar Dados
btnExportar.addEventListener('click', exportarDados);
btnImportar.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', importarDados);

function exportarDados() {
    const dados = {
        transacoes,
        contasRecorrentes,
        configuracoes
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle_financeiro_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importarDados(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            if (dados.transacoes) {
                transacoes = dados.transacoes;
                salvarTransacoes();
            }
            
            if (dados.contasRecorrentes) {
                contasRecorrentes = dados.contasRecorrentes;
                salvarContasRecorrentes();
            }
            
            if (dados.configuracoes) {
                configuracoes = dados.configuracoes;
                salvarConfiguracoes();
                carregarConfiguracoes();
            }
            
            atualizarDashboard();
            renderizarTransacoes();
            renderizarContasRecorrentes();
            atualizarExtratoBancario();
            
            alert('Dados importados com sucesso!');
        } catch (error) {
            alert('Erro ao importar dados. Verifique o formato do arquivo.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    importFile.value = '';
}

// Funções de Utilidade
function limparFormularios() {
    formNovaTransacao.reset();
    formNovaRecorrente.reset();
    formEditarTransacao.reset();
    previewComprovante.innerHTML = '';
    editarPreviewComprovante.innerHTML = '';
    comprovanteAtual.innerHTML = '';
}

function salvarTransacoes() {
    localStorage.setItem('transacoes', JSON.stringify(transacoes));
}

function salvarContasRecorrentes() {
    localStorage.setItem('contasRecorrentes', JSON.stringify(contasRecorrentes));
}

function salvarConfiguracoes() {
    localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    // Verificar se já existe uma notificação e removê-la
    const notificacaoExistente = document.querySelector('.notificacao');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }
    
    // Criar e mostrar notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    // Cores baseadas no tipo
    const corFundo = tipo === 'sucesso' ? '#10b981' : '#ef4444';
    
    // Aplicar estilo à notificação
    notificacao.style.position = 'fixed';
    notificacao.style.bottom = '20px';
    notificacao.style.right = '20px';
    notificacao.style.backgroundColor = corFundo;
    notificacao.style.color = 'white';
    notificacao.style.padding = '12px 20px';
    notificacao.style.borderRadius = '6px';
    notificacao.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
    notificacao.style.zIndex = '9999';
    notificacao.style.opacity = '0';
    notificacao.style.transform = 'translateY(20px)';
    notificacao.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Animar entrada
    setTimeout(() => {
        notificacao.style.opacity = '1';
        notificacao.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            notificacao.remove();
        }, 300);
    }, 3000);
}

// Função para atualizar o extrato bancário
function atualizarExtratoBancario() {
    // Obter o período selecionado
    const mes = parseInt(filtroMes.value);
    const ano = parseInt(filtroAno.value);
    
    // Filtrar as transações do mês selecionado
    let transacoesFiltradas = [...transacoes];
    
    if (filtroTipo.value === 'receitas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor > 0);
    } else if (filtroTipo.value === 'despesas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor < 0);
    }
    
    if (filtroMes.value !== '0') {
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const data = new Date(t.data);
            return data.getMonth() + 1 === mes;
        });
    }
    
    if (filtroAno.value) {
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const data = new Date(t.data);
            return data.getFullYear() === ano;
        });
    }
    
    // Ordenar por data (mais antiga primeiro)
    transacoesFiltradas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // Atualizar a tabela de extrato
    extratoTransacoes.innerHTML = '';
    
    // Verifica se existem transações
    if (transacoesFiltradas.length === 0) {
        extratoEmpty.style.display = 'flex';
        return;
    } else {
        extratoEmpty.style.display = 'none';
    }
    
    // Calcular o saldo anterior (saldo no início do mês)
    const inicioMes = new Date(ano, mes - 1, 1);
    const transacoesAnteriores = transacoes.filter(t => {
        const data = new Date(t.data);
        return data < inicioMes;
    });
    
    let saldoAnt = transacoesAnteriores.reduce((acc, t) => acc + t.valor, 0);
    let saldoAtual = saldoAnt;
    
    // Exibir o saldo anterior no resumo
    saldoAnterior.textContent = saldoAnt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Calcular e exibir totais
    const totalEntradas = transacoesFiltradas
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
        
    const totalSaidas = transacoesFiltradas
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0);
        
    document.getElementById('total-entradas').textContent = 
        totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
    document.getElementById('total-saidas').textContent = 
        totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
    const saldoFim = saldoAnt + totalEntradas - totalSaidas;
    document.getElementById('saldo-final').textContent = 
        saldoFim.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // Preencher a tabela de extrato
    transacoesFiltradas.forEach(transacao => {
        // Atualizar o saldo para esta transação
        saldoAtual += transacao.valor;
        
        const tr = document.createElement('tr');
        tr.className = transacao.valor >= 0 ? 'extrato-receita' : 'extrato-despesa';
        
        const data = new Date(transacao.data);
        const dataFormatada = data.toLocaleDateString('pt-BR');
        
        // Não exibir botões de edição para a transação de saldo inicial do sistema
        const ehTransacaoSistema = transacao.categoria === 'sistema' && transacao.descricao === '[Saldo Inicial]';
        
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${transacao.descricao} ${transacao.comprovante ? '<i class="fas fa-receipt btn-ver-comprovante" data-id="' + transacao.id + '" title="Ver comprovante"></i>' : ''}</td>
            <td>${transacao.categoria}</td>
            <td class="valor-td ${transacao.valor >= 0 ? 'positivo' : 'negativo'}">
                ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
            <td class="saldo-td ${saldoAtual >= 0 ? 'positivo' : 'negativo'}">
                ${saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
            <td class="acoes-td">
                ${!ehTransacaoSistema ? `
                    <button class="btn-acao edit" onclick="editarTransacao('${transacao.id}')" title="Editar">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                ` : ''}
                <button class="btn-acao delete" onclick="confirmarExclusao('${transacao.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        extratoTransacoes.appendChild(tr);
        
        // Adicionar evento para visualizar comprovante, se existir
        if (transacao.comprovante) {
            const btnComprovante = tr.querySelector('.btn-ver-comprovante');
            if (btnComprovante) {
                btnComprovante.addEventListener('click', () => {
                    visualizarComprovante(transacao);
                });
            }
        }
    });
}

// Função para imprimir o extrato
function imprimirExtrato() {
    window.print();
}

// Função para depurar transações
function debugTransacoes() {
    console.log('=== DEPURAÇÃO DE TRANSAÇÕES ===');
    
    // Mostrar todas as transações
    console.log('Total de transações:', transacoes.length);
    console.log('Transações com valor >= 1500:');
    
    // Procurar especificamente por transações com valor próximo a 1556
    const transacoesAltoValor = transacoes.filter(t => Math.abs(t.valor) >= 1500);
    console.log(transacoesAltoValor);
    
    // Verificar filtros atuais
    const mesFiltro = parseInt(filtroMes.value);
    const anoFiltro = parseInt(filtroAno.value);
    console.log('Filtro atual - Mês:', mesFiltro, '(', obterNomeMes(mesFiltro), ')', 'Ano:', anoFiltro);
    
    // Data atual
    const dataAtual = new Date();
    console.log('Data atual:', dataAtual.toLocaleDateString(), 'Mês atual:', dataAtual.getMonth() + 1);
    
    // Se há uma transação de ~1556, verificar sua data
    const transacao1556 = transacoes.find(t => Math.abs(t.valor) >= 1500 && Math.abs(t.valor) <= 1600);
    if (transacao1556) {
        console.log('Transação de ~1556 encontrada:', transacao1556);
        const data = new Date(transacao1556.data);
        console.log('Data da transação:', data.toLocaleDateString(), 'Mês da transação:', data.getMonth() + 1);
        
        // Verificar se a transação deveria estar visível com os filtros atuais
        const deveAparecer = 
            (mesFiltro === 0 || data.getMonth() + 1 === mesFiltro) && 
            (anoFiltro === 0 || data.getFullYear() === anoFiltro);
            
        console.log('Esta transação deveria aparecer no filtro atual:', deveAparecer ? 'SIM' : 'NÃO');
        
        // Se ela deveria aparecer mas não está aparecendo, mostrar mensagem
        mostrarNotificacao(`Depuração: Transação de ${Math.abs(transacao1556.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ${deveAparecer ? 'deveria estar visível' : 'não está visível devido ao filtro de data'}`);
        
        // Ajustar filtros para mostrar a transação
        if (!deveAparecer) {
            filtroMes.value = data.getMonth() + 1;
            filtroAno.value = data.getFullYear();
            renderizarTransacoes();
            atualizarExtratoBancario();
            mostrarNotificacao('Filtros ajustados para mostrar a transação de 1556');
        }
    } else {
        mostrarNotificacao('Não foi encontrada nenhuma transação com valor próximo a R$ 1.556,00');
    }
}