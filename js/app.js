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
                    App.handleSuccessfulLogin(user, codinome, senha);
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

    handleSuccessfulLogin: (user, codinome = null, senha = null) => {
        AppState.currentUser = user;
        UI.setTheme(user.theme);
        UI.showToast(`Bem-vindo, ${user.codinome}!`);

        // Pede ao navegador para salvar as credenciais
        if (codinome && senha && window.PasswordCredential) {
            const cred = new PasswordCredential({
                id: codinome,
                password: senha,
                name: user.codinome
            });
            navigator.credentials.store(cred).catch(() => {});
        }

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
                },
                onToggleLock: async (id, isLocked) => {
                    await DB.toggleLockVantagem(id, isLocked);
                    UI.showToast(isLocked ? 'Vantagem trancada!' : 'Vantagem destrancada!');
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
                                    // Comprar apaga do global. Precisamos forçar o recarregamento total da tela (que refaz o getVantagens) para que o card da teia de sangue suma de vez
                                    if(AppState.unsubscribeUserListener) AppState.unsubscribeUserListener();
                                    App.showPlayerDashboard(initialUser, isMasterView);
                                } catch(e) {
                                    UI.showToast(e.message, "error");
                                }
                            }
                        )
                    },
                     onDevolver: async (vantagem) => {
                          try {
                              UI.renderLoading("Processando devolução...");
                              await DB.devolverVantagem(realtimeUser.id, realtimeUser.pontosDeSangue, realtimeUser.vantagens, vantagem);
                              UI.showToast(`O valor de ${vantagem.nome} foi reembolsado e trancado novamente!`, "success");
                              
                              if(AppState.unsubscribeUserListener) AppState.unsubscribeUserListener();
                              App.showPlayerDashboard(initialUser, isMasterView);
                          } catch (e) {
                              UI.showToast(e.message, "error");
                          }
                     },
                     onRefund: (vantagemNome, vantagemIndex) => {
                        // Só disponível para o mestre
                        UI.showConfirmModal(
                            `Estornar Vantagem`,
                            `Deseja estornar [${vantagemNome}]? Os Pontos de Sangue serão devolvidos e a vantagem voltará para a Teia de Sangue.`,
                            async () => {
                                try {
                                    await DB.estornarVantagem(realtimeUser.id, realtimeUser.pontosDeSangue, realtimeUser.vantagens, vantagemIndex);
                                    UI.showToast(`${vantagemNome} estornada! Pontos devolvidos.`, "success");
                                    // Firestore listener re-renderiza automaticamente
                                } catch(e) {
                                    UI.showToast(e.message, "error");
                                }
                            }
                        );
                    }
                });
            });
            
        } catch (err) {
            UI.showToast("Erro ao carregar o seu perfil: " + err.message, "error");
        }
    }
};
