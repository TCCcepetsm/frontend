// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", async () => {
    // Basic authentication check:
    // This assumes you have a public/js/auth.js file that handles token storage
    // and provides window.checkAuthentication() and window.getAuthToken() functions.
    if (typeof window.checkAuthentication === 'function' && !window.checkAuthentication()) {
        // If not authenticated, checkAuthentication should handle redirection
        return;
    }

    const tbody = document.querySelector("#bookingsTable tbody");
    const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : null;

    if (!tbody) {
        console.error("Elemento tbody com ID '#bookingsTable tbody' não encontrado.");
        return;
    }

    if (!token) {
        tbody.innerHTML = '<tr><td colspan="3">Erro de autenticação. Por favor, faça login novamente.</td></tr>';
        console.error("Token de autenticação não encontrado. Redirecionando para login.");
        // Optional: Redirect to login if token is missing
        // window.location.href = 'login.html';
        return;
    }

    // Function to load and render bookings from the backend
    async function loadAndRenderBookings() {
        tbody.innerHTML = '<tr><td colspan="3">Carregando agendamentos...</td></tr>'; // Loading message

        try {
            // Fetch only 'PENDENTE' (pending) bookings for this admin view
            const response = await fetch('https://psychological-cecilla-peres-7395ec38.koyeb.app/api/agendamentos2/pendentes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 403) {
                    tbody.innerHTML = '<tr><td colspan="3">Você não tem permissão para visualizar estes agendamentos.</td></tr>';
                    console.warn("Acesso negado: O usuário autenticado não tem permissão para ver agendamentos pendentes.");
                } else if (response.status === 401) {
                    tbody.innerHTML = '<tr><td colspan="3">Sessão expirada. Por favor, faça login novamente.</td></tr>';
                    console.error("Não autorizado: Token inválido ou expirado.");
                    // Optional: Redirect to login or re-authenticate
                    // window.checkAuthentication(); 
                }
                else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || response.statusText || 'Erro desconhecido ao carregar agendamentos.');
                }
                return;
            }

            const bookings = await response.json();

            if (bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">Não há agendamentos pendentes no momento.</td></tr>';
                return;
            }

            tbody.innerHTML = ""; // Clear the "Loading..." message
            bookings.forEach((booking) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Data">${booking.data}</td>
                    <td data-label="Horário">${booking.horario}</td>
                    <td data-label="Acessar">
                        <button class="btn" data-id="${booking.id}">Acessar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
            tbody.innerHTML = `<tr><td colspan="3">Ocorreu um erro: ${error.message}. Verifique a console para mais detalhes.</td></tr>`;
        }
    }

    // Initial load of bookings when the page is ready
    loadAndRenderBookings();

    // Event delegation for "Acessar" button clicks
    tbody.addEventListener("click", (event) => {
        const button = event.target.closest(".btn"); // Use .btn as per your CSS and HTML

        if (button) {
            const bookingId = button.getAttribute("data-id");
            if (bookingId) {
                // Redirect to the details page, passing the ID as a URL parameter
                window.location.href = `agendamentoDetalhes.html?id=${bookingId}`;
            } else {
                console.error("ID do agendamento não encontrado no botão.");
            }
        }
    });

    // Optional: Logout button (if you have one in your header)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && typeof window.logout === 'function') { // Assuming logout function in auth.js
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.logout();
        });
    }
});