import React, {useContext} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../components/PostCard';

import {Container} from '../styles/FeedStyles';

const Posts = [
  {
    id: '1',
    userName: 'Trang Nemo',
    userImg: require('../assets/users/user-1.jpg'),
    postTime: '4 mins ago',
    post: 'This is caption test for a post',
    postImg: require('../assets/posts/post-img-1.jpg'),
    liked: true,
    likes: '14',
    comments: '12',
  },
  {
    id: '2',
    userName: 'Khá Bảnh',
    userImg: require('../assets/users/user-2.jpg'),
    postTime: '1 hour ago',
    post: 'This is caption test for a post',
    postImg: 'none',
    liked: true,
    likes: '100',
    comments: '30',
  },
  {
    id: '3',
    userName: 'Huấn Hoa Hồng',
    userImg: require('../assets/users/user-3.jpg'),
    postTime: '4 hours ago',
    post: 'This is caption test for a post',
    postImg: require('../assets/posts/post-img-3.jpg'),
    liked: false,
    likes: '69',
    comments: '40',
  },
  {
    id: '4',
    userName: 'Phú Lê',
    userImg: require('../assets/users/user-4.jpg'),
    postTime: '7 hours ago',
    post: 'This is caption test for a post',
    postImg: require('../assets/posts/post-img-4.jpg'),
    liked: true,
    likes: '1',
    comments: '0',
  },
  {
    id: '5',
    userName: 'Hải Bánh',
    userImg: require('../assets/users/user-5.jpg'),
    postTime: '1 week ago',
    post: 'This is caption test for a post',
    postImg: 'none',
    liked: false,
    likes: '0',
    comments: '0',
  },
];

export default HomeScreen = () => {
  return (
    <Container>
      <FlatList
        data={Posts}
        renderItem={({item}) => <PostCard item={item} />}
        keyExtractor={item=>item.id}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
};
