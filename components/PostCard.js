import React, {useContext, useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../navigation/AuthProvider.android';
import moment from 'moment';
import ProgressiveImage from './ProgressiveImage';
import firestore from '@react-native-firebase/firestore';

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
} from '../styles/FeedStyles';
import {TouchableOpacity} from 'react-native';

const PostCard = ({item, onDelete, onPress}) => {
  const {user, logout} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  likeIcon = item.liked ? 'heart' : 'heart-outline';
  likeIconColor = item.liked ? '#2e64e5' : '#333';

  if (item.likes == 1) {
    likeText = '1 Like';
  } else if (item.likes > 1) {
    likeText = item.likes + ' Likes';
  } else {
    likeText = 'Like';
  }

  if (item.comments == 1) {
    commentText = '1 Comment';
  } else if (item.comments > 1) {
    commentText = item.comments + ' Comments';
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
  }, []);

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
      </UserInfo>
      {item.post != null ? <PostText>{item.post}</PostText> : null}
      {/* {item.postImg != null ? (
        <PostImg source={{uri: item.postImg}} />
      ) : (
        <Devider />
      )} */}
      {item.postImg != null ? (
        <ProgressiveImage
          defaultImageSource={require('../assets/images/imageLoading.png')}
          source={{uri: item.postImg}}
          style={{width: '100%', height: 250}}
          resizeMode="cover"
        />
      ) : (
        <Devider />
      )}
      <InteractionWrapper>
        <Interaction active={item.liked}>
          <Icon name={likeIcon} size={25} color={likeIconColor} />
          <InteractionText active={item.liked}>{likeText}</InteractionText>
        </Interaction>
        <Interaction>
          <Icon name="chatbubble-outline" size={25} />
          <InteractionText>{commentText}</InteractionText>
        </Interaction>
        {user.uid == item.userId ? (
          <Interaction
            onPress={() => {
              onDelete(item.id);
            }}>
            <Icon name="trash-outline" size={25} />
          </Interaction>
        ) : null}
      </InteractionWrapper>
    </Card>
  );
};

export default PostCard;
