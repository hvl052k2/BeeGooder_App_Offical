import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';
import SocialButton from '../components/SocialButton';
import {useState, useContext} from 'react';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import auth from '@react-native-firebase/auth';

export default ForgetPasswordScreen = ({navigation}) => {
  const {forgetPassword} = useContext(AuthContext);

  const SignupSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .required('Please enter your email.'),
  });

  //   const actionCode = async () => {
  //     await auth().currentUser.sendEmailVerification({
  //         handleCodeInApp: true,
  //       //   url: 'app/email-verification',
  //       });
  //   };

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      validationSchema={SignupSchema}
      onSubmit={values => forgetPassword(values.email)}>
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

          <View style={styles.image}>
            <Image
              style={{width: 150, height: 200}}
              resizeMode="contain"
              source={require('../assets/images/forget_password.png')}></Image>
            <Text style={styles.title}>FORGOT PASSWORD?</Text>
          </View>

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

          <FormButton
            buttonTitle="Submit"
            disabled={isValid}
            onPress={handleSubmit}
          />
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
  image: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  errorTxt: {
    color: 'red',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 40,
    color: 'purple',
    fontWeight: '600',
    letterSpacing: 1.2,
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
