// 1. Configurações Iniciais e Preços
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514991087543";

const precosBordas = {
    "Nenhuma": 0,
    "Cheddar": 8.00,
    "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00,
    "4 Queijo": 14.00,
    "Chocolate": 12.00,
    "Doce de Leite": 12.00
};

const listaBebidas = ["Coca", "Suco", "Guaraná", "Fanta", "Sprite", "Água", "Cerveja"];

function verificarSeEhPizza(nome) {
    const ehBebida = listaBebidas.some(bebida => nome.includes(bebida));
    return !ehBebida;
}

// 2. Função para Exibir o Carrinho com Controles de Quantidade
function exibirCarrinho() {
    if (!lista) return;
    lista.innerHTML = '';
    let totalGeral = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p class="text-center py-5">Seu carrinho está vazio. 🍕</p>';
        if (totalElemento) totalElemento.innerText = "R$ 0,00";
        return;
    }

    carrinho.forEach((item, index) => {
        const isPizza = verificarSeEhPizza(item.nome);
        
        if (isPizza && !item.borda) {
            item.borda = "Nenhuma";
        }

        const valorBorda = isPizza ? (precosBordas[item.borda] || 0) : 0;
        const precoUnitarioTotal = item.preco + valorBorda;
        const subtotal = precoUnitarioTotal * item.quantidade;
        totalGeral += subtotal;

        let seletorBordaHTML = "";
        if (isPizza) {
            seletorBordaHTML = `
                <div class="mt-2">
                    <label class="small fw-bold text-muted">Borda:</label>
                    <select class="form-select form-select-sm" onchange="atualizarBorda(${index}, this.value)">
                        <option value="Nenhuma" ${item.borda === 'Nenhuma' ? 'selected' : ''}>Sem Borda</option>
                        <option value="Cheddar" ${item.borda === 'Cheddar' ? 'selected' : ''}>Cheddar (+R$ 8,00)</option>
                        <option value="Catupiry" ${item.borda === 'Catupiry' ? 'selected' : ''}>Catupiry (+R$ 8,00)</option>
                        <option value="4 Queijo" ${item.borda === '4 Queijo' ? 'selected' : ''}>4 Queijos (+R$ 14,00)</option>
                        <option value="Chocolate" ${item.borda === 'Chocolate' ? 'selected' : ''}>Chocolate (+R$ 12,00)</option>
                    </select>
                </div>`;
        }

        lista.innerHTML += `
            <div class="pedido border rounded p-3 mb-3 bg-white shadow-sm">
                <div class="d-flex justify-content-between align-items-start">
                    <div style="flex: 1;">
                        <strong class="fs-5">${item.nome}</strong>
                        ${seletorBordaHTML}
                    </div>
                    <div class="text-end" style="min-width: 120px;">
                        <div class="fw-bold text-success mb-2 fs-5">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <div class="d-flex align-items-center bg-light rounded border">
                        <button class="btn btn-sm px-3" onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span class="px-3 fw-bold">${item.quantidade}</span>
                        <button class="btn btn-sm px-3" onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                    
                    <button class="btn btn-sm btn-link text-danger text-decoration-none" onclick="removerItem(${index})">
                        Remover
                    </button>
                </div>
            </div>`;
    });

    if (totalElemento) {
        totalElemento.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    }
}

// 3. Função para Alterar Quantidade (+ ou -)
function alterarQuantidade(index, mudanca) {
    carrinho[index].quantidade += mudanca;

    // Se a quantidade chegar a zero, removemos o item
    if (carrinho[index].quantidade <= 0) {
        carrinho.splice(index, 1);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

// 4. Funções de Suporte (Borda e Remoção)
function atualizarBorda(index, novaBorda) {
    carrinho[index].borda = novaBorda;
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function removerTodos() {
    if (confirm("Deseja realmente esvaziar o carrinho?")) {
        localStorage.removeItem('carrinho');
        carrinho = [];
        exibirCarrinho();
    }
}

// 5. Finalizar Pedido
function finalizarPedido() {
    const enderecoElemento = document.getElementById('endereco');
    const endereco = enderecoElemento ? enderecoElemento.value : "";

    if (carrinho.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }

    if (!endereco) {
        alert("Por favor, informe o endereço de entrega!");
        return;
    }

    let mensagem = "*NOVO PEDIDO - CHEFE EXPRESS*%0A%0A";
    let totalFinal = 0;

    carrinho.forEach(item => {
        const isPizza = verificarSeEhPizza(item.nome);
        const valorBorda = isPizza ? (precosBordas[item.borda] || 0) : 0;
        const precoUnitarioFinal = item.preco + valorBorda;
        const subtotal = precoUnitarioFinal * item.quantidade;
        totalFinal += subtotal;

        mensagem += `*${item.quantidade}x ${item.nome}*%0A`;
        if (isPizza) mensagem += `  - Borda: ${item.borda || 'Nenhuma'}%0A`;
        mensagem += `  Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `--------------------------%0A`;
    mensagem += `*TOTAL DO PEDIDO: R$ ${totalFinal.toFixed(2).replace('.', ',')}*%0A%0A`;
    mensagem += `*Endereço de Entrega:* %0A${endereco}`;

    localStorage.removeItem('carrinho');
    carrinho = [];
    window.location.href = `https://wa.me/${foneWhatsapp}?text=${mensagem}`;
}

document.addEventListener('DOMContentLoaded', exibirCarrinho);