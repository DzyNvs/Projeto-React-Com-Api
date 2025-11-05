import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
// 1. Importe o 'signOut'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
// Importa o auth e db do seu arquivo de configuração
import { auth, db } from '../config/firebase'; 

// Reutiliza o tema
const themeColors = {
  primary: '#0077B6', // Azul Oceano
  secondary: '#90E0EF', // Azul Céu
  background: '#F4E8D1', // Areia
  text: '#0A2E36', // Texto (Azul Escuro)
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo
const registerBackground = { uri: 'https://images.unsplash.com/photo-1483728642387-6c351b4d1eed?q=80&w=2072&auto=format&fit=crop' };

// Função auxiliar para tratar erros do Firebase
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo usado.';
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. (Mínimo 6 caracteres)';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
};

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState(''); // Este será o "PrimeiroNome"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!nome || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Cria o usuário no Firebase Auth (cuida da senha)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Salva os dados no Firestore (SEM A SENHA)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        PrimeiroNome: nome, // O campo no banco é "PrimeiroNome"
        email: email,
      });

      // 3. (NOVA ETAPA) Desloga o usuário recém-criado
      // Isso garante que o App.js não nos mova para a WelcomeScreen.
      await signOut(auth);

      // 4. Navega para a tela de Login (como você pediu)
      navigation.navigate('Login');

    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={registerBackground} resizeMode="cover" style={styles.backgroundImage}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Criar Conta</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Seu primeiro nome"
              value={nome}
              onChangeText={setNome}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Sua senha (mín. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={themeColors.white} />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Faça Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// Estilos (styles) permanecem os mesmos
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(0,0,0,0.4)', // Escurece a imagem
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 25,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: themeColors.white,
    borderWidth: 1,
    borderColor: themeColors.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    color: themeColors.text,
  },
  button: {
    height: 50,
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: themeColors.secondary,
  },
  buttonText: {
    color: themeColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: themeColors.text,
    fontSize: 14,
  },
  loginLink: {
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: themeColors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});