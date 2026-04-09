document.addEventListener('DOMContentLoaded', () => {

    const blocoDeNotas = document.getElementById('blocoDeNotas');
    const inputData = document.getElementById('dataHora');
    const btnSalvar = document.getElementById('salvarNota');
    const btnLimparTudo = document.getElementById('limparTudo');
    const listaNotasContainer = document.getElementById('listaNotas');
    const somAlarme = document.getElementById('somAlarme');
    const selectCategoria = document.getElementById('categoria');
    const toggleBtn = document.getElementById('toggleMode');
    const themeIcon = document.getElementById('themeIcon');

    let notas = JSON.parse(localStorage.getItem('listaDeNotas')) || [];
    let categoriaAtual = "Particular";

    // =========================================
    // TROCAR CATEGORIA (COM CORREÇÃO DE COR)
    // =========================================
    window.trocarCategoria = (cat) => {
        categoriaAtual = cat;

        // 1. Seleciona todos os botões que têm a classe 'folder-btn'
        const botoes = document.querySelectorAll('.folder-btn');

        // 2. Remove a classe 'active' de todos eles
        botoes.forEach(btn => btn.classList.remove('active'));

        // 3. Encontra o botão clicado e adiciona a classe 'active' nele
        // Isso garante que apenas o botão da categoria atual fique destacado
        const botaoClicado = Array.from(botoes).find(btn => btn.innerText.includes(cat));
        if (botaoClicado) {
            botaoClicado.classList.add('active');
        }

        renderizarNotas();
    };

    // RENDERIZAR
    function renderizarNotas() {
        listaNotasContainer.innerHTML = '';

        notas
        .filter(nota => nota.categoria === categoriaAtual)
        .forEach(nota => {

            const div = document.createElement('div');
            div.classList.add('nota-item');

            const dataFormatada = nota.agendamento 
                ? new Date(nota.agendamento).toLocaleString('pt-BR') 
                : 'Sem alarme';

            div.innerHTML = `
                <p>${nota.texto}</p>
                <div class="nota-info-direita">
                    <small>📁 ${nota.categoria}</small>
                    <small>⏰ ${dataFormatada}</small>
                    <button onclick="excluirNota(${nota.id})" class="btn-excluir">Excluir</button>
                </div>
            `;

            listaNotasContainer.appendChild(div);
        });
    }

    renderizarNotas();

    // SALVAR
    btnSalvar.addEventListener('click', () => {
        const texto = blocoDeNotas.value.trim();
        const dataHora = inputData.value;

        if (!texto) {
            alert("Escreva algo!");
            return;
        }

        const novaNota = {
            id: Date.now(),
            texto,
            agendamento: dataHora,
            categoria: selectCategoria.value,
            notificado: false
        };

        notas.push(novaNota);
        atualizarLocalStorage();
        renderizarNotas();

        blocoDeNotas.value = '';
        inputData.value = '';
    });

    // EXCLUIR
    window.excluirNota = (id) => {
        notas = notas.filter(n => n.id !== id);
        atualizarLocalStorage();
        renderizarNotas();
    };

    // LIMPAR
    btnLimparTudo.addEventListener('click', () => {
        if (confirm("Deseja apagar tudo?")) {
            notas = [];
            atualizarLocalStorage();
            renderizarNotas();
        }
    });

    function atualizarLocalStorage() {
        localStorage.setItem('listaDeNotas', JSON.stringify(notas));
    }

    // ALARME
    setInterval(() => {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        const hora = String(agora.getHours()).padStart(2, '0');
        const min = String(agora.getMinutes()).padStart(2, '0');
        
        const atual = `${ano}-${mes}-${dia}T${hora}:${min}`;

        let mudou = false;

        notas.forEach(nota => {
            if (nota.agendamento === atual && !nota.notificado) {

                nota.notificado = true;
                mudou = true;

                somAlarme.loop = true;
                somAlarme.play().catch(()=>{});

                setTimeout(() => {
                    alert("⏰ Lembrete: " + nota.texto);
                    somAlarme.pause();
                    somAlarme.currentTime = 0;
                }, 500);
            }
        });

        if (mudou) atualizarLocalStorage();

    }, 1000);

    // TEMA
    const savedMode = localStorage.getItem('theme');

    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
        if(themeIcon) themeIcon.src = 'img/sun.png';
    }

    toggleBtn.addEventListener('click', () => {
        const light = document.body.classList.toggle('light-mode');

        if (light) {
            themeIcon.src = 'img/sun.png';
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.src = 'img/moon.png';
            localStorage.setItem('theme', 'dark');
        }
    });

});