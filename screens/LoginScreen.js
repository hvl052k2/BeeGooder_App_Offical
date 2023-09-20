import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import SocialButton from '../components/SocialButton';
import {useState, useContext} from 'react';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';

export default LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(true);
  const {login, googleLogin, fbLogin} = useContext(AuthContext);

  const SignupSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('Please enter your email.'),
    password: Yup.string()
      .min(8)
      .required('Please enter your password.')
      .matches(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'Must contain minium 8 character, at least one uppercase letter, one lowercase letter, one number and one special character',
      ),
  });

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
      }}
      validationSchema={SignupSchema}
      onSubmit={values => login(values.email, values.password)}>
      {({
        values,
        errors,
        touched,
        handleChange,
        setFieldTouched,
        isValid,
        handleSubmit,
      }) => (
        <View style={styles.container}>
          <Icon name="logo-octocat" size={120} color="purple" />
          <Text style={styles.title}>LOG IN</Text>

          <FormInput
            lableValue={values.email}
            onChangeText={handleChange('email')}
            onBlur={() => setFieldTouched('email')}
            placeHolderText="Email"
            iconType="person-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {touched.email && errors.email && (
            <Text style={styles.errorTxt}>{errors.email}</Text>
          )}

          <FormInput
            lableValue={values.password}
            onChangeText={handleChange('password')}
            onBlur={() => setFieldTouched('password')}
            placeHolderText="Password"
            iconType="lock-closed-outline"
            secureTextEntry={visible}>
            <View style={styles.iconStyle}>
              <Icon
                name={visible ? 'eye-off-outline' : 'eye-outline'}
                size={25}
                color="#666"
                onPress={() => {
                  setVisible(!visible);
                }}
              />
            </View>
          </FormInput>
          {touched.password && errors.password && (
            <Text style={styles.errorTxt}>{errors.password}</Text>
          )}

          <FormButton
            buttonTitle="Sign In"
            disabled={isValid}
            onPress={handleSubmit}
          />

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.text}>Forgot Password?</Text>
          </TouchableOpacity>

          <SocialButton
            buttonTitle="Sign in with facebook"
            btnType="logo-facebook"
            color="#4867aa"
            backgroundColor="#e6eaf4"
            onPress={() => fbLogin()}
          />

          <SocialButton
            buttonTitle="Sign in with google"
            btnType="logo-google"
            color="#de4d41"
            backgroundColor="#f5e7ea"
            onPress={() => googleLogin()}
          />

          <View style={styles.navButton}>
            <Text style={styles.text}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.navButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTxt: {
    color: 'red',
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    color: 'purple',
    fontWeight: '600',
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
