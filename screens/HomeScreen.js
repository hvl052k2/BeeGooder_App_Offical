import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Alert, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../components/PostCard';
import {Container} from '../styles/FeedStyles';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

// const Posts = [
//   {
//     id: '1',
//     userName: 'Trang Nemo',
//     userImg: require('../assets/users/user-1.jpg'),
//     postTime: '4 mins ago',
//     post: 'This is caption test for a post',
//     postImg: require('../assets/posts/post-img-1.jpg'),
//     liked: true,
//     likes: '14',
//     comments: '12',
//   },
//   {
//     id: '2',
//     userName: 'Khá Bảnh',
//     userImg: require('../assets/users/user-2.jpg'),
//     postTime: '1 hour ago',
//     post: 'This is caption test for a post',
//     postImg: 'none',
//     liked: true,
//     likes: '100',
//     comments: '30',
//   },
//   {
//     id: '3',
//     userName: 'Huấn Hoa Hồng',
//     userImg: require('../assets/users/user-3.jpg'),
//     postTime: '4 hours ago',
//     post: 'This is caption test for a post',
//     postImg: require('../assets/posts/post-img-3.jpg'),
//     liked: false,
//     likes: '69',
//     comments: '40',
//   },
//   {
//     id: '4',
//     userName: 'Phú Lê',
//     userImg: require('../assets/users/user-4.jpg'),
//     postTime: '7 hours ago',
//     post: 'This is caption test for a post',
//     postImg: require('../assets/posts/post-img-4.jpg'),
//     liked: true,
//     likes: '1',
//     comments: '0',
//   },
//   {
//     id: '5',
//     userName: 'Hải Bánh',
//     userImg: require('../assets/users/user-5.jpg'),
//     postTime: '1 week ago',
//     post: 'This is caption test for a post',
//     postImg: 'none',
//     liked: false,
//     likes: '0',
//     comments: '0',
//   },
// ];

export default HomeScreen = () => {
  const [posts, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const fetchPosts = async () => {
    try {
      const list = [];
      await firestore()
        .collection('Posts', 'desc')
        .orderBy('postTime')
        .get()
        .then(querySnapshot => {
          console.log('Total posts: ', querySnapshot.size);

          querySnapshot.forEach(documentSnapshot => {
            // console.log(
            //   'User ID: ',
            //   documentSnapshot.id,
            //   documentSnapshot.data(),
            // );
            const {userId, post, postImg, postTime, likes, comments} =
              documentSnapshot.data();
            list.push({
              id: documentSnapshot.id,
              userId,
              userName: 'Test name',
              userImg:
                'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg',
              postTime: postTime,
              post,
              postImg,
              liked: false,
              likes,
              comments,
            });
          });
        });

      setPost(list);
      if (loading) {
        setLoading(false);
      }
      // console.log("Posts: ", list);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
    setDeleted(false);
  }, [deleted]);

  const handleDelete = postId => {
    Alert.alert(
      'Delete post',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancle Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => {
            deletePost(postId);
          },
        },
      ],
      {cancelable: false},
    );
  };

  const deletePost = postId => {
    console.log('Current post id: ', postId);
    firestore()
      .collection('Posts')
      .doc(postId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          const {postImg} = documentSnapshot.data();
          if (postImg != null) {
            const storageRef = storage().refFromURL(postImg);
            const imageRef = storage().ref(storageRef.fullPath);
            imageRef
              .delete()
              .then(() => {
                console.log(`${postImg} has been deleted successfuly!`);
                deleteFirestoreData(postId);
                setDeleted(true);
              })
              .catch(e => {
                console.log('Error while deleting the image: ', e);
              });
          } else {
            deleteFirestoreData(postId);
            setDeleted(true);
          }
        }
      });
  };

  const deleteFirestoreData = postId => {
    firestore()
      .collection('Posts')
      .doc(postId)
      .delete()
      .then(() => {
        console.log('Post deleted!');
        Alert.alert(
          'Post deleted!',
          'Your post has been deleted successfully!',
        );
      })
      .catch(e => {
        console.log('Error deleting post: ', e);
      });
  };

  const listHeader = () => {
    return null;
  };

  return (
    <Container>
      {loading ? (
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{alignItems: 'center'}}>
          <SkeletonPlaceholder borderRadius={4}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>

          <SkeletonPlaceholder borderRadius={4}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
              />
              <View
                style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}}
              />
            </View>
          </SkeletonPlaceholder>
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          renderItem={({item}) => (
            <PostCard item={item} onDelete={handleDelete} />
          )}
          keyExtractor={item => item.id} // Mỗi item được phân biệt bởi id
          ListHeaderComponent={listHeader}
          ListFooterComponent={listHeader}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
};
