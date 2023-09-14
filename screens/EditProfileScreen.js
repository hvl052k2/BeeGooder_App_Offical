import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import { Container } from '../styles/FeedStyles';

export default EditProfileScreen = () => {
  const {user, logout} = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text>This is Edit profile screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
})