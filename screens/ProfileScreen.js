import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import { Container } from '../styles/FeedStyles';

export default ProfileScreen = () => {
  const {user, logout} = useContext(AuthContext);
  return (
    <Container>
      <Text>This is ProfileScreen</Text>
      <FormButton buttonTitle="Logout" onPress={() => logout()} />
    </Container>
  );
};