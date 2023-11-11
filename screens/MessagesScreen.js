import React, {useContext, useState, useEffect, useCallback} from 'react';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ChatScreen from './ChatScreen';
import {useIsFocused} from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';

import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  TextSection,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
} from '../styles/MessageStyles';

export default MessagesScreen = ({navigation, route}) => {
  const {user} = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchMessages();
  }, [isFocused]);

  const fetchMessages = async () => {
    try {
      const list = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(user.uid)
        .collection('chateds')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        const userId = documentSnapshot.data().userId;
        await firestore()
          .collection('users')
          .doc(userId)
          .get()
          .then(async inforSnapShot => {
            const {fname, lname, userImg} = inforSnapShot.data();
            await firestore()
              .collection('chats')
              .doc(user.uid + userId)
              .collection('messages')
              .orderBy('createdAt', 'desc')
              .get()
              .then(querySnapshot => {
                list.push({
                  userId: inforSnapShot.id,
                  userName: fname ? `${fname} ${lname}` : 'New User',
                  userImg: userImg
                    ? userImg
                    : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
                  messageText: querySnapshot.docs[0].data().text,
                });
              });
          });
      }
      setMessages(list);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <Container>
      <FlatList
        data={messages}
        renderItem={({item}) => (
          <Card
            onPress={() =>
              navigation.navigate('ChatScreen', {
                userId: item.userId,
                userName: item.userName,
                userImg: item.userImg,
              })
            }>
            <UserInfo>
              <UserImgWrapper>
                <UserImg source={{uri: item.userImg}} />
              </UserImgWrapper>
              <TextSection>
                <UserInfoText>
                  <UserName>{item.userName} </UserName>
                  {/* <PostTime>{item.messageTime}</PostTime> */}
                </UserInfoText>
                {/* <MessageText>{item.messageText}</MessageText> */}
                <MessageText numberOfLines={1} ellipsizeMode="tail">
                  {item.messageText}
                </MessageText>
              </TextSection>
            </UserInfo>
          </Card>
        )}
        keyExtractor={item => item.userId}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
