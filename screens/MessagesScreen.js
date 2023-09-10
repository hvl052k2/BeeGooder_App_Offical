import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import { Container } from '../styles/FeedStyles';

export default MessagesScreen = () => {
  const {user, logout} = useContext(AuthContext);
  return (
    <Container>
      <Text>This is MessagesScreen</Text>
      {/* <FormButton buttonTitle="Logout" onPress={() => logout()} /> */}
    </Container>
  );
};