/**
 * JS DB Layer
 * Concentra toda a comunicação com o Firebase (Firestore)
 */

window.DB = {
    /**
     * Tenta fazer login checando a collection 'users'
     */
    login: async (codinome, senha) => {
        if (!db) throw new Error("Firebase DB não inicializado.");
        try {
            console.log("Tentando login no Firebase...");
            const snapshot = await db.collection("users")
                .where("codinome", "==", codinome)
                .where("password", "==", senha)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        }
    },

    /**
     * Busca um único usuário e escuta as alterações (Real-time).
     * Útil pro dashboard do jogador, pra ver os pontos atualizando na hora.
     */
    listenUser: (userId, callback) => {
        return db.collection("users").doc(userId).onSnapshot(doc => {
            if(doc.exists) {
                callback({ id: doc.id, ...doc.data() });
            }
        });
    },

    /**
     * Busca todos os usuários (jogadores)
     */
    getJogadores: async () => {
        const snapshot = await db.collection("users").where("role", "==", "player").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    /**
     * O mestre atualiza os pontos de um jogador
     */
    updatePoints: async (userId, newPoints) => {
        await db.collection("users").doc(userId).update({
            pontosDeSangue: newPoints
        });
    },

    /**
     * Busca todas as vantagens globais construídas (ou para um jogador)
     */
    getVantagens: async (ownerId = null) => {
        let query = db.collection("vantagens");
        if (ownerId) {
            query = query.where("ownerId", "==", ownerId);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * CRUD Vantagens (Mestre)
     */
    addVantagem: async (vantagem) => {
        if (!vantagem.ownerId) throw new Error("A Vantagem precisa estar atrelada a um jogador.");
        await db.collection("vantagens").add({
            ...vantagem,
            isLocked: vantagem.isLocked || false
        });
    },
    
    editVantagem: async (id, vantagem) => {
        if (!vantagem.ownerId) throw new Error("A Vantagem precisa estar atrelada a um jogador.");
        await db.collection("vantagens").doc(id).update(vantagem);
    },
    
    toggleLockVantagem: async (id, isLocked) => {
        await db.collection("vantagens").doc(id).update({ isLocked });
    },
    
    deleteVantagem: async (vantagemId) => {
        await db.collection("vantagens").doc(vantagemId).delete();
    },

    /**
     * Devolve uma vantagem já comprada pelo jogador.
     * Restaura os pontos, remove da lista dele e recria na coleção global de compra.
     */
    devolverVantagem: async (userId, currentPoints, currentVantagens, vantagem) => {
        if (!vantagem) throw new Error("Vantagem não encontrada para estorno.");

        const novosVantagens = currentVantagens.filter((v) => v.id !== vantagem.id);
        const newPoints = currentPoints + (vantagem.custo || 0);

        // Remove do inventario e extorna
        await db.collection("users").doc(userId).update({
            pontosDeSangue: newPoints,
            vantagens: novosVantagens
        });

        // Recria na Teia de Sangue mantendo as info (exceto data de compra)
        await db.collection("vantagens").add({
            nome: vantagem.nome,
            descricao: vantagem.descricao || "",
            tipo: vantagem.tipo || "",
            custo: vantagem.custo,
            crisUrl: vantagem.crisUrl || null,
            preRequisito: vantagem.preRequisito || "",
            isLocked: vantagem.isLocked || false,
            ownerId: userId
        });
    },

    /**
     * Fluxo completo de compra
     * Verifica saldo, desconta e adiciona vantagem na lista do player
     */
    comprarVantagem: async (userId, currentPoints, currentVantagens, vantagem) => {
        if (currentPoints < vantagem.custo) {
            throw new Error("Pontos de Sangue insuficientes!");
        }

        const newPoints = currentPoints - vantagem.custo;
        // Salva a vantagem sem o ID da collection root para ter o próprio objeto
        const record = { ...vantagem, dataCompra: new Date().toISOString() };
        const updatedVantagens = [...(currentVantagens || []), record];

        await db.collection("users").doc(userId).update({
            pontosDeSangue: newPoints,
            vantagens: updatedVantagens
        });

        // Apaga a vantagem da listagem publica para nao comprarem de novo
        await db.collection("vantagens").doc(vantagem.id).delete();
    }
};
