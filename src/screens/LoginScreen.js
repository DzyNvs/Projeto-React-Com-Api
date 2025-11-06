import React, { useState, useCallback } from 'react'; // 1. Importar 'useCallback'
import { useFocusEffect } from '@react-navigation/native'; // 2. Importar o 'useFocusEffect'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // Usado para erros de rede/EmailJS
  ActivityIndicator, // Para o loading
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
// 3. Precisamos do 'signOut' para o novo fluxo
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importar o auth (verifique seu caminho)

// ⬇️⬇️ Suas chaves do EmailJS (corretas) ⬇️⬇️
const EMAILJS_PUBLIC_KEY = '_4GugrccKCI1bIh5S';
const EMAILJS_SERVICE_ID = 'service_d5fzrq4';
const EMAILJS_TEMPLATE_ID = 'template_q910keg';
// ⬆️⬆️ Suas chaves do EmailJS (corretas) ⬆️⬆️


// Reutiliza o tema
const themeColors = {
  primary: '#0077B6', // Azul Oceano
  secondary: '#90E0EF', // Azul Céu
  text: '#0A2E36', // Texto (Azul Escuro)
  white: '#FFFFFF',
  error: '#B00020',
};

// Imagem de fundo
const loginBackground = { uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop' };


// O componente principal da tela
const LoginScreen = ({ navigation }) => {
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  // 4. A CORREÇÃO DO F5/LOGOUT: Reseta o estado toda vez que a tela focar
  useFocusEffect(
    useCallback(() => {
      // Esta função roda toda vez que você "chega" nesta tela
      // (seja por F5, ou voltando do Logout)
      console.log("Focando na tela de Login, resetando estados...");
      setLoading(false);
      setError('');
      
      // Não há "função de limpeza" (return) aqui,
      // pois era ela que estava quebrando a navegação.
    }, []) // O array vazio garante que isso só rode ao focar
  );


  // --- Funções de Lógica ---

  const gerarOTP = () => {
    // 5. Corrigido: removemos o setCodigoGerado (que causava erro)
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
    setError(''); // Limpa erros antigos

    // ETAPA 1: Validar as credenciais no Firebase PRIMEIRO
    let codigoGerado; // Declaramos aqui para estar disponível
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Se chegou aqui, o e-mail e senha estão CORRETOS.
      // Deslogamos imediatamente, pois só queríamos validar.
      await signOut(auth); 
    } catch (e) {
      setLoading(false);
      console.error("ERRO NA ETAPA 1 (FIREBASE):", e.code, e.message);
      
      let errorMessage = 'E-mail ou senha incorretos.'; // Padrão
      if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de rede. Verifique sua conexão.';
      }
      
      setError(errorMessage); // Mostra o erro na tela
      return; // Para a execução
    }

    // ETAPA 2: Credenciais validadas. Agora, enviar o e-mail OTP.
    try {
      codigoGerado = gerarOTP();

      const data = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email, // Corrigido para 'to_email' (que configuramos no EmailJS)
          codigo_otp: codigoGerado,
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro do EmailJS:", errorText);
        throw new Error(errorText); // Joga o erro do EmailJS
      }
      
      // ETAPA 3: SUCESSO! E-mail enviado. Navega para a tela OTP.
      // Passamos os dados necessários para a próxima tela
      navigation.navigate('Otp', { 
        email: email,
        password: password,
        codigoGerado: codigoGerado
      });

    } catch (e) {
      // Erro na ETAPA 2 (EmailJS)
      console.error("ERRO NA ETAPA 2 (EMAILJS):", e.message);
      Alert.alert( 
        'Erro ao Enviar OTP', 
        `Não foi possível enviar o código. (Erro: ${e.message})`
      );
      setLoading(false); // Aqui sim, paramos o loading
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
        {/* A TELA DE LOGIN (Sempre visível) */}
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Informe seus dados para continuar.</Text>

          {/* ÁREA DE ERRO NA TELA */}
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
              setError(''); // Limpa o erro ao digitar
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
              setError(''); // Limpa o erro ao digitar
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
  registerLink: { // Usado para "Registre-se"
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // O estilo de erro na tela
  errorText: {
    color: themeColors.error,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

export default LoginScreen;