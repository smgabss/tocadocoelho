/**
 * JS App Layer
 * Gerencia Estado, Roteamento e Inicialização
 */

const AppState = {
    currentUser: null,
    unsubscribeUserListener: null
};

window.onload = () => {
    UI.mount(); // Inicializa o container do UI
    App.showLogin();
};

const App = {
    showLogin: () => {
        // Limpa estado anterior se houver
        if (AppState.unsubscribeUserListener) {
            AppState.unsubscribeUserListener();
            AppState.unsubscribeUserListener = null;
        }
        AppState.currentUser = null;
        UI.setTheme('theme-default');
        
        UI.renderLogin(async (codinome, senha) => {
            if (!codinome || !senha) {
                UI.showToast("Preencha codinome e senha.", "error");
                return;
            }
            try {
                UI.renderLoading("Autenticando na Toca do Coelho...");
                const user = await DB.login(codinome, senha);
                if (user) {
                    App.handleSuccessfulLogin(user);
                } else {
                    UI.showToast("Codinome ou senha inválidos.", "error");
                    App.showLogin();
                }
            } catch (err) {
                 UI.showToast("Erro ao conectar no banco de dados. " + err.message, "error");
                 App.showLogin();
            }
        });
    },

    handleSuccessfulLogin: (user) => {
        AppState.currentUser = user;
        UI.setTheme(user.theme);
        UI.showToast(`Bem-vindo, ${user.codinome}!`);

        if (user.role === 'mestre') {
            App.showMasterDashboard();
        } else {
            App.showPlayerDashboard(user);
        }
    },

    showMasterDashboard: async () => {
        UI.renderLoading("Carregando Dados do Mestre...");
        try {
            // Carrega inicialmente os dados
            const jogadores = await DB.getJogadores();
            const vantagens = await DB.getVantagens();
            
            UI.renderMasterDashboard(jogadores, vantagens, {
                onLogout: App.showLogin,
                onUpdatePoints: async (id, points) => {
                    await DB.updatePoints(id, points);
                    UI.showToast('Pontos atualizados!');
                    App.showMasterDashboard(); // Reload simples no painel admin
                },
                onViewPlayer: (player) => {
                    // Mestre entra na visão do jogador
                    App.showPlayerDashboard(player, true);
                },
                onCreateVantagem: async (v) => {
                    await DB.addVantagem(v);
                    UI.showToast('Nova vantagem criada!');
                    App.showMasterDashboard();
                },
                onEditVantagem: async (id, v) => {
                    await DB.editVantagem(id, v);
                    UI.showToast('Vantagem alterada!');
                    App.showMasterDashboard();
                },
                onDeleteVantagem: async (id) => {
                    await DB.deleteVantagem(id);
                    UI.showToast('Vantagem excluída!');
                    App.showMasterDashboard();
                }
            });
        } catch (err) {
            UI.showToast("Erro ao carregar dashboard: " + err.message, "error");
        }
    },

    showPlayerDashboard: async (initialUser, isMasterView = false) => {
        UI.renderLoading("Entrando na Toca...");
        try {
            // Se o mestre estiver visualizando, ainda usamos o ID do jogador
            let targetUserId = initialUser.id;
            
            // Inicialmente busca as vantagens do jogador
            const vantagens = await DB.getVantagens(targetUserId);
            
            // Listen para alterações em tempo real dos pontos e dados do jogador logado
            // Se for visão do mestre, tecnicamente nao devemos misturar o AppState.currentUser 
            // mas pro funcionamento da tela serve como um mockup de currentUser = targetUser
            AppState.unsubscribeUserListener = DB.listenUser(targetUserId, (realtimeUser) => {
                if (!isMasterView) AppState.currentUser = realtimeUser; 
                
                UI.renderPlayerDashboard(realtimeUser, vantagens, {
                    isMasterView,
                    onLogout: isMasterView ? App.showMasterDashboard : App.showLogin,
                    onBuy: (vantagem) => {
                        // Action de comprar -> Abre modal
                        UI.showConfirmModal(
                            `Confirmar Compra`, 
                            `Você tem certeza que deseja comprar [${vantagem.nome}] por ${vantagem.custo} Pontos de Sangue?`,
                            async () => {
                                try {
                                    await DB.comprarVantagem(realtimeUser.id, realtimeUser.pontosDeSangue, realtimeUser.vantagens, vantagem);
                                    UI.showToast(`${vantagem.nome} comprada com sucesso!`, "success");
                                    // A tela será re-renderizada automaticamente pelo FireStore Listener (onSnapshot)!
                                } catch(e) {
                                    UI.showToast(e.message, "error");
                                }
                            }
                        )
                    }
                });
            });
            
        } catch (err) {
            UI.showToast("Erro ao carregar o seu perfil: " + err.message, "error");
        }
    }
};
