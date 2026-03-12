// Recupera o carrinho salvo ou cria um novo
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(botao) {
    // 1. Acha o card da pizza/bebida (o article com classe 'item')
    const item = botao.closest('.item');
    
    // 2. Pega o nome (está no <strong>)
    const nomeBase = item.querySelector('strong').innerText;
    
    // 3. Pega o Select (preço e tamanho)
    const select = item.querySelector('.select-preco');
    const preco = parseFloat(select.value);
    
    // 4. Pega o texto do tamanho (ex: "Média")
    const opcaoTexto = select.options[select.selectedIndex].text;
    const tamanho = opcaoTexto.split(' - ')[0];

    // Nome final: "Bacon (Média)"
    const nomeFinal = `${nomeBase} (${tamanho})`;

    // 5. Verifica se já existe esse item no carrinho
    const existente = carrinho.find(p => p.nome === nomeFinal);

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            nome: nomeFinal,
            preco: preco,
            quantidade: 1
        });
    }

    // 6. Salva no navegador e avisa
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    alert(`✅ ${nomeFinal} adicionado ao carrinho!`);
}