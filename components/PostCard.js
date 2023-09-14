import React, {useContext} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../navigation/AuthProvider.android';
import moment from 'moment';
import ProgressiveImage from './ProgressiveImage';

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

  return (
    <Card>
      <UserInfo>
        <UserImg source={{uri: item.userImg}} />
        <UserInfoText>
          <TouchableOpacity onPress={onPress}>
            <UserName>{item.userName}</UserName>
          </TouchableOpacity>
          <PostTime>{moment(item.postTime.toDate()).fromNow()}</PostTime>
        </UserInfoText>
      </UserInfo>
      <PostText>{item.post}</PostText>
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
