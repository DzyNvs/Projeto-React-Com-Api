import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // Para o loading
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
// 1. Precisamos do 'signIn' para fazer o login final
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importar o auth

// Reutiliza o tema "praiano"
const themeColors = {
  primary: '#0077B6', // Azul Oceano
  secondary: '#90E0EF', // Azul Céu
  text: '#0A2E36', // Texto (Azul Escuro)
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo (pode ser a mesma do login)
const otpBackground = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto/format&fit=crop' };


// O componente principal da tela
// 2. Recebemos 'route' para pegar os dados da tela de Login
export default function OtpScreen({ route, navigation }) {
  // 3. Pegar os dados passados pela tela de Login
  const { email, password, codigoGerado } = route.params;

  // Estados
  const [otpDigitado, setOtpDigitado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Para o erro no "HTML"

  // --- Funções de Lógica ---

  const handleVerificarCodigo = async () => {
    if (otpDigitado.length !== 6) {
      setError('O código deve ter 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');

    // ETAPA 1: Validar o código digitado
    if (otpDigitado === codigoGerado) {
      // CÓDIGO CORRETO!
      // ETAPA 2: Fazer o login final no Firebase
      try {
        await signInWithEmailAndPassword(auth, email, password);
        // SUCESSO! O App.js (onAuthStateChanged) vai detectar
        // este login e navegar para a WelcomeScreen.
      } catch (e) {
        // Isso não deveria acontecer (pois já validamos as credenciais),
        // mas é uma proteção extra.
        setLoading(false);
        setError('Erro final ao autenticar. Tente novamente.');
        console.error("ERRO NA ETAPA FINAL (OTP):", e.code);
      }
      
    } else {
      // CÓDIGO INCORRETO
      setLoading(false);
      setError('Código OTP inválido. Tente novamente.');
      setOtpDigitado(''); // Limpa o campo
    }
  };

  // --- Renderização (JSX) ---
  return (
    <ImageBackground 
      source={otpBackground} 
      resizeMode="cover" 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Verificação</Text>
          <Text style={styles.subtitle}>
            Digite o código de 6 dígitos enviado para:
          </Text>
          <Text style={styles.emailText}>{email}</Text>

          {/* Área de Erro no "HTML" */}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TextInput
            style={styles.otpInput}
            placeholder="------"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            maxLength={6}
            value={otpDigitado}
            onChangeText={(text) => {
              setOtpDigitado(text);
              setError(''); // Limpa o erro ao digitar
            }}
            textAlign='center'
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerificarCodigo}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar e Entrar</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backLink}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

// --- Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // Escurece o fundo
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Efeito de "vidro"
    padding: 25,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: themeColors.text,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  otpInput: {
    width: '90%',
    alignSelf: 'center',
    height: 60,
    backgroundColor: themeColors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: themeColors.primary,
    fontSize: 28,
    letterSpacing: 10, // Simula o espaçamento
    textAlign: 'center',
    marginBottom: 20,
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
  backLink: { 
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: themeColors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});