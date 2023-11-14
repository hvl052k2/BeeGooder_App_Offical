import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../components/PostCard';
import {Container} from '../styles/FeedStyles';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {AuthContext} from '../navigation/AuthProvider.android';
import {useIsFocused} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {windowHeight, windowWidth} from '../utils/Dimensions';

export default HomeScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageShown, setImageShown] = useState('');
  const isFocused = useIsFocused();

  const getFollowingList = useCallback(async () => {
    try {
      const list = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(user.uid)
        .collection('followings')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        list.push(documentSnapshot.data().userId);
      }
      setFollowingList(list);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const list = [];
      await firestore()
        .collection('Posts')
        .orderBy('postTime', 'desc')
        .get()
        .then(querySnapshot => {
          // console.log('Total posts: ', querySnapshot.size);

          querySnapshot.forEach(documentSnapshot => {
            const {userId, post, postImg, postTime, likes, comments} =
              documentSnapshot.data();
            list.push({
              id: documentSnapshot.id,
              userId,
              // userName: 'Test name',
              userImg:
                'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg',
              postTime: postTime,
              post,
              postImg,
              liked: likes.includes(user.uid),
              likes: likes,
              comments,
            });
          });
        });

      setPosts(list);
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
    getFollowingList();
  }, []);

  useEffect(() => {
    getFollowingList();
  }, [isFocused]);

  useEffect(() => {
    setDeleted(false);
    fetchPosts();
  }, [deleted]);

  useEffect(() => {
    navigation.addListener('focus', () => {
      fetchPosts();
    });
    navigation.addListener('state', ()=>{
      fetchPosts();
    })
  }, [navigation]);

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

  const deletePost = async postId => {
    console.log('post id was deleted: ', postId);
    await firestore()
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

  const listFooter = () => {
    return null;
  };

  const updatePost = async (post, command) => {
    await firestore()
      .collection('Posts')
      .doc(post.id)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          let likes;
          const likeList = documentSnapshot.data().likes;
          if (command == 'like') {
            if (!likeList.includes(user.uid)) {
              likeList.push(user.uid);
              likes = likeList;
            }
          } else {
            likes = likeList.filter(item => item != user.uid);
          }
          firestore()
            .collection('Posts')
            .doc(post.id)
            .update({
              likes: likes,
            })
            .then(() => {
              console.log('post updated!');
            });
        }
      });
  };

  const onLike = post => {
    const updatedPosts = posts.map(item => {
      if (item.id === post.id) {
        const likeList = item.likes;
        if (!likeList.includes(user.uid)) {
          likeList.push(user.uid);
        }
        return {
          ...item,
          liked: !item.liked,
          likes: likeList,
        };
      }
      return item;
    });
    setPosts(updatedPosts);
    updatePost(post, 'like');
  };

  const disLike = post => {
    const updatedPosts = posts.map(item => {
      if (item.id === post.id) {
        const likeList = item.likes;
        return {
          ...item,
          liked: !item.liked,
          likes: likeList.filter(item => item != user.uid),
        };
      }
      return item;
    });
    setPosts(updatedPosts);
    updatePost(post, 'dislike');
  };

  return (
    <Container>
      <Modal
        isVisible={isModalVisible}
        hideModalContentWhileAnimating={true}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}
        useNativeDriver={true}
        backdropOpacity={1}
        style={{margin: 0}}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            onPress={() => {
              setIsModalVisible(false);
            }}
            style={styles.btnCloseModal}>
            <Icon name="close-outline" size={40} color="#fff" />
          </TouchableOpacity>
          <ImageBackground
            source={{uri: imageShown}}
            style={{width: '100%', height: windowHeight}}
            resizeMode="contain"
          />
        </View>
      </Modal>

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
                  style={{
                    marginTop: 6,
                    width: 80,
                    height: 20,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{
                  marginTop: 6,
                  width: 250,
                  height: 20,
                  borderRadius: 4,
                }}
              />
              <View
                style={{
                  marginTop: 6,
                  width: 350,
                  height: 200,
                  borderRadius: 4,
                }}
              />
            </View>
          </SkeletonPlaceholder>

          <SkeletonPlaceholder borderRadius={4}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 60, height: 60, borderRadius: 50}} />
              <View style={{marginLeft: 20}}>
                <View style={{width: 120, height: 20, borderRadius: 4}} />
                <View
                  style={{
                    marginTop: 6,
                    width: 80,
                    height: 20,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
            <View style={{marginTop: 10, marginBottom: 30}}>
              <View style={{width: 300, height: 20, borderRadius: 4}} />
              <View
                style={{
                  marginTop: 6,
                  width: 250,
                  height: 20,
                  borderRadius: 4,
                }}
              />
              <View
                style={{
                  marginTop: 6,
                  width: 350,
                  height: 200,
                  borderRadius: 4,
                }}
              />
            </View>
          </SkeletonPlaceholder>
        </ScrollView>
      ) : (
        <FlatList
          data={posts}
          renderItem={({item}) => (
            <PostCard
              item={item}
              onDelete={handleDelete}
              onShowImage={() => {
                setIsModalVisible(true);
                setImageShown(item.postImg);
              }}
              onLike={() => {
                if (item.liked) {
                  console.log('dislike');
                  disLike(item);
                } else {
                  console.log('like');
                  onLike(item);
                }
              }}
              onComment={() => {
                navigation.push('CommentsScreen', {
                  item: item,
                });
              }}
              onPress={() =>
                navigation.navigate('HomeProfile', {
                  userId: item.userId,
                  followingList: followingList,
                })
              }
            />
          )}
          keyExtractor={item => item.id} // Mỗi item được phân biệt bởi id
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  btnCloseModal: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    lef: 0,
    top: 0,
    zIndex: 100,
  },
  cmtInput: {
    backgroundColor: '#fff',
    flex: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    borderWidth: 0.5,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  cmtField: {
    // backgroundColor: 'pink',
    // justifyContent: 'flex-end',
    height: 80,
    paddingHorizontal: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
  },
  contentContainer: {
    backgroundColor: '#fff',
  },
  input: {
    width: '90%',
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
  footerContainer: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#80f',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
});
