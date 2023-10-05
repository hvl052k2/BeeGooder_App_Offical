import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import {useState, useContext, useRef, useEffect} from 'react';
import {AuthContext} from '../navigation/AuthProvider.android';
import auth from '@react-native-firebase/auth';

export default OTPScreen = ({navigation, phoneNumber}) => {
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const {user, setUser} = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);

  const et1 = useRef();
  const et2 = useRef();
  const et3 = useRef();
  const et4 = useRef();
  const et5 = useRef();
  const et6 = useRef();

  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');
  const [f4, setF4] = useState('');
  const [f5, setF5] = useState('');
  const [f6, setF6] = useState('');

  const [count, setCount] = useState(60);
  useEffect(() => {
    const interval = setInterval(() => {
      if (count == 0) {
        clearInterval(interval);
      } else {
        setCount(count - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [count]);

  const onAuthStateChanged = user => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  const phoneLogin = async phone_Number => {
    try {
      console.log('confirmation was send.');
      const confirmation = await auth().signInWithPhoneNumber(phone_Number);
      setConfirm(confirmation);
    } catch (e) {
      console.log('Error with confirmation code.');
    }
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    phoneLogin('+44 7444 555666');
  }, []);

  const confirmCode = async () => {
    try {
      await confirm.confirm(code);
    } catch (error) {
      console.log('Invalid code.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={{width: 150, height: 200}}
        resizeMode="contain"
        source={require('../assets/images/forget_password.png')}
      />
       
      <Text style={styles.title}>OTP VERIFICATION?</Text>

      {/* <FormInput
        lableValue={code}
        onChangeText={text => setCode(text)}
        placeHolderText="OTP code"
        iconType="code-working-outline"
        keyboardType="numeric"
        autoCapitalize="none"
        autoCorrect={false}
      /> */}

      <View style={styles.OTPView}>
        <TextInput
          ref={et1}
          style={[
            styles.inputView,
            {borderColor: f1.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f1}
          onChangeText={text => {
            setF1(text);
            if (text.length >= 1) {
              et2.current.focus();
            }
          }}
        />
        <TextInput
          ref={et2}
          style={[
            styles.inputView,
            {borderColor: f2.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f2}
          onChangeText={text => {
            setF2(text);
            if (text.length >= 1) {
              et3.current.focus();
            } else if (text.length < 1) {
              et1.current.focus();
            }
          }}
        />
        <TextInput
          ref={et3}
          style={[
            styles.inputView,
            {borderColor: f3.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f3}
          onChangeText={text => {
            setF3(text);
            if (text.length >= 1) {
              et4.current.focus();
            } else if (text.length < 1) {
              et2.current.focus();
            }
          }}
        />
        <TextInput
          ref={et4}
          style={[
            styles.inputView,
            {borderColor: f4.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f4}
          onChangeText={text => {
            setF4(text);
            if (text.length >= 1) {
              et5.current.focus();
            } else if (text.length < 1) {
              et3.current.focus();
            }
          }}
        />
        <TextInput
          ref={et5}
          style={[
            styles.inputView,
            {borderColor: f5.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f5}
          onChangeText={text => {
            setF5(text);
            if (text.length >= 1) {
              et6.current.focus();
            } else if (text.length < 1) {
              et4.current.focus();
            }
          }}
        />
        <TextInput
          ref={et6}
          style={[
            styles.inputView,
            {borderColor: f6.length >= 1 ? '#2e64e5' : '#333'},
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={f6}
          onChangeText={text => {
            setF6(text);
            if (text.length >= 1) {
              et6.current.focus();
            } else if (text.length < 1) {
              et5.current.focus();
            }
          }}
        />
      </View>
      <View style={styles.resendView}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '500',
            color: count == 0 ? '#2e64e5' : 'gray',
          }}
          onPress={() => {
            setCount(30);
          }}>
          Resend
        </Text>
        {count !== 0 && (
          <Text style={{marginLeft: 20, fontSize: 20}}>
            {count + ' seconds'}
          </Text>
        )}
      </View>
      <FormButton
        buttonTitle="Verify OTP"
        disabled={
          f1 !== '' &&
          f2 !== '' &&
          f3 !== '' &&
          f4 !== '' &&
          f5 !== '' &&
          f6 !== ''
            ? false
            : true
        }
        isValid={
          f1 !== '' &&
          f2 !== '' &&
          f3 !== '' &&
          f4 !== '' &&
          f5 !== '' &&
          f6 !== ''
            ? true
            : false
        }
        onPress={() => {
          let enteredOTP = f1 + f2 + f3 + f4 + f5;
          setCode(enteredOTP);
          confirmCode();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
    padding: 24,
  },
  OTPView: {
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 30,
  },
  inputView: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
  },
  resendView: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    color: 'purple',
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 50,
    textAlign: 'center',
  },
  iconStyle: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  navButton: {
    marginTop: 30,
    flexDirection: 'row',
  },
  forgotButton: {
    marginVertical: 30,
    flexDirection: 'row',
  },
  text: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2e64e5',
  },
  navButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#2e64e5',
    textDecorationLine: 'underline',
  },
});
