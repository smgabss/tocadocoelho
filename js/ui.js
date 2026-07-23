/**
 * JS UI Layer
 * Criação da interface DOM, injetando no `#app`
 */

const UI = {
    container: null,
    
    mount: () => {
        UI.container = document.getElementById('app');
    },

    setTheme: (themeClass) => {
        document.body.className = `font-sans antialiased ${themeClass}`;
    },

    htmlToElement: (html) => {
        const template = document.createElement('template');
        html = html.trim();
        template.innerHTML = html;
        return template.content.firstChild;
    },

    clear: () => {
        if(UI.container) UI.container.innerHTML = '';
    },

    renderLoading: (msg = "Carregando...") => {
        UI.clear();
        const html = `
            <div class="flex flex-col items-center justify-center flex-1 h-full min-h-[60vh] animate-pulse">
                <h1 class="text-3xl font-bold tracking-widest text-white/50 uppercase">Toca do Coelho</h1>
                <p class="text-white/30 mt-2">${msg}</p>
            </div>
        `;
        UI.container.appendChild(UI.htmlToElement(html));
    },

    renderLogin: (onSubmit) => {
        UI.clear();
        const html = `
            <div class="flex-1 flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
                <div class="card w-full max-w-sm">
                    <h2 class="text-2xl font-bold text-center mb-8 uppercase tracking-wider text-white">Entrar na Toca</h2>
                    <form id="login-form" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium mb-2 text-white/60">Codinome</label>
                            <input type="text" id="codinome" class="input-field" placeholder="Seu codinome" required autocomplete="off">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2 text-white/60">Senha</label>
                            <input type="password" id="senha" class="input-field" placeholder="Sua senha secreta" required>
                        </div>
                        <button type="submit" class="w-full btn-primary font-bold uppercase tracking-wider rounded-lg px-4 py-3 transition-all">Acessar</button>
                    </form>
                </div>
                
                <div class="mt-8 text-center text-sm text-white/30 max-w-md">
                    <p>Caso seja sua primeira vez e não tenha configurado o Firebase, veja as instruções no README.</p>
                </div>
            </div>
        `;
        const el = UI.htmlToElement(html);
        UI.container.appendChild(el);

        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit(document.getElementById('codinome').value.trim(), document.getElementById('senha').value.trim());
        });
    },

    renderPlayerDashboard: (user, vantagens, actions) => {
        UI.clear();
        const temSaldo = (custo) => user.pontosDeSangue >= custo;
        
        const vantagensFeitas = user.vantagens || [];
        
        const html = `
            <div class="w-full animate-fade-in pb-20">
                <header class="flex justify-between items-center py-6 mb-8 border-b border-white/10">
                    <div>
                        <h1 class="text-3xl font-bold uppercase tracking-widest text-highlight">${user.codinome}</h1>
                        <p class="text-white/50 text-sm mt-1">Jogador(a)</p>
                    </div>
                    <div class="flex gap-4 items-center">
                        <div class="card !p-4 flex items-center gap-3">
                            <span class="text-3xl font-bold text-highlight">${user.pontosDeSangue}</span>
                            <div class="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
                                <img src="./bloodpoints.webp" alt="Pontos de Sangue" onerror="this.style.display='none';">
                            </div>
                        </div>
                        <button id="btn-logout" class="text-white/50 hover:text-white uppercase text-sm p-2 transition-colors">Sair</button>
                    </div>
                </header>

                <main>
                    <h2 class="text-2xl font-bold mb-6 text-white/90">Loja Sombria</h2>
                    ${vantagens.length === 0 ? '<p class="text-white/50">Nenhuma vantagem disponível momento.</p>' : ''}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${vantagens.map(v => {
                            const podeComprar = temSaldo(v.custo);
                            const botaoDisabled = !podeComprar ? 'opacity-50 cursor-not-allowed' : 'btn-primary';
                            const textoBotao = !podeComprar ? 'Sangue Insuficiente' : `Comprar - ${v.custo} pts`;
                            
                            return `
                                <div class="card flex flex-col justify-between">
                                    <div>
                                        <div class="flex justify-between items-start mb-2">
                                            <h3 class="text-xl font-bold text-white/90">${v.nome}</h3>
                                            <span class="text-xs uppercase px-2 py-1 bg-white/10 rounded text-white/70">${v.tipo}</span>
                                        </div>
                                        <p class="text-white/60 text-sm mb-6">${v.descricao}</p>
                                    </div>
                                    <button class="w-full font-bold uppercase tracking-wider rounded-lg px-4 py-3 transition-all ${botaoDisabled}" 
                                            data-id="${v.id}"
                                            ${!podeComprar ? 'disabled title="Você não tem pontos suficientes"' : ''}>
                                        ${textoBotao}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    ${vantagensFeitas.length > 0 ? `
                        <h2 class="text-2xl font-bold mt-16 mb-6 text-highlight">Suas Vantagens Adquiridas</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${vantagensFeitas.map(v => `
                                <div class="glass p-4 rounded-lg flex flex-col border border-white/5">
                                    <h3 class="font-bold text-white/80">${v.nome}</h3>
                                    <p class="text-sm text-white/40 mt-1">${v.descricao}</p>
                                    <span class="text-xs text-white/20 mt-3 align-bottom">Adquirida em: ${new Date(v.dataCompra).toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </main>
            </div>
        `;
        
        UI.container.appendChild(UI.htmlToElement(html));

        document.getElementById('btn-logout').addEventListener('click', actions.onLogout);

        // Bind clicks de compra
        document.querySelectorAll('button[data-id]').forEach(btn => {
            if(!btn.disabled) {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const vantagem = vantagens.find(v => v.id === id);
                    if(vantagem) actions.onBuy(vantagem);
                });
            }
        });
    },

    renderMasterDashboard: (jogadores, vantagens, actions) => {
        UI.clear();
        
        const html = `
            <div class="w-full animate-fade-in pb-20">
                <header class="flex justify-between items-center py-6 mb-8 border-b border-mestre-brown/30">
                    <div>
                        <h1 class="text-3xl font-bold uppercase tracking-widest text-mestre-orange">Painel do Mestre</h1>
                        <p class="text-white/50 text-sm mt-1">Gerenciamento de Campanha</p>
                    </div>
                    <button id="btn-logout-mestre" class="text-white/50 hover:text-white uppercase text-sm p-2">Sair</button>
                </header>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Gerenciamento Jogadores -->
                    <div class="lg:col-span-12 xl:col-span-5">
                        <h2 class="text-xl font-bold mb-4 text-white/80 flex items-center gap-2">Jogadores e Sangue <span class="bg-red-600 w-3 h-3 rounded-full inline-block"></span></h2>
                        <div class="flex flex-col gap-4">
                            ${jogadores.length === 0 ? '<p class="text-white/30">Nenhum jogador encontrado.</p>' : ''}
                            ${jogadores.map(j => `
                                <div class="card !p-4 flex items-center justify-between">
                                    <div>
                                        <h3 class="font-bold text-lg text-white">${j.codinome}</h3>
                                        <p class="text-xs text-white/40">ID: ${j.id}</p>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <button class="btn-decrease w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors" data-id="${j.id}" data-current="${j.pontosDeSangue}">-</button>
                                        <input type="number" id="pts-${j.id}" class="w-16 bg-black/50 border border-white/20 rounded pl-2 py-1 text-center font-bold text-mestre-orange pointer-events-none" value="${j.pontosDeSangue}" readonly />
                                        <button class="btn-increase w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-colors" data-id="${j.id}" data-current="${j.pontosDeSangue}">+</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Gerenciamento Vantagens -->
                    <div class="lg:col-span-12 xl:col-span-7">
                        <h2 class="text-xl font-bold mb-4 text-white/80">Catálogo de Vantagens (Global)</h2>
                        
                        <div class="card mb-6 mb-8 border-white/10 !bg-black/20">
                            <h3 class="font-bold text-sm text-mestre-orange mb-3 uppercase tracking-wider">Criar Nova Vantagem</h3>
                            <form id="form-vantagem" class="space-y-4">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input id="v-nome" class="input-field !py-2 !text-sm" placeholder="Nome" required />
                                    <input id="v-tipo" class="input-field !py-2 !text-sm" placeholder="Tipo (Passiva, Ação...)" required />
                                </div>
                                <textarea id="v-desc" class="input-field !py-2 !text-sm" placeholder="Descrição da vantagem..." rows="2" required></textarea>
                                <div class="flex items-center gap-4">
                                    <input type="number" id="v-custo" min="1" class="input-field !py-2 !text-sm w-32" placeholder="Custo pts" required />
                                    <button type="submit" class="btn-primary flex-1 py-2 font-bold rounded">Gravar no Banco</button>
                                </div>
                            </form>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${vantagens.length === 0 ? '<p class="text-white/30">Nenhuma vantagem cadastrada.</p>' : ''}
                            ${vantagens.map(v => `
                                <div class="card !p-4 flex flex-col justify-between border-white/5">
                                    <div>
                                        <div class="flex justify-between items-start">
                                            <h4 class="font-bold text-white">${v.nome}</h4>
                                            <span class="text-xs bg-white/10 px-1 rounded">${v.tipo}</span>
                                        </div>
                                        <p class="text-xs text-white/50 mt-1 mb-3">${v.descricao}</p>
                                    </div>
                                    <div class="flex justify-between items-center mt-2 border-t border-white/10 pt-3">
                                        <span class="text-sm font-bold text-mestre-orange">${v.custo} Pontos</span>
                                        <button class="text-xs text-red-500 hover:text-red-400 font-bold uppercase delete-vantagem transition-colors" data-id="${v.id}">Excluir</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        UI.container.appendChild(UI.htmlToElement(html));

        document.getElementById('btn-logout-mestre').addEventListener('click', actions.onLogout);

        // Events de pontos (+) e (-)
        const handlePointChange = (e, isIncrease) => {
           const id = e.target.getAttribute('data-id');
           const current = parseInt(e.target.getAttribute('data-current')) || 0;
           const changeAmount = isIncrease ? 1 : (current > 0 ? -1 : 0);
           
           if(changeAmount !== 0) {
               // Update no DOM temporário para feedback instantaneo, depois chama a action
               e.target.parentNode.querySelector('input').value = current + changeAmount;
               actions.onUpdatePoints(id, current + changeAmount);
           }
        };
        document.querySelectorAll('.btn-decrease').forEach(b => b.addEventListener('click', e => handlePointChange(e, false)));
        document.querySelectorAll('.btn-increase').forEach(b => b.addEventListener('click', e => handlePointChange(e, true)));

        // Create Vantagem Form
        document.getElementById('form-vantagem').addEventListener('submit', (e) => {
            e.preventDefault();
            actions.onCreateVantagem({
                nome: document.getElementById('v-nome').value.trim(),
                tipo: document.getElementById('v-tipo').value.trim(),
                descricao: document.getElementById('v-desc').value.trim(),
                custo: parseInt(document.getElementById('v-custo').value)
            });
        });

        // Delete Vantagem
        document.querySelectorAll('.delete-vantagem').forEach(b => {
             b.addEventListener('click', e => {
                 if(confirm("Tem certeza que quer apagar essa Vantagem do Catálogo?")) {
                     actions.onDeleteVantagem(e.target.getAttribute('data-id'));
                 }
             });
        });
    },

    showConfirmModal: (title, message, onConfirm) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = ''; // Clear prev
        
        const modalHtml = `
            <div class="card w-full max-w-md !bg-gray-900 border-white/20 transform scale-95 transition-transform duration-300" id="modal-box">
                <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
                <p class="text-white/70 mb-6">${message}</p>
                <div class="flex justify-end gap-4">
                    <button id="modal-cancel" class="px-4 py-2 text-sm text-white/50 hover:text-white transition-colors">Cancelar</button>
                    <button id="modal-confirm" class="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 rounded font-bold transition-colors">Confirmar</button>
                </div>
            </div>
        `;
        
        modalContainer.appendChild(UI.htmlToElement(modalHtml));
        modalContainer.classList.remove('hidden');
        
        // Timeout para garantir render antes do fade-in
        setTimeout(() => {
            modalContainer.classList.remove('opacity-0');
            document.getElementById('modal-box').classList.remove('scale-95');
        }, 10);

        const closeModal = () => {
             modalContainer.classList.add('opacity-0');
             document.getElementById('modal-box').classList.add('scale-95');
             setTimeout(() => modalContainer.classList.add('hidden'), 300);
        };

        document.getElementById('modal-cancel').addEventListener('click', closeModal);
        document.getElementById('modal-confirm').addEventListener('click', () => {
            closeModal();
            onConfirm();
        });
    },

    showToast: (msg, type = 'info') => {
        const container = document.getElementById('toast-container');
        const bg = type === 'error' ? 'bg-red-600' : (type === 'success' ? 'bg-green-600' : 'bg-gray-800');
        const html = `
            <div class="${bg} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-fade-in translate-x-4 opacity-0 border border-white/10" style="animation-fill-mode: forwards; animation-name: slideInRight;">
                <span class="text-sm font-medium">${msg}</span>
            </div>
        `;
        
        if (!document.querySelector('style#toast-style')) {
             const style = document.createElement('style');
             style.id = 'toast-style';
             style.innerHTML = `
                @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes fadeOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(20px); opacity: 0; } }
             `;
             document.head.appendChild(style);
        }

        const el = UI.htmlToElement(html);
        container.appendChild(el);

        setTimeout(() => {
            el.style.animationName = 'fadeOutRight';
            setTimeout(() => el.remove(), 400); 
        }, 3000);
    }
};
