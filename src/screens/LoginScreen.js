import React, { useState } from 'react'; 
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform, // Mantido para o 'behavior' do KeyboardAvoidingView
  ImageBackground,
} from 'react-native';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase'; // Verifique o caminho do seu config

// Suas chaves do EmailJS (corretas)
const EMAILJS_PUBLIC_KEY = '_4GugrccKCI1bIh5S';
const EMAILJS_SERVICE_ID = 'service_d5fzrq4';
const EMAILJS_TEMPLATE_ID = 'template_q910keg';

// Reutiliza o tema
const themeColors = {
  primary: '#0077B6', 
  secondary: '#90E0EF', 
  text: '#0A2E36', 
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo
const loginBackground = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto/format&fit=crop' };

// O componente principal da tela
const LoginScreen = ({ navigation }) => {
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  // Corrige o bug do F5/Logout
  useFocusEffect(
    () => {
      console.log("Focando na tela de Login, resetando estados...");
      setLoading(false);
      setError('');
    }
  );

  // --- Funções de Lógica ---

  const gerarOTP = () => {
    const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("CÓDIGO OTP GERADO (para testes): " + novoCodigo);
    return novoCodigo;
  };

  // Esta é a função com o fluxo CORRETO
  const handleLoginPress = async () => {
    if (!email || !password) {
      setError('Por favor, preencha seu e-mail e senha.');
      return;
    }
    setLoading(true);
    setError(''); 

    // ETAPA 1: Validar as credenciais no Firebase PRIMEIRO
    let codigoGerado; 
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await signOut(auth); 
    } catch (e) {
      setLoading(false);
      console.error("ERRO NA ETAPA 1 (FIREBASE):", e.code, e.message);
      let errorMessage = 'E-mail ou senha incorretos.';
      if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de rede. Verifique sua conexão.';
      }
      setError(errorMessage); 
      return; 
    }

    // 2. ETAPA 2: LÓGICA NÃO-HÍBRIDA (Vai rodar em todas as plataformas)
    
    codigoGerado = gerarOTP(); // Gera o código

    try {
      // Fazer o envio REAL com EmailJS
      const data = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          codigo_otp: codigoGerado,
        }
      };

      // Esta chamada 'fetch' será tentada no Celular e na Web
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // No Expo Go / APK, o erro será "API calls are disabled..."
        throw new Error(errorText);
      }
      
      console.log("EmailJS: E-mail real enviado (ou tentado).");
      
      setLoading(false); // 1. Pare o loading ANTES de navegar

      // ETAPA 3: SUCESSO! Navega para a tela OTP.
      navigation.navigate('Otp', { // 2. Navegue
        email: email,
        password: password,
        codigoGerado: codigoGerado
      });

    } catch (e) {
      // Erro na ETAPA 2 (EmailJS)
      console.error("ERRO NA ETAPA 2 (EMAILJS):", e.message);
      // Este Alert vai mostrar "API calls are disabled..." no Expo Go/APK
      Alert.alert( 
        'Erro ao Enviar OTP', 
        `Não foi possível enviar o código. (Erro: ${e.message})`
      );
      setLoading(false);
    }
  };


  // --- Renderização (JSX) ---
  return (
    <ImageBackground 
      source={loginBackground} 
      resizeMode="cover" 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Informe seus dados para continuar.</Text>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(''); 
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(''); 
            }}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLoginPress}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Registre-se</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: themeColors.text,
    fontSize: 14,
  },
  registerLink: { 
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: themeColors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;