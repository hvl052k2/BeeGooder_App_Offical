import React, {useContext, useState, useEffect} from 'react';
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
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
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
} from '../styles/FollowingStyles';

export default FolowingsScreen = ({navigation, route}) => {
  const {user} = useContext(AuthContext);
  const [followings, setFollowings] = useState([]);

  const isFocused = useIsFocused();

  const fetchFollowings = async () => {
    try {
      const list = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(route.params ? route.params.userId : user.uid)
        .collection('followings')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        const userId = documentSnapshot.data().userId;
        const snapShot = await firestore()
          .collection('users')
          .doc(userId)
          .get();
        const {fname, lname, userImg} = snapShot.data();

        list.push({
          userId: snapShot.id,
          userName: fname ? `${fname} ${lname}` : 'New User',
          userImg: userImg
            ? userImg
            : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
        });
      }

      setFollowings(list);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // useEffect(() => {
  //   fetchFriends();
  // }, [isFocused]);

  useEffect(() => {
    fetchFollowings();
  }, []);

  // console.log("route",route)
  return (
    <Container>
      <FlatList
        data={followings}
        renderItem={({item}) => (
          <Card
            onPress={() =>
              navigation.navigate('FriendProfileScreen', {
                userId: item.userId,
                userName: item.userName,
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
    // justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
