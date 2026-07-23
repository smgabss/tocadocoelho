// Configuração Firebase (preencher com seus dados do Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyArW-J-kSjVq8lJgT-ltm3U3daAWaQaA6A",
  authDomain: "toca-do-coelho-b8107.firebaseapp.com",
  projectId: "toca-do-coelho-b8107",
  storageBucket: "toca-do-coelho-b8107.firebasestorage.app",
  messagingSenderId: "717773002783",
  appId: "1:717773002783:web:9df02172f379c132985d2a",
  measurementId: "G-VZZXG650VR"
};

// Inicialização segura - só inicia se os dados estiverem preenchidos e o firebase existir
let db = null;

if (firebaseConfig.apiKey !== "" && window.firebase) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} else {
    console.warn("Firebase não está configurado. Preencha firebaseConfig em js/firebase-config.js.");
    // Criar um mock temporário para evitar erros no UI se não tiver Firebase
    db = {
        collection: () => ({
            where: () => ({ get: async () => ({ empty: true, docs: [] }) }),
            get: async () => ({ empty: true, docs: [] }),
            doc: () => ({
                onSnapshot: () => {},
                update: async () => {}
            }),
            add: async () => {}
        })
    };
}
