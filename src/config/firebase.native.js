import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Estas são as importações NATIVAS
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sua configuração do Firebase (copie e cole a mesma)
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

// Inicializa o FIRESTORE
export const db = getFirestore(app);

// Inicialização do Auth para NATIVO (com AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Exporta o auth
export { auth };