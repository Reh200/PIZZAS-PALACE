let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(botao) {
    const itemElement = botao.closest('.item');
    
    // Captura a categoria (pizza ou bebida) definida no HTML
    const categoria = itemElement.getAttribute('data-categoria') || 'pizza';
    const nomeBase = itemElement.querySelector('strong').innerText;
    const select = itemElement.querySelector('.select-preco');
    const preco = parseFloat(select.value);
    const opcaoTexto = select.options[select.selectedIndex].text;
    const tamanho = opcaoTexto.split(' - ')[0];

    const nomeFinal = `${nomeBase} (${tamanho})`;

    // Verifica se já existe esse exato item (mesmo nome e tamanho)
    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1,
            categoria: categoria, // SALVA A CATEGORIA AQUI
            borda: "Nenhuma"      // Valor padrão
        });
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`✅ ${nomeFinal} adicionado ao carrinho!`);
}