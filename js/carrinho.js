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

        if (isPizza && !item.borda) {
            item.borda = "Nenhuma";
        }

        // MATEMÁTICA DA BORDA: Soma o valor real de cada metade e divide por 2
        let valorBorda = 0;
        if (isPizza) {
            if (item.borda.includes(' / ')) {
                const partes = item.borda.replace('Borda Meio a Meio (½ ', '').replace(')', '').split(' / ½ ');
                const preco1 = precosBordas[partes[0]] || 0;
                const preco2 = precosBordas[partes[1]] || 0;
                valorBorda = (preco1 + preco2) / 2; // Média real das bordas
            } else {
                valorBorda = precosBordas[item.borda] || 0;
            }
        }

        const subtotal = (item.preco + valorBorda) * item.quantidade;
        totalGeral += subtotal;

        let selectBordaHTML = '';
        if (isPizza) {
            if (item.borda.includes(' / ')) {
                const partesBorda = item.borda.replace('Borda Meio a Meio (½ ', '').replace(')', '').split(' / ½ ');
                const b1 = partesBorda[0];
                const b2 = partesBorda[1];

                selectBordaHTML = `<div class="campo-borda-item" style="margin-top: 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px;">
                    <span style="font-size: 0.7rem; color: var(--primary-color, #dfa629); font-weight: bold; width: 100%;">Borda Dividida (Valor Real Proporcional):</span>
                    <select onchange="alterarBordaMeioAMeio(${index}, this.value, '${b2}')" style="padding: 1px 4px; border-radius: 4px; border: 1px solid #444; font-size: 0.72rem; background: #222; color: #fff; max-width: 120px; height: 22px; cursor: pointer;">`;
                for (const nb in precosBordas) {
                    const sel = b1 === nb ? 'selected' : '';
                    selectBordaHTML += `<option value="${nb}" ${sel}>½ ${nb}</option>`;
                }
                selectBordaHTML += `</select>
                    <span style="font-size: 0.75rem; color: #666;">/</span>
                    <select onchange="alterarBordaMeioAMeio(${index}, '${b1}', this.value)" style="padding: 1px 4px; border-radius: 4px; border: 1px solid #444; font-size: 0.72rem; background: #222; color: #fff; max-width: 120px; height: 22px; cursor: pointer;">`;
                for (const nb in precosBordas) {
                    const sel = b2 === nb ? 'selected' : '';
                    selectBordaHTML += `<option value="${nb}" ${sel}>½ ${nb}</option>`;
                }
                selectBordaHTML += `</select>
                    <button onclick="converterParaBordaInteira(${index})" style="background: none; border: none; color: #ff4a4a; font-size: 0.65rem; cursor: pointer; padding: 0 2px; text-decoration: underline;">Borda Inteira</button>
                </div>`;
            } else {
                selectBordaHTML = `<div class="campo-borda-item" style="margin-top: 4px; display: flex; align-items: center; gap: 5px; flex-wrap: wrap;">
                    <label style="font-size: 0.75rem; color: #888; font-weight: 500;">Borda:</label>
                    <select onchange="alterarBorda(${index}, this.value)" style="padding: 1px 4px; border-radius: 4px; border: 1px solid #444; font-size: 0.75rem; background: #222; color: #fff; max-width: 160px; height: 22px; cursor: pointer;">`;

                for (const nomeBorda in precosBordas) {
                    const selected = item.borda === nomeBorda ? 'selected' : '';
                    const precoAdicional = precosBordas[nomeBorda] > 0 ? ` (+ R$ ${precosBordas[nomeBorda].toFixed(2).replace('.', ',')})` : '';
                    selectBordaHTML += `<option value="${nomeBorda}" ${selected} style="background: #222; color: #fff;">${nomeBorda}${precoAdicional}</option>`;
                }

                selectBordaHTML += `</select>
                    <button onclick="transformarEmBordaMeioAMeio(${index})" style="background: none; border: none; color: var(--primary-color, #dfa629); font-size: 0.65rem; cursor: pointer; padding: 0 2px; text-decoration: underline;">Dividir Borda</button>
                </div>`;
            }
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
    
    gerenciarPagamento();
}

function alterarBorda(index, novaBorda) {
    carrinho[index].borda = novaBorda;
    salvar();
}

// Adicionar Item Tradicional (Inteiras direto dos cards padrão)
function adicionarAoCarrinho(botao) {
    const itemElement = botao.closest('.item');
    const categoryAttr = itemElement.getAttribute('data-categoria');
    const categoria = categoryAttr ? categoryAttr : 'pizza';
    const nomeBase = (itemElement.querySelector('strong') || itemElement.querySelector('h4')).innerText;
    const select = itemElement.querySelector('.select-preco');
    const preco = parseFloat(select.value);
    const opcaoTexto = select.options[select.selectedIndex].text;

    const detalheOpcao = opcaoTexto.split(/ - R\$/i)[0].trim();
    const nomeFinal = `${nomeBase} (${detalheOpcao})`;

    const existente = !!carrinho && carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1,
            categoria: categoria,
            borda: "Nenhuma"
        });
    }

    salvar();
    alert(`✅ ${nomeFinal} adicionado ao carrinho!`);
}

// Adicionar Pizza Meio a Meio (Calculando o valor de cada metade somada / 2)
function adicionarPizzaMeioAMeio() {
    const tamanho = document.getElementById('pizza-tamanho').value;
    const sabor1 = document.getElementById('pizza-sabor1').value;
    const sabor2 = document.getElementById('pizza-sabor2').value;

    if (sabor1 === sabor2) {
        return alert("❌ Para pizzas Meio a Meio, selecione dois sabores diferentes! Se deseja apenas este sabor, adicione-o diretamente pelo cardápio abaixo.");
    }

    if (!sabor1 || !sabor2) {
        return alert("❌ Por favor, selecione ambos os sabores para montar sua pizza!");
    }

    const precoSabor1 = cardapioPizzas[sabor1]?.[tamanho] || 0;
    const precoSabor2 = cardapioPizzas[sabor2]?.[tamanho] || 0;
    
    // Matemática: Média real (Soma dos valores divididos por 2)
    const precoFinal = (precoSabor1 + precoSabor2) / 2;
    const nomeFinal = `Pizza ${tamanho} (½ ${sabor1} / ½ ${sabor2})`;

    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: precoFinal,
            quantidade: 1,
            categoria: 'pizza',
            borda: "Nenhuma"
        });
    }

    salvar();
    alert(`✅ ${nomeFinal} adicionada ao carrinho!`);
}

function transformarEmBordaMeioAMeio(index) {
    const bordaAtual = carrinho[index].borda !== "Nenhuma" ? carrinho[index].borda : "Cheddar";
    carrinho[index].borda = `Borda Meio a Meio (½ ${bordaAtual} / ½ Catupiry)`;
    salvar();
}

function alterarBordaMeioAMeio(index, metade1, metade2) {
    if (metade1 === metade2) {
        alert("❌ Você selecionou o mesmo recheio para as duas metades da borda! Para bordas inteiras, altere o seletor para o formato simplificado padrão.");
        carrinho[index].borda = metade1; 
    } else {
        carrinho[index].borda = `Borda Meio a Meio (½ ${metade1} / ½ ${metade2})`;
    }
    salvar();
}

// Restaura o formato para borda única inteira
function converterParaBordaInteira(index) {
    carrinho[index].borda = "Nenhuma";
    salvar();
}

// === CONTROLE E MÁSCARA DAS FORMAS DE PAGAMENTO ===

function gerenciarPagamento() {
    const checkboxes = document.querySelectorAll('input[name="metodo"]');
    const selecionados = Array.from(checkboxes).filter(c => c.checked);
    
    const textoTotal = totalElemento ? totalElemento.innerText : "R$ 0,00";
    const valorTotalGeral = parseFloat(textoTotal.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;

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
                inputValor.style.display = 'block';
                if (selecionados.length === 1) {
                    inputValor.value = 'R$ ' + valorTotalGeral.toFixed(2).replace('.', ',');
                } else if (inputValor.value === 'R$ ' + valorTotalGeral.toFixed(2).replace('.', ',')) {
                    inputValor.value = '';
                }
            } else {
                inputValor.style.display = 'none';
                inputValor.value = '';
            }
        }
    });

    const apenasDinheiroSelecionado = selecionados.length === 1 && selecionados[0].value === 'Dinheiro';
    const boxTroco = document.getElementById('box-troco');
    if (boxTroco) {
        if (apenasDinheiroSelecionado) {
            boxTroco.style.display = 'block';
        } else {
            boxTroco.style.display = 'none';
            document.getElementById('troco').value = '';
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

    // Cálculo exato do valor dos itens do carrinho
    let totalGeral = 0;
    carrinho.forEach(item => {
        let valorBorda = 0;
        if (verificarSeEhPizza(item.nome)) {
            if (item.borda.includes(' / ')) {
                const partes = item.borda.replace('Borda Meio a Meio (½ ', '').replace(')', '').split(' / ½ ');
                const preco1 = precosBordas[partes[0]] || 0;
                const preco2 = precosBordas[partes[1]] || 0;
                valorBorda = (preco1 + preco2) / 2; 
            } else {
                valorBorda = precosBordas[item.borda] || 0;
            }
        }
        totalGeral += (item.preco + valorBorda) * item.quantidade;
    });

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

    const diferenca = somaFormasPagamento - totalGeral;

    // VALIDAÇÃO AJUSTADA: Agora só barra se o valor informado for INSUFICIENTE (menor que o total)
    if (diferenca < -0.01) {
        const restante = totalGeral - somaFormasPagamento;
        return alert(`O valor informado é INSUFICIENTE para finalizar a compra!\n\nTotal do Pedido: R$ ${totalGeral.toFixed(2).replace('.', ',')}\nInformado: R$ ${somaFormasPagamento.toFixed(2).replace('.', ',')}\nFaltam: R$ ${restante.toFixed(2).replace('.', ',')}\n\nPor favor, ajuste o valor do pagamento.`);
    }

    let message = "*NOVO PEDIDO - PIZZAS PALACE*%0A%0A";

    carrinho.forEach(item => {
        let valorBorda = 0;
        if (verificarSeEhPizza(item.nome)) {
            if (item.borda.includes(' / ')) {
                const partes = item.borda.replace('Borda Meio a Meio (½ ', '').replace(')', '').split(' / ½ ');
                const preco1 = precosBordas[partes[0]] || 0;
                const preco2 = precosBordas[partes[1]] || 0;
                valorBorda = (preco1 + preco2) / 2;
            } else {
                valorBorda = precosBordas[item.borda] || 0;
            }
        }
        const sub = (item.preco + valorBorda) * item.quantidade;

        const textoBorda = (verificarSeEhPizza(item.nome) && item.borda && item.borda !== 'Nenhuma') ? ` (${item.borda})` : '';
        message += `*${item.quantidade}x ${item.nome}*${textoBorda}%0A`;
        message += `   Sub: R$ ${sub.toFixed(2).replace('.', ',')}%0A%0A`;
    });

    message += `*TOTAL: R$ ${totalGeral.toFixed(2).replace('.', ',')}*%0A%0A`;
    message += `*Cliente:* ${nome}%0A*Endereço:* ${endereco}%0A*Contato:* ${telefone}%0A`;
    message += `*Pagamento:* ${descricoesPagamento.join(" + ")}%0A`;
    
    const apenasDinheiroSelecionado = selecionados.length === 1 && selecionados[0].value === 'Dinheiro';
    if (apenasDinheiroSelecionado && troco) {
        message += `*Troco para:* R$ ${troco}%0A`;
    }
    if (obs) message += `*Obs:* ${obs}`;

    localStorage.removeItem('carrinho');
    window.open(`https://wa.me/${foneWhatsapp}?text=${message}`, '_blank');
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
    window.alterarBordaMeioAMeio = alterarBordaMeioAMeio;
    window.transformarEmBordaMeioAMeio = transformarEmBordaMeioAMeio;
    window.converterParaBordaInteira = converterParaBordaInteira;
    window.adicionarAoCarrinho = adicionarAoCarrinho;
    window.adicionarPizzaMeioAMeio = adicionarPizzaMeioAMeio;
});