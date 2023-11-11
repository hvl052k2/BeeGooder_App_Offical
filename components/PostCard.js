import React, {useContext, useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../navigation/AuthProvider.android';
import moment from 'moment';
import ProgressiveImage from './ProgressiveImage';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

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
  UserImg,
  UserInfo,
  UserName,
  UserInfoText,
  PostTime,
  PostText,
  PostImg,
  InteractionWrapper,
  Interaction,
  InteractionText,
  Devider,
  FloatFunctionContainer,
  FloatFunctionButton,
  FloatFunctionText,
} from '../styles/FeedStyles';

const PostCard = ({
  item,
  onDelete,
  onPress,
  currentUserData,
  onShowImage,
  onLike,
  onComment
}) => {
  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [showFloatContainer, setShowFloatContainer] = useState(false);

  const navigation = useNavigation();

  likeIcon = item.liked ? 'heart' : 'heart-outline';
  likeIconColor = item.liked ? '#e73b54' : '#333';

  if (item.likes.length == 1) {
    likeText = '1 Like';
  } else if (item.likes.length > 1) {
    likeText = item.likes.length + ' Likes';
  } else {
    likeText = 'Like';
  }

  if (item.comments.length == 1) {
    commentText = '1 Comment';
  } else if (item.comments.length > 1) {
    commentText = item.comments.length + ' Comments';
  } else {
    commentText = 'Comment';
  }

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(item.userId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          // console.log('User Data: ', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      });
  };

  useEffect(() => {
    getUser();
    // console.log(`Name of user: ${userData.fname} ${userData.lname}`);
  }, [currentUserData]);

  // useEffect(() => {
  //   getUser();
  //   console.log(`Name of user: ${userData.fname} ${userData.lname}`);
  // }, [userData]);

  return (
    <Card>
      <UserInfo>
        <TouchableOpacity onPress={onPress}>
          <UserImg
            source={{
              uri: userData
                ? userData.userImg ||
                  'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
                : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
            }}
          />
        </TouchableOpacity>
        <UserInfoText>
          <TouchableOpacity onPress={onPress}>
            <UserName>
              {userData ? userData.fname || 'Test' : 'Test'}{' '}
              {userData ? userData.lname || 'User' : 'User'}
            </UserName>
          </TouchableOpacity>
          <PostTime>{moment(item.postTime.toDate()).fromNow()}</PostTime>
        </UserInfoText>
        <View style={{position: 'absolute', right: 0, top: 5}}>
          <TouchableOpacity
            onPress={() => {
              setShowFloatContainer(!showFloatContainer);
            }}>
            <Icon
              name={
                showFloatContainer
                  ? 'ellipsis-vertical'
                  : 'ellipsis-vertical-outline'
              }
              size={25}
              color={showFloatContainer ? '#2e64e5' : 'gray'}
            />
          </TouchableOpacity>
          {showFloatContainer ? (
            <FloatFunctionContainer>
              {user.uid == item.userId ? (
                <FloatFunctionButton
                  onPress={() => {
                    onDelete(item.id);
                  }}>
                  <FloatFunctionText>Delete</FloatFunctionText>
                </FloatFunctionButton>
              ) : null}

              <FloatFunctionButton>
                <FloatFunctionText>Save</FloatFunctionText>
              </FloatFunctionButton>
              <FloatFunctionButton>
                <FloatFunctionText>Another...</FloatFunctionText>
              </FloatFunctionButton>
            </FloatFunctionContainer>
          ) : null}
        </View>
      </UserInfo>
      {item.post != null ? <PostText>{item.post}</PostText> : null}
      {item.postImg != null ? (
        <TouchableOpacity
          onPress={() => {
            onShowImage();
          }}>
          <ProgressiveImage
            defaultImageSource={require('../assets/images/imageLoading.png')}
            source={{uri: item.postImg}}
            style={{width: '100%', height: 250}}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : (
        <Devider />
      )}
      <InteractionWrapper>
        <Interaction active={item.liked} onPress={onLike}>
          <Icon name={likeIcon} size={25} color={likeIconColor} />
          <InteractionText active={item.liked}>{likeText}</InteractionText>
        </Interaction>
        <Interaction
          onPress={onComment}>
          <Icon name="chatbubble-outline" size={25} />
          <InteractionText>{commentText}</InteractionText>
        </Interaction>
        <Interaction>
          <Icon name="arrow-redo-outline" size={27} />
          <InteractionText>Share</InteractionText>
        </Interaction>
      </InteractionWrapper>
    </Card>
  );
};

export default PostCard;
