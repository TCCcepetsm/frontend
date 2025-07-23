document.addEventListener("DOMContentLoaded", async () => {
    // Elementos da página
    const loadingSpinner = document.getElementById('loading-spinner');
    const content = document.getElementById('content');
    const elements = {
        nome: document.getElementById('info-nome'),
        email: document.getElementById('info-email'),
        telefone: document.getElementById('info-telefone'),
        plano: document.getElementById('info-plano'),
        data: document.getElementById('info-data'),
        horario: document.getElementById('info-horario'),
        endereco: document.getElementById('info-endereco'),
        status: document.getElementById('info-status'),
        btnConfirmar: document.getElementById('btn-confirmar'),
        btnRecusar: document.getElementById('btn-recusar'),
        actionButtons: document.getElementById('action-buttons')
    };

    // Mostrar spinner e esconder conteúdo
    loadingSpinner.style.display = 'flex';
    content.style.display = 'none';

    // 1. Verificar autenticação
    if (typeof window.checkAuthentication !== 'function' || !window.checkAuthentication()) {
        window.location.href = 'login.html';
        return;
    }

    const token = window.getAuthToken();
    if (!token) {
        alert("Erro de autenticação. Faça login novamente.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Obter ID do agendamento da URL
    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('id');

    if (!agendamentoId) {
        alert("ID do agendamento não encontrado na URL");
        window.location.href = 'agendamentoAdmin.html';
        return;
    }

    // 3. Função para formatar data
    function formatarData(dataString) {
        try {
            const [year, month, day] = dataString.split('-');
            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
        } catch (e) {
            console.error("Erro ao formatar data:", e);
            return dataString;
        }
    }

    // 4. Carregar dados do agendamento
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
                if (response.status === 401 || response.status === 403) {
                    alert("Sessão expirada. Faça login novamente.");
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error(`Erro ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();

            // Preencher os dados
            elements.nome.textContent = data.nome || data.nomeCliente || 'N/A';
            elements.email.textContent = data.email || 'N/A';
            elements.telefone.textContent = data.telefone || 'N/A';
            elements.plano.textContent = data.plano || 'N/A';
            elements.data.textContent = formatarData(data.data) || 'N/A';
            elements.horario.textContent = data.horario || 'N/A';
            elements.endereco.textContent = data.endereco || data.local || 'N/A';
            elements.status.textContent = data.status || 'N/A';

            // Estilizar status
            elements.status.className = `info-value status-${(data.status || '').toLowerCase()}`;

            // Mostrar/ocultar botões conforme status
            const isPending = (data.status || '').toUpperCase() === 'PENDENTE';
            elements.btnConfirmar.style.display = isPending ? 'block' : 'none';
            elements.btnRecusar.style.display = isPending ? 'block' : 'none';

            // Esconder spinner e mostrar conteúdo
            loadingSpinner.style.display = 'none';
            content.style.display = 'block';

        } catch (error) {
            console.error("Erro ao carregar agendamento:", error);
            alert(`Erro ao carregar agendamento: ${error.message}`);

            // Mostrar mensagem de erro
            loadingSpinner.innerHTML = '<p>Erro ao carregar dados. Tente novamente.</p>';
        }
    }

    // 5. Função para atualizar status
    async function updateStatus(action) {
        if (!confirm(`Tem certeza que deseja ${action === 'confirmar' ? 'CONFIRMAR' : 'RECUSAR'} este agendamento?`)) {
            return;
        }

        try {
            // Mostrar spinner durante a atualização
            elements.actionButtons.style.visibility = 'hidden';
            loadingSpinner.style.display = 'flex';

            const response = await fetch(`https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/${action}/${agendamentoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${await response.text()}`);
            }

            alert(`Agendamento ${action === 'confirmar' ? 'confirmado' : 'recusado'} com sucesso!`);
            window.location.href = 'agendamentoAdmin.html';

        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert(`Erro ao atualizar status: ${error.message}`);

            // Restaurar visibilidade dos botões
            elements.actionButtons.style.visibility = 'visible';
            loadingSpinner.style.display = 'none';
        }
    }

    // 6. Event listeners para os botões
    elements.btnConfirmar?.addEventListener('click', () => updateStatus('confirmar'));
    elements.btnRecusar?.addEventListener('click', () => updateStatus('recusar'));

    // 7. Carregar os dados
    loadAgendamentoDetails();
});