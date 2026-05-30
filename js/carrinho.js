let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const lista = document.getElementById('lista-pedidos');
const totalElemento = document.getElementById('total-carrinho');
const foneWhatsapp = "5514998897292";

// Preços de bordas
const precosBordas = {
    "Nenhuma": 0, "Cheddar": 8.00, "Catupiry": 8.00,
    "Calabresa com catupiry": 14.00, "4 Queijos": 14.00,
    "Chocolate": 12.00, "Doce de Leite": 12.00
};

const listaBebidas = ["Coca", "Suco", "Guaraná", "Fanta", "Sprite", "Água", "Cerveja"];

function verificarSeEhPizza(nome) {
    return !listaBebidas.some(bebida => nome.includes(bebida));
}

function exibirCarrinho() {
    if (!lista) return;
    lista.innerHTML = '';
    let totalGeral = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Carrinho vazio.</p>';
        if (totalElemento) totalElemento.innerText = "R$ 0,00";
        return;
    }

    carrinho.forEach((item, index) => {
        const isPizza = verificarSeEhPizza(item.nome);

        // Garante que se o item for pizza e não tiver borda definida, comece como 'Nenhuma'
        if (isPizza && !item.borda) {
            item.borda = "Nenhuma";
        }

        const valorBorda = isPizza ? (precosBordas[item.borda] || 0) : 0;
        const subtotal = (item.preco + valorBorda) * item.quantidade;
        totalGeral += subtotal;

        // Cria dinamicamente o select de bordas caso o item seja uma pizza
        let selectBordaHTML = '';
        if (isPizza) {
            selectBordaHTML = `<div class="campo-borda-item" style="margin-top: 4px; display: flex; align-items: center; gap: 5px;">
        <label style="font-size: 0.75rem; color: #888; font-weight: 500;">Borda:</label>
        <select onchange="alterarBorda(${index}, this.value)" style="padding: 1px 4px; border-radius: 4px; border: 1px solid #444; font-size: 0.75rem; background: #222; color: #fff; max-width: 160px; height: 22px; cursor: pointer;">`;

            for (const nomeBorda in precosBordas) {
                const selected = item.borda === nomeBorda ? 'selected' : '';
                const precoAdicional = precosBordas[nomeBorda] > 0 ? ` (+ R$ ${precosBordas[nomeBorda].toFixed(2).replace('.', ',')})` : '';
                selectBordaHTML += `<option value="${nomeBorda}" ${selected} style="background: #222; color: #fff;">${nomeBorda}${precoAdicional}</option>`;
            }

            selectBordaHTML += `</select></div>`;
        }

        lista.innerHTML += `
            <div class="item-pedido">
                <div class="info-item">
                    <strong>${item.quantidade}x ${item.nome}</strong>
                    ${selectBordaHTML}
                </div>
                <div class="controles-item" style="text-align: right;">
                    <div class="preco-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
                    <div class="btn-group">
                        <button onclick="alterarQuantidade(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index}, 1)">+</button>
                    </div>
                    <button class="btn-remover" onclick="removerItem(${index})">remover</button>
                </div>
            </div>`;
    });

    if (totalElemento) {
        totalElemento.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    }
    
    // Atualiza os inputs de pagamento caso o total mude via carrinho
    gerenciarPagamento();
}

function alterarBorda(index, novaBorda) {
    carrinho[index].borda = novaBorda;
    salvar();
}

// === CONTROLE E MÁSCARA DAS FORMAS DE PAGAMENTO ===

function gerenciarPagamento() {
    const checkboxes = document.querySelectorAll('input[name="metodo"]');
    const selecionados = Array.from(checkboxes).filter(c => c.checked);
    
    const textoTotal = totalElemento ? totalElemento.innerText : "R$ 0,00";
    const valorTotalGeral = parseFloat(textoTotal.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;

    // Impede marcar mais de 2 opções salvaguardando o estado do checkbox clicado
    if (selecionados.length > 2) {
        alert("Você pode selecionar no máximo 2 formas de pagamento!");
        if (typeof event !== 'undefined' && event.target) {
            event.target.checked = false;
        }
        return;
    }

    checkboxes.forEach(cb => {
        const idInput = 'valor-' + cb.value.replace(/\s+/g, '-').replace(/[áéíóúâêîôûàèìòùãõç]/gi, '');
        const inputValor = document.getElementById(idInput);
        
        if (inputValor) {
            if (cb.checked) {
                // Garante a exibição do input correspondente para todas as opções marcadas
                inputValor.style.display = 'block';
                
                // Configuração inteligente de preenchimento de valores
                if (selecionados.length === 1) {
                    inputValor.value = 'R$ ' + valorTotalGeral.toFixed(2).replace('.', ',');
                } else if (inputValor.value === 'R$ ' + valorTotalGeral.toFixed(2).replace('.', ',')) {
                    // Quando passa a ter 2 métodos, limpa o preenchimento automático para o usuário ratear os valores
                    inputValor.value = '';
                }
            } else {
                inputValor.style.display = 'none';
                inputValor.value = '';
            }
        }
    });

    // O troco só aparece se 'Dinheiro' for a ÚNICA opção selecionada
    const apenasDinheiroSelecionado = selecionados.length === 1 && selecionados[0].value === 'Dinheiro';
    const boxTroco = document.getElementById('box-troco');
    if (boxTroco) {
        if (apenasDinheiroSelecionado) {
            boxTroco.style.display = 'block';
        } else {
            boxTroco.style.display = 'none';
            document.getElementById('troco').value = ''; // Limpa o campo caso mude de ideia
        }
    }
}

function converterStringParaFloat(texto) {
    if (!texto) return 0;
    let limpo = texto.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
}

function mascaraValor(input) {
    let v = input.value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace(".", ",");
    v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
    input.value = v ? 'R$ ' + v : '';
}

// === FINALIZAÇÃO E VALIDAÇÃO DO PEDIDO ===

function finalizarPedido() {
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;
    const nome = document.getElementById('nome').value;
    const selecionados = document.querySelectorAll('input[name="metodo"]:checked');
    const troco = document.getElementById('troco').value;
    const obs = document.getElementById('obs') ? document.getElementById('obs').value : "";

    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!endereco || !telefone || !nome) return alert("Por favor, preencha nome, endereço e telefone.");
    if (selecionados.length === 0) return alert("Escolha uma forma de pagamento.");

    // Faz o cálculo real do total do carrinho
    let totalGeral = 0;
    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        totalGeral += (item.preco + valorBorda) * item.quantidade;
    });

    // Validação matemática da divisão de valores inserida pelo cliente
    let somaFormasPagamento = 0;
    let descricoesPagamento = [];

    for (let i = 0; i < selecionados.length; i++) {
        const cb = selecionados[i];
        const idInput = 'valor-' + cb.value.replace(/\s+/g, '-').replace(/[áéíóúâêîôûàèìòùãõç]/gi, '');
        const inputValor = document.getElementById(idInput);
        const valorParcial = converterStringParaFloat(inputValor ? inputValor.value : '');

        if (valorParcial <= 0) {
            return alert(`Por favor, insira um valor válido para a opção: ${cb.value}`);
        }

        somaFormasPagamento += valorParcial;
        descricoesPagamento.push(`${cb.value} (R$ ${valorParcial.toFixed(2).replace('.', ',')})`);
    }

    // Validação específica para valor INSUFICIENTE ou SUPERIOR
    const diferenca = somaFormasPagamento - totalGeral;

    if (diferenca < -0.01) { // Se faltar mais de 1 centavo
        const restante = totalGeral - somaFormasPagamento;
        return alert(`O valor informado é INSUFICIENTE para finalizar a compra!\n\nTotal do Pedido: R$ ${totalGeral.toFixed(2).replace('.', ',')}\nInformado: R$ ${somaFormasPagamento.toFixed(2).replace('.', ',')}\nFaltam: R$ ${restante.toFixed(2).replace('.', ',')}\n\nPor favor, ajuste o valor do pagamento.`);
    } 
    else if (diferenca > 0.01) { // Se passar mais de 1 centavo
        return alert(`A soma dos valores informados (R$ ${somaFormasPagamento.toFixed(2).replace('.', ',')}) é maior do que o total exato do seu carrinho (R$ ${totalGeral.toFixed(2).replace('.', ',')}). Ajuste a divisão!`);
    }

    // Geração do texto para o WhatsApp
    let mensagem = "*NOVO PEDIDO - PIZZAS PALACE*%0A%0A";

    carrinho.forEach(item => {
        const valorBorda = verificarSeEhPizza(item.nome) ? (precosBordas[item.borda] || 0) : 0;
        const sub = (item.preco + valorBorda) * item.quantidade;

        const textoBorda = (verificarSeEhPizza(item.nome) && item.borda && item.borda !== 'Nenhuma') ? ` (Borda: ${item.borda})` : '';
        mensagem += `*${item.quantidade}x ${item.nome}*${textoBorda}%0A`;
        mensagem += `   Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    mensagem += `*TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A%0A`;
    mensagem += `*Cliente:* ${nome}%0A*Endereço:* ${endereco}%0A*Contato:* ${telefone}%0A`;

    // Inclui a listagem detalhada de como os pagamentos foram divididos
    mensagem += `*Pagamento:* ${descricoesPagamento.join(" + ")}%0A`;
    
    // O troco só vai pro WhatsApp se Dinheiro for a única opção e o campo estiver preenchido
    const apenasDinheiroSelecionado = selecionados.length === 1 && selecionados[0].value === 'Dinheiro';
    if (apenasDinheiroSelecionado && troco) {
        mensagem += `*Troco para:* R$ ${troco}%0A`;
    }
    if (obs) mensagem += `*Obs:* ${obs}`;

    localStorage.removeItem('carrinho');
    window.open(`https://wa.me/${foneWhatsapp}?text=${mensagem}`, '_blank');
    location.reload();
}

function alterarQuantidade(index, mudanca) {
    carrinho[index].quantidade += mudanca;
    if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
    salvar();
}

function removerItem(index) {
    carrinho.splice(index, 1);
    salvar();
}

function salvar() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    exibirCarrinho();
}

function removerTodos() {
    if (confirm("Deseja realmente esvaziar o seu carrinho?")) {
        carrinho = [];
        salvar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    exibirCarrinho();
    window.gerenciarPagamento = gerenciarPagamento;
    window.mascaraValor = mascaraValor;
});