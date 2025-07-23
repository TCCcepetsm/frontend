document.addEventListener("DOMContentLoaded", async () => {
    // Verificar autenticação
    // Use a função padronizada do auth.js
    const token = window.auth.getToken(); // <<-- CORREÇÃO

    // Verificar autenticação usando a função padronizada
    if (!window.auth.checkAuth()) { // <<-- CORREÇÃO
        return;
    }
    // Obter ID do agendamento da URL
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    if (!agendamentoId) {
        alert("ID do agendamento não encontrado.");
        window.location.href = 'agendamentosConfirmadosLista.html';
        return;
    }

    // Elementos da página
    const loadingSpinner = document.getElementById('loading-spinner');
    const content = document.getElementById('content');

    // Função para carregar detalhes
    async function loadAgendamentoDetails() {
        try {
            const response = await fetch(`https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/${agendamentoId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Preencher os dados
            document.getElementById('info-nome').textContent = data.nome || data.nomeCliente || 'N/A';
            document.getElementById('info-email').textContent = data.email || 'N/A';
            document.getElementById('info-telefone').textContent = data.telefone || 'N/A';
            document.getElementById('info-plano').textContent = data.plano || 'N/A';
            document.getElementById('info-data').textContent = formatarData(data.data) || 'N/A';
            document.getElementById('info-horario').textContent = data.horario || 'N/A';
            document.getElementById('info-endereco').textContent = data.endereco || data.local || 'N/A';

            const statusElement = document.getElementById('info-status');
            statusElement.textContent = data.status || 'CONFIRMADO';
            statusElement.className = 'info-value status-confirmado';

            // Mostrar conteúdo
            loadingSpinner.style.display = 'none';
            content.style.display = 'block';

        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
            loadingSpinner.innerHTML = `<p>Erro ao carregar detalhes: ${error.message}</p>`;
        }
    }

    // Função para formatar data
    function formatarData(dataString) {
        try {
            const [year, month, day] = dataString.split('-');
            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }

    // Carregar os dados
    loadAgendamentoDetails();
});