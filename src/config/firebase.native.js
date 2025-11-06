import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 1. IMPORTAÇÕES CORRIGIDAS
// Ambas as funções (initializeAuth e getReactNativePersistence) vêm de 'firebase/auth'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sua configuração do Firebase (copie e cole a mesma do outro arquivo)
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

// 2. Inicializa o AUTH com persistência nativa (AsyncStorage)
// Este é o código que o celular precisa para funcionar
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 3. Inicializa o FIRESTORE (Banco de Dados)
export const db = getFirestore(app);