import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import { Container } from '../styles/FeedStyles';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default ChatScreen = () => {
  const {user, logout} = useContext(AuthContext);
  return (
    <Container>
    </Container>
  );
};