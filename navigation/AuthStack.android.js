import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// import screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createStackNavigator();

export default AuthStack = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  let routeName;

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunch', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });

    GoogleSignin.configure({
      webClientId: '904803102717-e0qukf3a1v3v1gps4eisrsnk0ufjbpn0.apps.googleusercontent.com',
    });
  }, []);

  if (isFirstLaunch === null) {
    return null;
  } else if (isFirstLaunch === true) {
    routeName = 'Onboarding';
  } else {
    routeName = 'Login';
  }

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={routeName}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={({navigation}) => ({
          headerShown: true,
          title: ' ',
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: '#fff',
            elevation: 0,
          },
          headerLeft: () => {
            return (
              <TouchableOpacity
                style={styles.gobackButton}
                onPress={() => navigation.navigate('Login')}>
                <Icon name="arrow-back" size={35} color="#333" />
              </TouchableOpacity>
            );
          },
        })}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  gobackButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
  },
});
