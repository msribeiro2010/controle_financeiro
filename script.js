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

// Variáveis globais para os gráficos
let graficoCategoriasChart = null;
let graficoEvolucaoChart = null;

// Elementos DOM para relatórios
const relatorioTipo = document.getElementById('relatorio-tipo');
const btnExportarRelatorio = document.getElementById('btn-exportar-relatorio');
const relatorioContent = document.getElementById('relatorio-content');
const semDadosRelatorio = document.getElementById('sem-dados-relatorio');
const comparativoReceitas = document.getElementById('comparativo-receitas');
const comparativoDespesas = document.getElementById('comparativo-despesas');
const relatorioSaudeFinanceira = document.getElementById('relatorio-saude-financeira');
const tabelaCategoriasBody = document.getElementById('tabela-categorias-body');
const dicasContainer = document.getElementById('dicas-container');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar elementos críticos antes de prosseguir
    const elementosCriticos = {
        formNovaTransacao,
        formConfig,
        saldoAtual,
        entradasMes,
        saidasMes,
        limiteChequeTxt,
        progressoCheque,
        filtroTipo,
        filtroMes,
        inputSaldoInicial,
        inputChequeEspecial
    };
    
    const elementosFaltando = Object.entries(elementosCriticos)
        .filter(([_, element]) => !element)
        .map(([name]) => name);
    
    if (elementosFaltando.length > 0) {
        console.error('Elementos críticos não encontrados:', elementosFaltando);
        mostrarNotificacao('Erro ao carregar alguns elementos da página. Por favor, recarregue.', 'erro');
        return;
    }
    
    carregarConfiguracoes();
    criarTransacaoSaldoInicial();
    atualizarDashboard();
    renderizarTransacoes();
    renderizarContasRecorrentes();
    
    // Definir mês atual nos seletores
    const dataAtual = new Date();
    if (filtroMes) filtroMes.value = dataAtual.getMonth() + 1;
    if (relatorioMes) relatorioMes.value = dataAtual.getMonth() + 1;
    
    // Adicionar data atual ao campo de data
    const novaData = document.getElementById('nova-data');
    if (novaData) novaData.valueAsDate = new Date();
    
    // Definir data atual no extrato e filtro
    if (extratoData) extratoData.textContent = `${obterNomeMes(dataAtual.getMonth() + 1)}/${dataAtual.getFullYear()}`;
    if (filtroAno) filtroAno.value = dataAtual.getFullYear();
    
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
    const currentTab = document.querySelector('.tab-btn.active');
    if (currentTab && currentTab.getAttribute('data-tab') === 'transacoes') {
        console.log('Aba de transações já está ativa, atualizando...');
        if (filtroMes) filtroMes.value = dataAtual.getMonth() + 1;
        if (filtroAno) filtroAno.value = dataAtual.getFullYear();
        atualizarExtratoBancario();
    }
    
    // Força a atualização para garantir que o filtro de data seja respeitado
    renderizarTransacoes();
    
    // Inicializar relatório
    inicializarRelatorio();
});

// Sistema de navegação por abas
function inicializarNavegacao() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabs || tabs.length === 0) {
        console.error('Erro: Botões de navegação não encontrados');
        mostrarNotificacao('Erro ao carregar a navegação. Por favor, recarregue a página.', 'erro');
        return;
    }
    
    if (!tabContents || tabContents.length === 0) {
        console.error('Erro: Conteúdo das abas não encontrado');
        mostrarNotificacao('Erro ao carregar o conteúdo. Por favor, recarregue a página.', 'erro');
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                const tabId = tab.getAttribute('data-tab');
                
                if (!tabId) {
                    console.error('Erro: ID da aba não encontrado');
                    return;
                }
                
                const targetTab = document.getElementById(tabId);
                if (!targetTab) {
                    console.error(`Erro: Conteúdo da aba #${tabId} não encontrado`);
                    return;
                }
                
                // Remover classe ativa de todas as abas
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Adicionar classe ativa à aba selecionada
                tab.classList.add('active');
                targetTab.classList.add('active');
                
                // Atualizar conteúdo específico da aba
                if (tabId === 'transacoes') {
                    console.log('Atualizando extrato bancário...');
                    setTimeout(() => {
                        try {
                            atualizarExtratoBancario();
                        } catch (err) {
                            console.error('Erro ao atualizar extrato:', err);
                            mostrarNotificacao('Erro ao atualizar o extrato bancário', 'erro');
                        }
                    }, 0);
                } else if (tabId === 'relatorios') {
                    console.log('Atualizando relatórios...');
                    setTimeout(() => {
                        try {
                            gerarRelatorio();
                        } catch (err) {
                            console.error('Erro ao gerar relatório:', err);
                            mostrarNotificacao('Erro ao gerar o relatório', 'erro');
                        }
                    }, 0);
                }
            } catch (err) {
                console.error('Erro ao mudar de aba:', err);
                mostrarNotificacao('Erro ao mudar de aba. Por favor, tente novamente.', 'erro');
            }
        });
    });
    
    // Garantir que a primeira aba esteja ativa
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab && tabs.length > 0) {
        tabs[0].click();
    }
}

// Inicializar navegação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        inicializarNavegacao();
    } catch (err) {
        console.error('Erro ao inicializar navegação:', err);
        mostrarNotificacao('Erro ao inicializar a navegação. Por favor, recarregue a página.', 'erro');
    }
});

// Funções para Modal
if (btnNovaTransacao && modalTransacao) {
    btnNovaTransacao.addEventListener('click', () => {
        modalTransacao.style.display = 'block';
    });
}

if (btnNovaRecorrente && modalRecorrente) {
    btnNovaRecorrente.addEventListener('click', () => {
        modalRecorrente.style.display = 'block';
    });
}

if (btnNovaTransacaoExtrato && modalTransacao) {
    btnNovaTransacaoExtrato.addEventListener('click', () => {
        modalTransacao.style.display = 'block';
    });
}

// Adicionar evento de submissão ao formulário de edição
if (formEditarTransacao) {
    formEditarTransacao.addEventListener('submit', (e) => {
        e.preventDefault();
        salvarTransacaoEditada();
    });
}

// Botões de fechar modais
if (closeBtns && closeBtns.length > 0) {
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (modalTransacao) modalTransacao.style.display = 'none';
            if (modalRecorrente) modalRecorrente.style.display = 'none';
            if (modalEditarTransacao) modalEditarTransacao.style.display = 'none';
            limparFormularios();
        });
    });
}

// Fechar modais ao clicar fora
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
    try {
        // Obter elementos do formulário
        const descricaoEl = document.getElementById('nova-descricao');
        const categoriaEl = document.getElementById('nova-categoria');
        const valorEl = document.getElementById('novo-valor');
        const tipoEl = document.getElementById('novo-tipo');
        const dataEl = document.getElementById('nova-data');
        
        // Verificar se todos os elementos existem
        if (!descricaoEl || !categoriaEl || !valorEl || !tipoEl || !dataEl) {
            mostrarNotificacao('Erro: Elementos do formulário não encontrados.', 'erro');
            return;
        }
        
        // Obter valores dos elementos
        const descricao = descricaoEl.value;
        const categoria = categoriaEl.value;
        const valor = parseFloat(valorEl.value);
        const tipo = tipoEl.value;
        const data = dataEl.value;
        
        // Verificar se o valor é válido
        if (isNaN(valor) || valor <= 0) {
            mostrarNotificacao('Informe um valor válido maior que zero.', 'erro');
            return;
        }
        
        // Processar comprovante se existir
        let comprovante = null;
        if (inputComprovante && inputComprovante.files && inputComprovante.files[0]) {
            comprovante = await getBase64(inputComprovante.files[0]);
        }
        
        // Valor efetivo (positivo para receita, negativo para despesa)
        const valorEfetivo = tipo === 'receita' ? valor : -valor;
        
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
        if (modalTransacao) {
            modalTransacao.style.display = 'none';
        }
        limparFormularios();
        
        // Mostrar notificação de sucesso
        mostrarNotificacao(`${tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
    } catch (err) {
        console.error('Erro ao adicionar transação:', err);
        mostrarNotificacao('Erro inesperado ao adicionar transação. Veja o console para detalhes.', 'erro');
    }
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
    if (!transacao) {
        mostrarNotificacao('Transação não encontrada.', 'erro');
        return;
    }
    
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
        // Animação de saída para o modal
        modalConfirmacao.style.opacity = '0';
        setTimeout(() => {
            modalConfirmacao.remove();
        }, 300);
    });

    document.getElementById('btn-confirmar').addEventListener('click', () => {
        // Aplicar animação de fade-out no elemento da lista antes de remover
        const elementosTransacao = document.querySelectorAll(`[data-transaction-id="${id}"]`);
        if (elementosTransacao.length > 0) {
            elementosTransacao.forEach(elemento => {
                elemento.style.transition = 'opacity 0.3s, transform 0.3s';
                elemento.style.opacity = '0';
                elemento.style.transform = 'translateX(20px)';
            });
            
            // Esperar a animação terminar antes de remover
            setTimeout(() => {
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
                
                // Fechar modal com animação
                modalConfirmacao.style.opacity = '0';
                setTimeout(() => {
                    modalConfirmacao.remove();
                }, 300);
            }, 300);
        } else {
            // Caso não encontre o elemento na DOM, remover diretamente
            transacoes = transacoes.filter(t => t.id != id);
            salvarTransacoes();
            atualizarDashboard();
            renderizarTransacoes();
            atualizarExtratoBancario();
            mostrarNotificacao('Transação removida com sucesso!');
            
            // Fechar modal
            modalConfirmacao.style.opacity = '0';
            setTimeout(() => {
                modalConfirmacao.remove();
            }, 300);
        }
    });

    // Adicionar animação de entrada ao modal
    modalConfirmacao.style.opacity = '0';
    modalConfirmacao.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        modalConfirmacao.style.opacity = '1';
    }, 10);

    // Fechar ao clicar fora do modal
    modalConfirmacao.addEventListener('click', (e) => {
        if (e.target === modalConfirmacao) {
            modalConfirmacao.style.opacity = '0';
            setTimeout(() => {
                modalConfirmacao.remove();
            }, 300);
        }
    });
}

function renderizarTransacoes() {
    // Verificar se os elementos necessários existem
    if (!filtroTipo || !filtroMes) {
        console.error('Elementos de filtro não encontrados');
        return;
    }
    
    // Filtrar transações
    let transacoesFiltradas = [...transacoes];
    
    // Filtrar transações não-sistema para exibição na lista completa
    transacoesFiltradas = transacoesFiltradas.filter(t => !(t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]'));
    
    if (filtroTipo.value === 'receitas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor > 0);
    } else if (filtroTipo.value === 'despesas') {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.valor < 0);
    }
    
    if (filtroMes.value !== '0') { // Alterado para '0' que é o valor para "Todos os meses"
        const mes = parseInt(filtroMes.value);
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const data = new Date(t.data);
            return data.getMonth() + 1 === mes;
        });
    }
    
    // Ordenar por data (mais recente primeiro)
    transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Renderizar no extrato de transações
    const extratoTransacoes = document.getElementById('extrato-transacoes');
    if (extratoTransacoes) {
        extratoTransacoes.innerHTML = '';
        let saldoAcumulado = 0;
        
        transacoesFiltradas.forEach(transacao => {
            const tr = document.createElement('tr');
            const data = new Date(transacao.data);
            saldoAcumulado += transacao.valor;
            
            tr.innerHTML = `
                <td>${data.toLocaleDateString('pt-BR')}</td>
                <td>${transacao.descricao}</td>
                <td>${formatarCategoria(transacao.categoria)}</td>
                <td class="${transacao.valor >= 0 ? 'positivo' : 'negativo'}">
                    ${transacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td class="${saldoAcumulado >= 0 ? 'positivo' : 'negativo'}">
                    ${saldoAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td>
                    ${transacao.categoria !== 'sistema' ? `
                        <button class="btn-acao edit" onclick="editarTransacao('${transacao.id}')">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    ` : ''}
                    <button class="btn-acao delete" onclick="confirmarExclusao('${transacao.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${transacao.comprovante ? `
                        <button class="btn-acao view" onclick="visualizarComprovante(${JSON.stringify(transacao).replace(/"/g, '&quot;')})">
                            <i class="fas fa-file"></i>
                        </button>
                    ` : ''}
                </td>
            `;
            extratoTransacoes.appendChild(tr);
        });
        
        // Mostrar ou esconder mensagem de "nenhuma transação"
        const extratoEmpty = document.getElementById('extrato-empty');
        if (extratoEmpty) {
            extratoEmpty.style.display = transacoesFiltradas.length === 0 ? 'flex' : 'none';
        }
    }
    
    // Renderizar nas últimas transações do dashboard (5 mais recentes)
    const ultimasTransacoes = document.getElementById('ultimas-transacoes');
    if (ultimasTransacoes) {
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
}

function criarElementoTransacao(transacao) {
    const li = document.createElement('li');
    li.className = transacao.valor >= 0 ? 'receita' : 'despesa';
    li.setAttribute('data-transaction-id', transacao.id);
    
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
    try {
        // Verificar se já existe uma transação de saldo inicial
        const saldoInicialExistente = transacoes.find(t => 
            t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]');
        
        // Se existir, remover a transação antiga
        if (saldoInicialExistente) {
            transacoes = transacoes.filter(t => 
                !(t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]'));
        }
        
        // Criar nova transação de saldo inicial se o valor for diferente de 0
        if (configuracoes.saldoInicial !== 0) {
            const dataInicial = new Date(2025, 0, 1); // 1º de janeiro de 2025
            
            const novaTransacaoSaldoInicial = {
                id: 'saldo-inicial',
                descricao: '[Saldo Inicial]',
                categoria: 'sistema',
                valor: configuracoes.saldoInicial,
                data: dataInicial.toISOString().split('T')[0],
                comprovante: null
            };
            
            // Adicionar no início do array para manter consistência no extrato
            transacoes.unshift(novaTransacaoSaldoInicial);
        }
        
        // Salvar alterações
        salvarTransacoes();
        
        console.log('Saldo inicial atualizado:', configuracoes.saldoInicial);
        
    } catch (error) {
        console.error('Erro ao criar transação de saldo inicial:', error);
        mostrarNotificacao('Erro ao atualizar saldo inicial', 'erro');
    }
}

// Configurações
formConfig.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const novoSaldoInicial = parseFloat(inputSaldoInicial.value) || 0;
        const novoChequeEspecial = parseFloat(inputChequeEspecial.value) || 0;
        
        // Atualizar configurações
        configuracoes.saldoInicial = novoSaldoInicial;
        configuracoes.chequeEspecial = novoChequeEspecial;
        
        // Salvar configurações
        salvarConfiguracoes();
        
        // Atualizar transação de saldo inicial
        await criarTransacaoSaldoInicial();
        
        // Atualizar interface
        atualizarDashboard();
        renderizarTransacoes();
        atualizarExtratoBancario();
        
        mostrarNotificacao('Configurações salvas com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        mostrarNotificacao('Erro ao salvar configurações', 'erro');
    }
});

function carregarConfiguracoes() {
    // Verificar se os elementos necessários existem
    if (!inputSaldoInicial || !inputChequeEspecial) {
        console.error('Elementos de configuração não encontrados');
        return;
    }
    
    // Garantir que recuperou corretamente os valores
    const configSalvas = JSON.parse(localStorage.getItem('configuracoes')) || { saldoInicial: 0, chequeEspecial: 0 };
    configuracoes = configSalvas;
    
    // Compatibilidade com versão anterior que usava "salario" ao invés de "saldoInicial"
    if (configuracoes.salario !== undefined && configuracoes.saldoInicial === undefined) {
        configuracoes.saldoInicial = parseFloat(configuracoes.salario) || 0;
        delete configuracoes.salario;
        salvarConfiguracoes();
    }
    
    // Garantir que os valores são números
    configuracoes.saldoInicial = parseFloat(configuracoes.saldoInicial) || 0;
    configuracoes.chequeEspecial = parseFloat(configuracoes.chequeEspecial) || 0;
    
    // Preencher os campos com os valores reais do localStorage
    inputSaldoInicial.value = configuracoes.saldoInicial;
    inputChequeEspecial.value = configuracoes.chequeEspecial;
    
    // Salvar as configurações normalizadas
    salvarConfiguracoes();
    
    console.log('Configurações carregadas:', configuracoes);
}

// Dashboard
function atualizarDashboard() {
    // Verificar se os elementos necessários existem
    if (!saldoAtual || !entradasMes || !saidasMes || !limiteChequeTxt || !progressoCheque) {
        console.error('Elementos do dashboard não encontrados');
        return;
    }
    
    // Calcula saldo atual (incluindo saldo inicial)
    const saldo = calcularSaldoTotal(true);
    
    // Atualiza saldo e aplica cor baseada no valor
    saldoAtual.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    saldoAtual.style.color = saldo < 0 ? '#ef4444' : '#10b981';
    
    // Calcula receitas e despesas do mês atual
    const dataAtual = new Date();
    const mes = dataAtual.getMonth();
    const ano = dataAtual.getFullYear();
    
    const transacoesMes = transacoes.filter(t => {
        // Ignorar transação de saldo inicial nos totais mensais
        if (t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]') {
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
        if (t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]') {
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
    const qtdEntradasEl = document.getElementById('qtd-entradas');
    const qtdSaidasEl = document.getElementById('qtd-saidas');
    if (qtdEntradasEl) qtdEntradasEl.textContent = qtdEntradas;
    if (qtdSaidasEl) qtdSaidasEl.textContent = qtdSaidas;
    
    // Atualizar percentuais
    const percentualEntradasEl = document.getElementById('percentual-entradas');
    const percentualSaidasEl = document.getElementById('percentual-saidas');
    
    if (percentualEntradasEl) {
        percentualEntradasEl.innerHTML = `
            <i class="fas fa-arrow-${entradasCrescimento ? 'up' : 'down'}"></i> 
            ${Math.abs(percentualEntradas)}%
        `;
        percentualEntradasEl.className = `placar-percentual ${entradasCrescimento ? 'positivo' : 'negativo'}`;
    }
    
    if (percentualSaidasEl) {
        percentualSaidasEl.innerHTML = `
            <i class="fas fa-arrow-${saidasCrescimento ? 'down' : 'up'}"></i> 
            ${Math.abs(percentualSaidas)}%
        `;
        percentualSaidasEl.className = `placar-percentual ${saidasCrescimento ? 'positivo' : 'negativo'}`;
    }
    
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
btnExportarRelatorio.addEventListener('click', exportarRelatorioPDF);
relatorioTipo.addEventListener('change', ajustarFormularioRelatorio);

// Função para ajustar o formulário baseado no tipo de relatório
function ajustarFormularioRelatorio() {
    const tipo = relatorioTipo.value;
    const relatorioMesLabel = document.querySelector('label[for="relatorio-mes"]');
    
    if (tipo === 'mensal') {
        relatorioMes.style.display = 'inline';
        relatorioMesLabel.style.display = 'inline';
    } else if (tipo === 'anual') {
        relatorioMes.style.display = 'none';
        relatorioMesLabel.style.display = 'none';
    } else if (tipo === 'personalizado') {
        // Implementação futura para período personalizado
        relatorioMes.style.display = 'inline';
        relatorioMesLabel.style.display = 'inline';
    }
}

// Função principal para gerar o relatório financeiro
function gerarRelatorio() {
    const tipo = relatorioTipo.value;
    const mes = parseInt(relatorioMes.value);
    const ano = parseInt(relatorioAno.value);
    
    // Limpar dados anteriores
    if (graficoCategoriasChart) {
        graficoCategoriasChart.destroy();
    }
    
    if (graficoEvolucaoChart) {
        graficoEvolucaoChart.destroy();
    }
    
    let transacoesFiltradas = [];
    let transacoesMesAnterior = [];
    
    if (tipo === 'mensal') {
        // Filtrar transações do mês selecionado
        transacoesFiltradas = transacoes.filter(t => {
            const data = new Date(t.data);
            return data.getFullYear() === ano && data.getMonth() + 1 === mes;
        });
        
        // Filtrar transações do mês anterior para comparação
        const mesAnterior = mes === 1 ? 12 : mes - 1;
        const anoAnterior = mes === 1 ? ano - 1 : ano;
        
        transacoesMesAnterior = transacoes.filter(t => {
            const data = new Date(t.data);
            return data.getFullYear() === anoAnterior && data.getMonth() + 1 === mesAnterior;
        });
    } else if (tipo === 'anual') {
        // Filtrar transações do ano selecionado
        transacoesFiltradas = transacoes.filter(t => {
            const data = new Date(t.data);
            return data.getFullYear() === ano;
        });
        
        // Filtrar transações do ano anterior
        transacoesMesAnterior = transacoes.filter(t => {
            const data = new Date(t.data);
            return data.getFullYear() === ano - 1;
        });
    }
    
    // Verificar se há dados suficientes para gerar o relatório
    if (transacoesFiltradas.length === 0) {
        relatorioContent.style.display = 'none';
        semDadosRelatorio.style.display = 'flex';
        return;
    } else {
        relatorioContent.style.display = 'block';
        semDadosRelatorio.style.display = 'none';
    }
    
    // Calcular totais
    const totalReceitas = transacoesFiltradas
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
    
    const totalDespesas = Math.abs(transacoesFiltradas
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + t.valor, 0));
    
    const saldoPeriodo = totalReceitas - totalDespesas;
    
    // Totais do período anterior para comparação
    const totalReceitasAnterior = transacoesMesAnterior
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
    
    const totalDespesasAnterior = Math.abs(transacoesMesAnterior
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + t.valor, 0));
    
    // Atualizar resumo do relatório
    document.getElementById('relatorio-receitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('relatorio-despesas').textContent = formatarMoeda(totalDespesas);
    document.getElementById('relatorio-saldo').textContent = formatarMoeda(saldoPeriodo);
    
    // Calcular percentuais de comparação com período anterior
    calcularComparativos(totalReceitas, totalReceitasAnterior, totalDespesas, totalDespesasAnterior);
    
    // Avaliar saúde financeira
    avaliarSaudeFinanceira(totalReceitas, totalDespesas);
    
    // Gerar gráficos
    gerarGraficoCategoria(transacoesFiltradas);
    gerarGraficoEvolucao(ano, mes, tipo);
    
    // Gerar tabela de análise de categorias
    gerarTabelaCategorias(transacoesFiltradas, transacoesMesAnterior);
    
    // Gerar dicas baseadas no padrão de gastos
    gerarDicasEconomia(transacoesFiltradas);
}

// Função para calcular e exibir comparativos com período anterior
function calcularComparativos(totalReceitas, totalReceitasAnterior, totalDespesas, totalDespesasAnterior) {
    let percentualReceitas = 0;
    let percentualDespesas = 0;
    
    // Calcular percentual de receitas
    if (totalReceitasAnterior > 0) {
        percentualReceitas = ((totalReceitas - totalReceitasAnterior) / totalReceitasAnterior) * 100;
    }
    
    // Calcular percentual de despesas
    if (totalDespesasAnterior > 0) {
        percentualDespesas = ((totalDespesas - totalDespesasAnterior) / totalDespesasAnterior) * 100;
    }
    
    // Atualizar os elementos na interface
    comparativoReceitas.innerHTML = `
        <i class="fas fa-${percentualReceitas >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
        ${Math.abs(percentualReceitas).toFixed(1)}% em relação ao período anterior
    `;
    comparativoReceitas.className = percentualReceitas >= 0 ? 'positivo' : 'negativo';
    
    comparativoDespesas.innerHTML = `
        <i class="fas fa-${percentualDespesas >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
        ${Math.abs(percentualDespesas).toFixed(1)}% em relação ao período anterior
    `;
    // Para despesas, aumentar é negativo e diminuir é positivo
    comparativoDespesas.className = percentualDespesas >= 0 ? 'negativo' : 'positivo';
}

// Função para avaliar a saúde financeira
function avaliarSaudeFinanceira(receitas, despesas) {
    // Cálculo da taxa de comprometimento da renda
    const taxaComprometimento = receitas > 0 ? (despesas / receitas) * 100 : 0;
    
    let status = '';
    let classe = '';
    
    // Critérios para avaliação da saúde financeira
    if (taxaComprometimento <= 60) {
        status = 'Excelente';
        classe = 'positivo';
    } else if (taxaComprometimento <= 80) {
        status = 'Boa';
        classe = 'positivo';
    } else if (taxaComprometimento <= 100) {
        status = 'Regular';
        classe = 'neutro';
    } else {
        status = 'Atenção! Despesas maiores que receitas';
        classe = 'negativo';
    }
    
    // Atualizar o status na interface
    relatorioSaudeFinanceira.textContent = `Saúde Financeira: ${status}`;
    relatorioSaudeFinanceira.className = classe;
}

// Função para gerar o gráfico de categorias de despesa
function gerarGraficoCategoria(transacoes) {
    const ctx = document.getElementById('grafico-categorias').getContext('2d');
    
    // Agrupar despesas por categoria
    const categorias = {};
    const cores = {
        'alimentacao': '#FF6384',
        'transporte': '#36A2EB',
        'lazer': '#FFCE56',
        'saude': '#4BC0C0',
        'educacao': '#9966FF',
        'moradia': '#FF9F40',
        'outros': '#C9CBCF',
        'salario': '#7CFC00'
    };
    
    // Considerar apenas despesas (valores negativos)
    transacoes.filter(t => t.valor < 0).forEach(t => {
        if (!categorias[t.categoria]) {
            categorias[t.categoria] = 0;
        }
        categorias[t.categoria] += Math.abs(t.valor);
    });
    
    // Preparar dados para o gráfico
    const categoriasLabels = Object.keys(categorias);
    const categoriasValores = Object.values(categorias);
    const coresCategorias = categoriasLabels.map(cat => cores[cat] || '#C9CBCF');
    
    // Criar o gráfico
    graficoCategoriasChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categoriasLabels.map(formatarCategoria),
            datasets: [{
                data: categoriasValores,
                backgroundColor: coresCategorias,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        }
    });
}

// Função para gerar gráfico de evolução mensal
function gerarGraficoEvolucao(ano, mesSelecionado, tipo) {
    const ctx = document.getElementById('grafico-evolucao').getContext('2d');
    
    // Configuração inicial baseada no tipo de relatório
    let labels = [];
    let receitasPorPeriodo = [];
    let despesasPorPeriodo = [];
    
    if (tipo === 'mensal') {
        // Para relatório mensal, mostrar evolução diária
        const diasNoMes = new Date(ano, mesSelecionado, 0).getDate();
        labels = Array.from({length: diasNoMes}, (_, i) => i + 1);
        
        // Inicializar arrays com zeros
        receitasPorPeriodo = Array(diasNoMes).fill(0);
        despesasPorPeriodo = Array(diasNoMes).fill(0);
        
        // Popular os arrays com dados reais
        transacoes.forEach(t => {
            const data = new Date(t.data);
            if (data.getFullYear() === ano && data.getMonth() + 1 === mesSelecionado) {
                const dia = data.getDate() - 1;  // Índice base 0
                if (t.valor > 0) {
                    receitasPorPeriodo[dia] += t.valor;
                } else {
                    despesasPorPeriodo[dia] += Math.abs(t.valor);
                }
            }
        });
    } else if (tipo === 'anual') {
        // Para relatório anual, mostrar evolução mensal
        labels = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        
        // Inicializar arrays com zeros
        receitasPorPeriodo = Array(12).fill(0);
        despesasPorPeriodo = Array(12).fill(0);
        
        // Popular os arrays com dados reais
        transacoes.forEach(t => {
            const data = new Date(t.data);
            if (data.getFullYear() === ano) {
                const mes = data.getMonth();  // Índice base 0
                if (t.valor > 0) {
                    receitasPorPeriodo[mes] += t.valor;
                } else {
                    despesasPorPeriodo[mes] += Math.abs(t.valor);
                }
            }
        });
    }
    
    // Criar o gráfico
    graficoEvolucaoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitasPorPeriodo,
                    borderColor: '#4BC0C0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: despesasPorPeriodo,
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return context.dataset.label + ': ' + formatarMoeda(value);
                        }
                    }
                }
            }
        }
    });
}

// Função para gerar a tabela de análise de categorias
function gerarTabelaCategorias(transacoesAtuais, transacoesAnteriores) {
    // Limpar tabela existente
    tabelaCategoriasBody.innerHTML = '';
    
    // Agrupar despesas por categoria para o período atual
    const categoriasAtuais = {};
    transacoesAtuais.filter(t => t.valor < 0).forEach(t => {
        if (!categoriasAtuais[t.categoria]) {
            categoriasAtuais[t.categoria] = 0;
        }
        categoriasAtuais[t.categoria] += Math.abs(t.valor);
    });
    
    // Agrupar despesas por categoria para o período anterior
    const categoriasAnteriores = {};
    transacoesAnteriores.filter(t => t.valor < 0).forEach(t => {
        if (!categoriasAnteriores[t.categoria]) {
            categoriasAnteriores[t.categoria] = 0;
        }
        categoriasAnteriores[t.categoria] += Math.abs(t.valor);
    });
    
    // Calcular o total de despesas
    const totalDespesas = Object.values(categoriasAtuais).reduce((acc, val) => acc + val, 0);
    
    // Criar linhas da tabela
    Object.keys(categoriasAtuais).forEach(categoria => {
        const valor = categoriasAtuais[categoria];
        const percentual = (valor / totalDespesas) * 100;
        
        // Calcular evolução em relação ao período anterior
        const valorAnterior = categoriasAnteriores[categoria] || 0;
        let evolucao = 0;
        
        if (valorAnterior > 0) {
            evolucao = ((valor - valorAnterior) / valorAnterior) * 100;
        }
        
        // Criar a linha da tabela
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarCategoria(categoria)}</td>
            <td>${formatarMoeda(valor)}</td>
            <td>${percentual.toFixed(1)}%</td>
            <td class="${evolucao > 0 ? 'negativo' : evolucao < 0 ? 'positivo' : ''}">
                ${evolucao !== 0 ? `<i class="fas fa-${evolucao > 0 ? 'arrow-up' : 'arrow-down'}"></i> ${Math.abs(evolucao).toFixed(1)}%` : '-'}
            </td>
        `;
        
        tabelaCategoriasBody.appendChild(tr);
    });
}

// Função para gerar dicas de economia baseadas nos gastos
function gerarDicasEconomia(transacoes) {
    // Limpar dicas existentes
    dicasContainer.innerHTML = '';
    
    // Agrupar despesas por categoria
    const categorias = {};
    transacoes.filter(t => t.valor < 0).forEach(t => {
        if (!categorias[t.categoria]) {
            categorias[t.categoria] = 0;
        }
        categorias[t.categoria] += Math.abs(t.valor);
    });
    
    // Calcular o total de despesas
    const totalDespesas = Object.values(categorias).reduce((acc, val) => acc + val, 0);
    
    // Encontrar a categoria com maior gasto
    let maiorGasto = { categoria: '', valor: 0 };
    Object.keys(categorias).forEach(categoria => {
        if (categorias[categoria] > maiorGasto.valor) {
            maiorGasto = { categoria, valor: categorias[categoria] };
        }
    });
    
    // Definir dicas baseadas nas categorias
    const dicas = [];
    
    // Dica geral sobre economias
    dicas.push({
        titulo: 'Reserva de emergência',
        texto: 'Procure guardar pelo menos 10% da sua renda mensal para formar uma reserva de emergência equivalente a 6 meses de despesas.'
    });
    
    // Dicas específicas por categoria
    if (maiorGasto.categoria && (maiorGasto.valor / totalDespesas) > 0.3) {
        switch (maiorGasto.categoria) {
            case 'alimentacao':
                dicas.push({
                    titulo: 'Alimentação',
                    texto: 'Considere planejar refeições semanais, fazer lista de compras e aproveitar promoções para reduzir gastos com alimentação.'
                });
                break;
            case 'transporte':
                dicas.push({
                    titulo: 'Transporte',
                    texto: 'Avalie alternativas como transporte público, carona compartilhada ou bicicleta para reduzir gastos com combustível e estacionamento.'
                });
                break;
            case 'lazer':
                dicas.push({
                    titulo: 'Lazer',
                    texto: 'Busque alternativas gratuitas ou de baixo custo para entretenimento, como parques, eventos culturais gratuitos ou assinaturas compartilhadas.'
                });
                break;
            case 'moradia':
                dicas.push({
                    titulo: 'Moradia',
                    texto: 'Reavalie contratos de aluguel, considere renegociar ou busque alternativas mais econômicas para reduzir esse custo fixo.'
                });
                break;
            default:
                dicas.push({
                    titulo: 'Controle de gastos',
                    texto: 'Identifique despesas não essenciais que podem ser reduzidas ou eliminadas para melhorar seu saldo mensal.'
                });
        }
    }
    
    // Se as despesas são maiores que 80% das receitas
    const totalReceitas = transacoes
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0);
    
    if (totalReceitas > 0 && (totalDespesas / totalReceitas) > 0.8) {
        dicas.push({
            titulo: 'Alerta de orçamento',
            texto: 'Suas despesas estão consumindo mais de 80% da sua renda. Considere revisar seu orçamento para aumentar sua margem de segurança financeira.'
        });
    }
    
    // Renderizar dicas na interface
    dicas.forEach(dica => {
        const dicaElement = document.createElement('div');
        dicaElement.className = 'dica';
        dicaElement.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <div class="dica-conteudo">
                <h4>${dica.titulo}</h4>
                <p>${dica.texto}</p>
            </div>
        `;
        dicasContainer.appendChild(dicaElement);
    });
}

// Função para exportar o relatório em PDF
function exportarRelatorioPDF() {
    const relatorio = document.getElementById('relatorio-content');
    if (!relatorio || relatorio.style.display === 'none') {
        mostrarNotificacao('Não há relatório gerado para exportar!', 'erro');
        return;
    }
    const opt = {
        margin:       0.5,
        filename:     `relatorio_financeiro_${new Date().toISOString().slice(0,10)}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(relatorio).save();
}

// Função auxiliar para formatar nome da categoria
function formatarCategoria(categoria) {
    const categorias = {
        'salario': 'Salário',
        'alimentacao': 'Alimentação',
        'transporte': 'Transporte',
        'lazer': 'Lazer',
        'saude': 'Saúde',
        'educacao': 'Educação',
        'moradia': 'Moradia',
        'outros': 'Outros'
    };
    
    return categorias[categoria] || categoria;
}

// Função auxiliar para formatação de valores monetários
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    // Limpar formulários se existirem
    if (formNovaTransacao) {
        formNovaTransacao.reset();
    }
    if (formNovaRecorrente) {
        formNovaRecorrente.reset();
    }
    if (formEditarTransacao) {
        formEditarTransacao.reset();
    }
    
    // Limpar previews se existirem
    if (previewComprovante) {
        previewComprovante.innerHTML = '';
    }
    if (editarPreviewComprovante) {
        editarPreviewComprovante.innerHTML = '';
    }
    if (comprovanteAtual) {
        comprovanteAtual.innerHTML = '';
    }
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

// Funções para a seção de Relatório
function inicializarRelatorio() {
    const now = new Date();
    document.getElementById('relatorio-mes').value = now.getMonth() + 1;
    document.getElementById('relatorio-ano').value = now.getFullYear();
    
    document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorio);
    document.getElementById('btn-exportar-relatorio').addEventListener('click', exportarRelatorioPDF);
    
    // Inicializar os selects com os anos disponíveis
    atualizarAnosDisponiveis();
    
    // Gerar relatório inicial
    gerarRelatorio();
}

function atualizarAnosDisponiveis() {
    const selectAno = document.getElementById('relatorio-ano');
    selectAno.innerHTML = '';
    
    const transacoes = obterTodasTransacoes();
    const anosDisponiveis = new Set();
    
    // Adicionar o ano atual
    const anoAtual = new Date().getFullYear();
    anosDisponiveis.add(anoAtual);
    
    // Adicionar anos das transações
    transacoes.forEach(transacao => {
        const ano = new Date(transacao.data).getFullYear();
        anosDisponiveis.add(ano);
    });
    
    // Ordenar e adicionar ao select
    [...anosDisponiveis].sort().forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        selectAno.appendChild(option);
    });
    
    // Selecionar o ano atual
    selectAno.value = anoAtual;
}

function gerarRelatorio() {
    const tipoRelatorio = document.getElementById('relatorio-tipo').value;
    const mes = parseInt(document.getElementById('relatorio-mes').value);
    const ano = parseInt(document.getElementById('relatorio-ano').value);
    
    // Obter transações do período
    const transacoesPeriodo = filtrarTransacoesPorPeriodo(tipoRelatorio, mes, ano);
    
    if (transacoesPeriodo.length === 0) {
        // Mostrar mensagem de que não há dados
        document.getElementById('sem-dados-relatorio').style.display = 'flex';
        document.getElementById('relatorio-content').style.display = 'none';
        return;
    }
    
    // Ocultar mensagem de que não há dados e mostrar conteúdo
    document.getElementById('sem-dados-relatorio').style.display = 'none';
    document.getElementById('relatorio-content').style.display = 'block';
    
    // Processar e exibir os dados
    processarDadosRelatorio(transacoesPeriodo, tipoRelatorio, mes, ano);
}

function filtrarTransacoesPorPeriodo(tipo, mes, ano) {
    const transacoes = obterTodasTransacoes();
    
    return transacoes.filter(transacao => {
        const dataTransacao = new Date(transacao.data);
        const mesTransacao = dataTransacao.getMonth() + 1;
        const anoTransacao = dataTransacao.getFullYear();
        
        if (tipo === 'mensal') {
            return mesTransacao === mes && anoTransacao === ano;
        } else if (tipo === 'anual') {
            return anoTransacao === ano;
        }
        
        return false;
    });
}

function processarDadosRelatorio(transacoes, tipo, mes, ano) {
    // Calcular totais
    const totais = calcularTotais(transacoes);
    
    // Atualizar resumo financeiro
    atualizarResumoFinanceiro(totais, tipo, mes, ano);
    
    // Gerar gráficos
    gerarGraficoCategorias(transacoes);
    gerarGraficoEvolucao(tipo, mes, ano);
    
    // Analisar categorias
    analisarCategorias(transacoes, totais);
    
    // Gerar dicas baseadas nos dados
    gerarDicas(transacoes, totais);
}

function calcularTotais(transacoes) {
    const totais = {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        categorias: {},
        porMes: {}
    };
    
    transacoes.forEach(transacao => {
        const valor = parseFloat(transacao.valor);
        const dataTransacao = new Date(transacao.data);
        const mesAno = `${dataTransacao.getMonth() + 1}-${dataTransacao.getFullYear()}`;
        
        // Inicializar o mês se não existir
        if (!totais.porMes[mesAno]) {
            totais.porMes[mesAno] = { receitas: 0, despesas: 0, saldo: 0 };
        }
        
        // Processar valores baseado no tipo
        if (transacao.tipo === 'receita') {
            totais.receitas += valor;
            totais.porMes[mesAno].receitas += valor;
        } else {
            totais.despesas += valor;
            totais.porMes[mesAno].despesas += valor;
            
            // Processar categorias para despesas
            if (!totais.categorias[transacao.categoria]) {
                totais.categorias[transacao.categoria] = 0;
            }
            totais.categorias[transacao.categoria] += valor;
        }
    });
    
    // Calcular saldo
    totais.saldo = totais.receitas - totais.despesas;
    
    // Calcular saldo por mês
    for (const mes in totais.porMes) {
        totais.porMes[mes].saldo = totais.porMes[mes].receitas - totais.porMes[mes].despesas;
    }
    
    return totais;
}

function atualizarResumoFinanceiro(totais, tipo, mes, ano) {
    // Atualizar valores no resumo financeiro
    document.getElementById('relatorio-receitas').textContent = formatarMoeda(totais.receitas);
    document.getElementById('relatorio-despesas').textContent = formatarMoeda(totais.despesas);
    document.getElementById('relatorio-saldo').textContent = formatarMoeda(totais.saldo);
    
    // Calcular e atualizar comparativos (com o mês/ano anterior)
    const comparativo = calcularComparativo(tipo, mes, ano);
    
    if (comparativo) {
        const percentualReceitas = ((totais.receitas / comparativo.receitas - 1) * 100).toFixed(1);
        const percentualDespesas = ((totais.despesas / comparativo.despesas - 1) * 100).toFixed(1);
        
        document.getElementById('comparativo-receitas').textContent = 
            `${percentualReceitas > 0 ? '+' : ''}${percentualReceitas}%`;
        document.getElementById('comparativo-despesas').textContent = 
            `${percentualDespesas > 0 ? '+' : ''}${percentualDespesas}%`;
        
        document.getElementById('comparativo-receitas').classList.toggle('positivo', percentualReceitas > 0);
        document.getElementById('comparativo-receitas').classList.toggle('negativo', percentualReceitas < 0);
        
        document.getElementById('comparativo-despesas').classList.toggle('positivo', percentualDespesas < 0);
        document.getElementById('comparativo-despesas').classList.toggle('negativo', percentualDespesas > 0);
    } else {
        document.getElementById('comparativo-receitas').textContent = '';
        document.getElementById('comparativo-despesas').textContent = '';
    }
    
    // Atualizar saúde financeira
    const saudefinanceira = avaliarSaudeFinanceira(totais);
    document.getElementById('relatorio-saude-financeira').textContent = `Saúde Financeira: ${saudefinanceira.status}`;
    document.getElementById('relatorio-saude-financeira').className = `status ${saudefinanceira.classe}`;
}

function calcularComparativo(tipo, mes, ano) {
    let mesAnterior, anoAnterior;
    
    if (tipo === 'mensal') {
        mesAnterior = mes - 1;
        anoAnterior = ano;
        
        if (mesAnterior === 0) {
            mesAnterior = 12;
            anoAnterior--;
        }
    } else {
        mesAnterior = mes;
        anoAnterior = ano - 1;
    }
    
    const transacoesAnteriores = filtrarTransacoesPorPeriodo(tipo, mesAnterior, anoAnterior);
    
    if (transacoesAnteriores.length === 0) {
        return null;
    }
    
    return calcularTotais(transacoesAnteriores);
}

function avaliarSaudeFinanceira(totais) {
    const percentualDespesas = totais.receitas > 0 ? (totais.despesas / totais.receitas) * 100 : 100;
    let status, classe;
    
    if (percentualDespesas > 100) {
        status = 'Crítica';
        classe = 'negativo';
    } else if (percentualDespesas > 80) {
        status = 'Atenção';
        classe = 'alerta';
    } else if (percentualDespesas > 60) {
        status = 'Estável';
        classe = 'neutro';
    } else {
        status = 'Excelente';
        classe = 'positivo';
    }
    
    return { status, classe };
}

function gerarGraficoCategorias(transacoes) {
    const despesas = transacoes.filter(t => t.tipo === 'despesa');
    const categorias = {};
    
    // Agrupar por categoria
    despesas.forEach(transacao => {
        if (!categorias[transacao.categoria]) {
            categorias[transacao.categoria] = 0;
        }
        categorias[transacao.categoria] += parseFloat(transacao.valor);
    });
    
    // Preparar dados para o gráfico
    const labels = Object.keys(categorias);
    const dados = Object.values(categorias);
    const cores = gerarCoresAleatorias(labels.length);
    
    // Destruir gráfico anterior se existir
    const canvas = document.getElementById('grafico-categorias');
    const ctx = canvas.getContext('2d');
    
    // Verificar se já existe um gráfico associado ao canvas
    if (window.graficosCategorias) {
        window.graficosCategorias.destroy();
    }
    
    // Criar novo gráfico
    window.graficosCategorias = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = formatarMoeda(context.raw);
                            return `${context.label}: ${valor}`;
                        }
                    }
                }
            }
        }
    });
}

function gerarGraficoEvolucao(tipo, mes, ano) {
    let labels = [];
    let dadosReceitas = [];
    let dadosDespesas = [];
    let dadosSaldo = [];
    
    if (tipo === 'mensal') {
        // Para relatório mensal, mostrar dias do mês
        const diasNoMes = new Date(ano, mes, 0).getDate();
        for (let dia = 1; dia <= diasNoMes; dia++) {
            labels.push(dia);
            
            // Filtrar transações para este dia
            const dataInicio = new Date(ano, mes - 1, dia, 0, 0, 0);
            const dataFim = new Date(ano, mes - 1, dia, 23, 59, 59);
            const transacoesDia = obterTodasTransacoes().filter(t => {
                const data = new Date(t.data);
                return data >= dataInicio && data <= dataFim;
            });
            
            const totaisDia = calcularTotais(transacoesDia);
            
            // Acumular valores
            const receitaAnterior = dadosReceitas.length > 0 ? dadosReceitas[dadosReceitas.length - 1] : 0;
            const despesaAnterior = dadosDespesas.length > 0 ? dadosDespesas[dadosDespesas.length - 1] : 0;
            
            dadosReceitas.push(receitaAnterior + totaisDia.receitas);
            dadosDespesas.push(despesaAnterior + totaisDia.despesas);
            dadosSaldo.push(dadosReceitas[dadosReceitas.length - 1] - dadosDespesas[dadosDespesas.length - 1]);
        }
    } else {
        // Para relatório anual, mostrar meses do ano
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        for (let m = 0; m < 12; m++) {
            labels.push(meses[m]);
            
            // Filtrar transações para este mês
            const dataInicio = new Date(ano, m, 1);
            const dataFim = new Date(ano, m + 1, 0);
            const transacoesMes = obterTodasTransacoes().filter(t => {
                const data = new Date(t.data);
                return data >= dataInicio && data <= dataFim;
            });
            
            const totaisMes = calcularTotais(transacoesMes);
            
            dadosReceitas.push(totaisMes.receitas);
            dadosDespesas.push(totaisMes.despesas);
            dadosSaldo.push(totaisMes.saldo);
        }
    }
    
    // Destruir gráfico anterior se existir
    const canvas = document.getElementById('grafico-evolucao');
    const ctx = canvas.getContext('2d');
    
    if (window.graficoEvolucao) {
        window.graficoEvolucao.destroy();
    }
    
    // Criar novo gráfico
    window.graficoEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: dadosReceitas,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: dadosDespesas,
                    borderColor: '#F44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Saldo',
                    data: dadosSaldo,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    borderDash: [5, 5],
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = formatarMoeda(context.raw);
                            return `${context.dataset.label}: ${valor}`;
                        }
                    }
                }
            }
        }
    });
}

function analisarCategorias(transacoes, totais) {
    const tabelaBody = document.getElementById('tabela-categorias-body');
    tabelaBody.innerHTML = '';
    
    // Ordenar categorias por valor (do maior para o menor)
    const categorias = Object.keys(totais.categorias)
        .map(categoria => ({
            nome: categoria,
            valor: totais.categorias[categoria],
            percentual: (totais.despesas > 0 ? (totais.categorias[categoria] / totais.despesas) * 100 : 0).toFixed(1)
        }))
        .sort((a, b) => b.valor - a.valor);
    
    // Adicionar linhas à tabela
    categorias.forEach(categoria => {
        const row = document.createElement('tr');
        
        const evolucao = calcularEvolucaoCategoria(categoria.nome);
        const evolucaoIcone = evolucao > 0 ? '▲' : evolucao < 0 ? '▼' : '━';
        const evolucaoClasse = evolucao > 0 ? 'negativo' : evolucao < 0 ? 'positivo' : 'neutro';
        
        row.innerHTML = `
            <td>${categoria.nome}</td>
            <td>${formatarMoeda(categoria.valor)}</td>
            <td>${categoria.percentual}%</td>
            <td class="${evolucaoClasse}">${evolucaoIcone} ${Math.abs(evolucao).toFixed(1)}%</td>
        `;
        
        tabelaBody.appendChild(row);
    });
}

function calcularEvolucaoCategoria(categoria) {
    // Este é um placeholder - em uma implementação real, você calcularia
    // a evolução comparando com o período anterior
    // Retornando um valor aleatório entre -30 e 30 para demonstração
    return Math.random() * 60 - 30;
}

function gerarDicas(transacoes, totais) {
    const dicasContainer = document.getElementById('dicas-container');
    dicasContainer.innerHTML = '';
    
    const dicas = [];
    
    // Verificar relação despesas/receitas
    const percentualDespesas = totais.receitas > 0 ? (totais.despesas / totais.receitas) * 100 : 0;
    
    if (percentualDespesas > 90) {
        dicas.push({
            icone: 'fas fa-exclamation-triangle',
            titulo: 'Orçamento Apertado',
            texto: 'Suas despesas estão consumindo mais de 90% da sua receita. Considere reduzir gastos não essenciais.'
        });
    }
    
    if (percentualDespesas < 60) {
        dicas.push({
            icone: 'fas fa-thumbs-up',
            titulo: 'Boa Gestão Financeira',
            texto: 'Parabéns! Você está gastando menos de 60% da sua renda. Considere investir a diferença.'
        });
    }
    
    // Verificar categorias com maior gasto
    const categorias = Object.keys(totais.categorias)
        .map(categoria => ({
            nome: categoria,
            valor: totais.categorias[categoria],
            percentual: (totais.despesas > 0 ? (totais.categorias[categoria] / totais.despesas) * 100 : 0)
        }))
        .sort((a, b) => b.percentual - a.percentual);
    
    if (categorias.length > 0 && categorias[0].percentual > 40) {
        dicas.push({
            icone: 'fas fa-search-dollar',
            titulo: `Alta Concentração em ${categorias[0].nome}`,
            texto: `${categorias[0].percentual.toFixed(1)}% dos seus gastos estão em ${categorias[0].nome}. Analise se é possível reduzir esta proporção.`
        });
    }
    
    // Adicionar mais dicas genéricas
    const dicasGenericas = [
        {
            icone: 'fas fa-piggy-bank',
            titulo: 'Fundo de Emergência',
            texto: 'Procure manter um fundo de emergência equivalente a 3-6 meses de despesas.'
        },
        {
            icone: 'fas fa-chart-line',
            titulo: 'Investimentos',
            texto: 'Considere diversificar seus investimentos para proteger seu patrimônio da inflação.'
        },
        {
            icone: 'fas fa-calendar-check',
            titulo: 'Planejamento',
            texto: 'Estabeleça metas financeiras claras para curto, médio e longo prazo.'
        }
    ];
    
    // Adicionar dicas genéricas se não tivermos pelo menos 3 dicas específicas
    while (dicas.length < 3) {
        const dicaAleatoria = dicasGenericas[Math.floor(Math.random() * dicasGenericas.length)];
        if (!dicas.some(d => d.titulo === dicaAleatoria.titulo)) {
            dicas.push(dicaAleatoria);
        }
    }
    
    // Renderizar dicas
    dicas.forEach(dica => {
        const dicaElement = document.createElement('div');
        dicaElement.className = 'dica';
        dicaElement.innerHTML = `
            <div class="dica-icone"><i class="${dica.icone}"></i></div>
            <div class="dica-conteudo">
                <h4>${dica.titulo}</h4>
                <p>${dica.texto}</p>
            </div>
        `;
        dicasContainer.appendChild(dicaElement);
    });
}

function gerarCoresAleatorias(quantidade) {
    const cores = [];
    const coresPredefinidas = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(199, 199, 199, 0.7)',
        'rgba(83, 102, 255, 0.7)',
        'rgba(40, 159, 64, 0.7)',
        'rgba(210, 102, 255, 0.7)'
    ];
    
    for (let i = 0; i < quantidade; i++) {
        if (i < coresPredefinidas.length) {
            cores.push(coresPredefinidas[i]);
        } else {
            // Gerar cores aleatórias se precisarmos de mais que as predefinidas
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            cores.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
    }
    
    return cores;
}

// Função utilitária para relatórios: retorna todas as transações
function obterTodasTransacoes() {
    return transacoes;
}

// Função para calcular saldo total
function calcularSaldoTotal(incluirSaldoInicial = true) {
    return transacoes
        .filter(t => incluirSaldoInicial || !(t.categoria === 'sistema' && t.descricao === '[Saldo Inicial]'))
        .reduce((acc, t) => acc + t.valor, 0);
}