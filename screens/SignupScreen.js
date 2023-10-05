import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import SocialButton from '../components/SocialButton';
import {useContext, useState} from 'react';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';

export default LoginScreen = ({navigation}) => {
  const [visible, setVisible] = useState(true);
  const {register} = useContext(AuthContext);

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
    confirmPassword: Yup.string()
      .min(8, 'Confirm password must be 8 characters long.')
      .oneOf([Yup.ref('password')], 'Your password do not match.')
      .required('Confirm password is required.'),
  });

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={SignupSchema}
      onSubmit={values => register(values.email, values.password)}>
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
          <Text style={styles.title}>SIGN UP</Text>

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
            autoCapitalize="none"
            secureTextEntry={!visible}>
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

          <FormInput
            lableValue={values.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            onBlur={() => setFieldTouched('confirmPassword')}
            placeHolderText="Confirm Password"
            iconType="lock-closed-outline"
            secureTextEntry={!visible}>
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
          {touched.confirmPassword && errors.confirmPassword && (
            <Text style={styles.errorTxt}>{errors.confirmPassword}</Text>
          )}

          <FormButton
            buttonTitle="Sign Up"
            disabled={!isValid}
            isValid={isValid}
            onPress={handleSubmit}
          />

          <View style={styles.textPrivate}>
            <Text style={styles.color_textPrivate}>
              By registering, you confirm that you accept our{' '}
            </Text>
            <TouchableOpacity onPress={() => alert('Terms clicked')}>
              <Text style={[styles.color_textPrivate, {color: '#e88832'}]}>
                Terms of service
              </Text>
            </TouchableOpacity>
            <Text style={styles.color_textPrivate}> and </Text>
            <TouchableOpacity onPress={() => alert('Privacy clicked')}>
              <Text style={[styles.color_textPrivate, {color: '#e88832'}]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>

          <SocialButton
            buttonTitle="Sign in with facebook"
            btnType="logo-facebook"
            color="#4867aa"
            backgroundColor="#e6eaf4"
            onPress={() => {}}
          />

          <SocialButton
            buttonTitle="Sign in with google"
            btnType="logo-google"
            color="#de4d41"
            backgroundColor="#f5e7ea"
            onPress={() => {}}
          />

          <View style={styles.navButton}>
            <Text style={styles.text}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.navButtonText}>Sign In</Text>
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
    alignSelf: 'flex-start',
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
  textPrivate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 30,
    justifyContent: 'center',
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
  color_textPrivate: {
    fontSize: 13,
    fontWeight: '400',
    color: 'gray',
  },
});
