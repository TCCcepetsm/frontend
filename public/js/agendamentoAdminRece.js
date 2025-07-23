// public/js/agendamentoAdminRece.js

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificação de Autenticação e Token
    // Assumes window.checkAuthentication() and window.getAuthToken() are available from auth.js
    if (typeof window.checkAuthentication === 'function' && !window.checkAuthentication()) {
        return; // checkAuthentication will handle redirection if not authenticated
    }
    const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : null;

    if (!token) {
        alert("Erro de autenticação. Por favor, faça login novamente.");
        window.location.href = 'login.html'; // Fallback redirect to login
        return;
    }

    const tbody = document.querySelector("#bookingsTable tbody");

    // Verifica se o tbody existe
    if (!tbody) {
        console.error("Elemento tbody #bookingsTable tbody não encontrado no HTML.");
        return;
    }

    // Função para formatar a data (reutilizável)
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        try {
            // Supondo formato 'YYYY-MM-DD' vindo do backend
            const [ano, mes, dia] = dataString.split('-');
            const data = new Date(ano, mes - 1, dia); // Mês é 0-indexed no JS (0=Jan, 11=Dez)
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return data.toLocaleDateString('pt-BR', options);
        } catch (e) {
            console.error("Erro ao formatar data:", dataString, e);
            return dataString; // Retorna a string original em caso de erro
        }
    }

    // Função para carregar e renderizar os agendamentos confirmados do backend
    async function loadConfirmedBookings() {
        tbody.innerHTML = '<tr><td colspan="3">Carregando agendamentos confirmados...</td></tr>'; // Placeholder de carregamento

        try {
            const response = await fetch("https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/confirmados", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Incluir o token JWT
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro HTTP ao buscar agendamentos confirmados: ${response.status} - ${response.statusText}`, errorText);

                if (response.status === 401 || response.status === 403) {
                    alert("Sessão expirada ou não autorizado. Por favor, faça login novamente.");
                    if (typeof window.logout === 'function') window.logout();
                    else window.location.href = 'login.html';
                }
                throw new Error(errorText || `Erro ao buscar agendamentos confirmados: ${response.statusText}`);
            }

            const bookings = await response.json(); // Os dados reais do backend

            tbody.innerHTML = ""; // Limpa o conteúdo de carregamento

            if (bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">Nenhum agendamento confirmado encontrado.</td></tr>';
            } else {
                bookings.forEach((booking) => { // Removi o 'index' pois não precisamos mais dele com o ID
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td data-label="Data">${formatarData(booking.data)}</td>
                        <td data-label="Horário">${booking.horario}</td>
                        <td data-label="Acessar">
                            <button class="btn btn-access" data-id="${booking.id}">Acessar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }

        } catch (error) {
            console.error("Erro ao carregar os agendamentos confirmados:", error);
            alert(`Erro ao carregar os agendamentos confirmados: ${error.message}`);
            tbody.innerHTML = '<tr><td colspan="3">Erro ao carregar agendamentos.</td></tr>';
        }
    }

    // Carrega os agendamentos ao iniciar a página
    loadConfirmedBookings();

    // Delegação de evento para tratar cliques no botão "Acessar"
    tbody.addEventListener("click", (event) => {
        const button = event.target.closest(".btn-access");

        if (button) {
            const id = button.getAttribute("data-id");

            // ⭐ Redireciona para a página de detalhes correta (agendamentoDetalhes.html) com o ID como parâmetro ⭐
            window.location.href = `agendamentoDetalhes.html?id=${id}`;
        }
    });
});