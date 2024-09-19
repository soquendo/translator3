import React, { useState } from 'react';
import { View, TextInput, Modal, TouchableOpacity, StyleSheet, Text, ScrollView } from 'react-native';
import axios from 'axios'; //for api
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; //for add navigation later
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

// Languages list
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

const Translator = () => {
  const [text, setText] = useState<string>(''); // Text to translate
  const [translatedText, setTranslatedText] = useState<string | null>(null); // Translated result
  const [fromLanguage, setFromLanguage] = useState<string>('en'); // Default from language
  const [toLanguage, setToLanguage] = useState<string>('es'); // Default to language
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Modal visibility for language selection
  const [isSelectingFromLanguage, setIsSelectingFromLanguage] = useState<boolean>(false); // Is the user selecting the from language?

  // Spring animation value
  const translationAnimation = useSharedValue(0);

  // Fetch translation from an API (DeepL or any other)
  const fetchTranslation = async () => {
    try {
      const response = await axios.get(`https://api-free.deepl.com/v2/translate`, {
        params: {
          text: text,
          source_lang: fromLanguage.toUpperCase(),
          target_lang: toLanguage.toUpperCase(),
          auth_key: '63835fef-b9f0-4ef3-9c1c-6de47f0dade1:fx', //api key
        },
      });
      const translation = response.data.translations[0].text; //creating variable
      setTranslatedText(translation);

      // Trigger the spring animation for translated text
      translationAnimation.value = withSpring(1, {}, () => {
        translationAnimation.value = 0; // Reset the animation
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Animated style for the translated text
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(translationAnimation.value + 1) }],
    };
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Row for FROM and TO Language Selection */}
      <View style={styles.languageSelectionRow}>
        {/* FROM Language */}
        <TouchableOpacity onPress={() => { setIsModalVisible(true); setIsSelectingFromLanguage(true); }}>
          <View style={styles.languageOption}>
            <Text style={styles.label}>From: {LANGUAGES.find(lang => lang.code === fromLanguage)?.name}</Text>
          </View>
        </TouchableOpacity>

        {/* Arrow for visual indication */}
        <Text style={styles.arrow}>→</Text>

        {/* TO Language */}
        <TouchableOpacity onPress={() => { setIsModalVisible(true); setIsSelectingFromLanguage(false); }}>
          <View style={styles.languageOption}>
            <Text style={styles.label}>To: {LANGUAGES.find(lang => lang.code === toLanguage)?.name}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TextInput //user input
        placeholder="Enter text to translate"
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity onPress={fetchTranslation} style={styles.translateButton}>
        <Text style={styles.translateButtonText}>Translate</Text>
      </TouchableOpacity>

      {translatedText && (
        <Animated.View style={[styles.translatedBox, animatedStyle]}>
          <Text style={styles.translatedText}>Translated: {translatedText}</Text>
        </Animated.View>
      )}

      {/* Modal for language select */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modal}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              onPress={() => {
                if (isSelectingFromLanguage) {
                  setFromLanguage(language.code);
                } else {
                  setToLanguage(language.code);
                }
                setIsModalVisible(false);
              }}
            >
              <View style={styles.languageOption}>
                <Text style={styles.languageText}>{language.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Tab Navigator Setup
const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Ionicons
                name={route.name === 'Translator' ? focused ? 'language' : 'language-outline' : 'alert-circle-outline'}
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: 'green',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Translator" component={Translator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  languageSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#000', 
  },
  languageOption: {
    marginHorizontal: 10,
  },
  arrow: {
    fontSize: 24,
    color: '#000',
    marginHorizontal: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#eee', 
    color: '#000',
    width: '70%',
    padding: 8,
    marginVertical: 10,
  },
  translateButton: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButtonText: {
    color: '#fff', 
    fontSize: 17,
  },
  translatedBox: {
    backgroundColor: '#f0f0f0', 
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
  },
  translatedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  languageText: {
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    fontSize: 18,
    color: '#FF6347',
    marginTop: 20,
  },
});

export default App;