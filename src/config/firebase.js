// Importa as funções que você precisa dos SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importa a Autenticação

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYPyzWlBfkT5QiTIVKfeYkNih7M3ujzYw",
  authDomain: "appfirebasereactnative-e98d6.firebaseapp.com",
  databaseURL: "https://appfirebasereactnative-e98d6-default-rtdb.firebaseio.com",
  projectId: "appfirebasereactnative-e98d6",
  storageBucket: "appfirebasereactnative-e98d6.firebasestorage.app",
  messagingSenderId: "813204212261",
  appId: "1:813204212261:web:138c9a3277e01783c10dcc"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta os serviços
export const db = getFirestore(app); // Banco de dados
// 2. Inicializa o AUTH com persistência nativa
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});