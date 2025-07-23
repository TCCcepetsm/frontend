document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificar autenticação
    // Use a função padronizada do auth.js
    const token = window.auth.getToken(); // <<-- CORREÇÃO

    // Verificar autenticação usando a função padronizada
    if (!window.auth.checkAuth()) { // <<-- CORREÇÃO
        return;
    }
    const tbody = document.querySelector("#bookingsTableBody");

    if (!tbody) {
        console.error("Elemento tbody com ID 'bookingsTableBody' não encontrado.");
        return;
    }

    if (!token) {
        tbody.innerHTML = '<tr><td colspan="3">Erro de autenticação. Por favor, faça login novamente.</td></tr>';
        return;
    }

    // Função para carregar e renderizar os agendamentos do backend
    async function loadAndRenderBookings() {
        tbody.innerHTML = '<tr><td colspan="3">Carregando agendamentos...</td></tr>'; // Mensagem de carregamento

        try {
            const response = await fetch("https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/pendentes", { // Endpoint para pendentes
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    tbody.innerHTML = '<tr><td colspan="3">Você não tem permissão para visualizar estes agendamentos.</td></tr>';
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || response.statusText || 'Erro ao carregar agendamentos.');
                }
                return;
            }

            const bookings = await response.json(); // Seus dados reais do backend

            if (bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">Não há agendamentos pendentes no momento.</td></tr>';
                return;
            }

            tbody.innerHTML = ""; // Limpa o "Carregando..."
            bookings.forEach((booking) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Data">${booking.data}</td>
                    <td data-label="Horário">${booking.horario}</td>
                    <td data-label="Acessar">
                        <button class="btn btn-access" data-id="${booking.id}">Acessar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
            tbody.innerHTML = `<tr><td colspan="3">Ocorreu um erro: ${error.message}</td></tr>`;
        }
    }

    // Chama a função para carregar os agendamentos quando a página é carregada
    loadAndRenderBookings();

    // Delegação de evento para tratar cliques no botão "Acessar"
    tbody.addEventListener("click", (event) => {
        const button = event.target.closest(".btn-access");

        if (button) {
            const id = button.getAttribute("data-id");
            // Redireciona para a página de detalhes, passando o ID via URL para buscar os detalhes
            window.location.href = `agendamentoDetalhes.html?id=${id}`;
        }
    });
});