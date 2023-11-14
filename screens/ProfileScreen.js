import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
  ImageBackground,
} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Container} from '../styles/FeedStyles';
import PostCard from '../components/PostCard';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useIsFocused} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import {windowHeight, windowWidth} from '../utils/Dimensions';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {
  Tabs,
  MaterialTabBar,
  MaterialTabItem,
} from 'react-native-collapsible-tab-view';

export default ProfileScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState([]);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [following, setFollowing] = useState([]);
  const [follower, setFollower] = useState([]);
  const [isFollowed, setIsFollowed] = useState(null);
  const isFocused = useIsFocused();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageShown, setImageShown] = useState('');
  const [favouriteList, setFavouriteList] = useState([]);
  const [totalLike, setTotalLike] = useState(0);

  const ref = useRef();

  // let followingList;
  // if (route.params) {
  //   followingList = route.params.followingList;
  // }

  const fetchPosts = async () => {
    try {
      const list = [];
      await firestore()
        .collection('Posts')
        .where('userId', '==', route.params ? route.params.userId : user.uid)
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

      total = list.reduce((total, post) => total + post.likes.length, 0);
      setTotalLike(total);
      setPosts(list);
      if (loading) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPostsLiked = async () => {
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
            if (likes.includes(route.params ? route.params.userId : user.uid)) {
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
            }
          });
        });
      setFavouriteList(list);
      if (loading) {
        setLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(route.params ? route.params.userId : user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          // console.log('User Data: ', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      });
  };

  const getCurrentUser = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          // console.log('User Data: ', documentSnapshot.data());
          setCurrentUserData(documentSnapshot.data());
        }
      });
  };

  const follow = async () => {
    await firestore()
      .collection('follows')
      .doc(user.uid)
      .collection('followings')
      .doc(route.params.userId)
      .set({
        userId: route.params.userId,
        // userName: userData.fname + ' ' + userData.lname,
        // userImg: userData.userImg,
      })
      .then(res => {
        console.log('add following successfully!');
      })
      .catch(err => {
        console.error('Error adding following: ', err);
      });

    await firestore()
      .collection('follows')
      .doc(route.params.userId)
      .collection('followers')
      .doc(user.uid)
      .set({
        userId: user.uid,
        // userName: userData.fname + ' ' + userData.lname,
        // userImg: userData.userImg,
      })
      .then(res => {
        console.log('add follower successfully!');
      })
      .catch(err => {
        console.error('Error adding follower: ', err);
      });
  };

  const message = async () => {
    await firestore()
      .collection('follows')
      .doc(user.uid)
      .collection('chateds')
      .doc(route.params.userId)
      .set({
        userId: route.params.userId,
        userName: userData.fname
          ? userData.fname + ' ' + userData.lname
          : 'New User',
        userImg: userData.userImg
          ? userData.userImg
          : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
      });

    await firestore()
      .collection('follows')
      .doc(route.params.userId)
      .collection('chateds')
      .doc(user.uid)
      .set({
        userId: user.uid,
        userName: currentUserData.fname
          ? currentUserData.fname + ' ' + currentUserData.lname
          : 'New User',
        userImg: currentUserData.userImg
          ? currentUserData.userImg
          : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
      })
      .then(res => {
        console.log('add chateds successfully!');
      })
      .catch(err => {
        console.error('Error adding chateds: ', err);
      });
  };

  const getFollowings = async () => {
    try {
      const list = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(route.params ? route.params.userId : user.uid)
        .collection('followings')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        list.push(documentSnapshot.data().userId);
      }

      setFollowing(list);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const getFollowers = async () => {
    try {
      await firestore()
        .collection('follows')
        .doc(route.params ? route.params.userId : user.uid)
        .collection('followers')
        .get()
        .then(querySnapshot => {
          setFollower(querySnapshot.size);
        });
    } catch (error) {
      console.error('Error getting follower:', error);
    }
  };

  const handleDelete = useCallback(postId => {
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
  }, []);

  const deletePost = postId => {
    // console.log('Current post id: ', postId);
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
                deleteFirestoreData('Posts', postId);
                setDeleted(true);
              })
              .catch(e => {
                console.log('Error while deleting the image: ', e);
              });
          } else {
            deleteFirestoreData('Posts', postId);
            setDeleted(true);
          }
        }
      });
  };

  const unFollow = () => {
    // console.log('Current post id: ', postId);
    firestore()
      .collection('follows')
      .doc(user.uid)
      .collection('followings')
      .doc(route.params.userId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          deleteFirestoreData_2_collection(
            'follows',
            'followings',
            user.uid,
            route.params.userId,
          );
        }
      });

    firestore()
      .collection('follows')
      .doc(route.params.userId)
      .collection('followers')
      .doc(user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          deleteFirestoreData_2_collection(
            'follows',
            'followers',
            route.params.userId,
            user.uid,
          );
        }
      });

    const index = route.params.followingList.indexOf(route.params.userId);
    if (index !== -1) {
      route.params.followingList.splice(index, 1);
    }
  };

  const deleteFirestoreData = (nameCollection, userId) => {
    firestore()
      .collection(nameCollection)
      .doc(userId)
      .delete()
      .then(() => {
        console.log(`${nameCollection} deleted!`);
        Alert.alert(
          `${nameCollection} deleted!`,
          `Your ${nameCollection} has been deleted successfully!`,
        );
      })
      .catch(e => {
        console.log(`Error deleting ${nameCollection}: `, e);
      });
  };

  const deleteFirestoreData_2_collection = (
    nameCollection1,
    nameCollection2,
    idDoc1,
    idDoc2,
  ) => {
    firestore()
      .collection(nameCollection1)
      .doc(idDoc1)
      .collection(nameCollection2)
      .doc(idDoc2)
      .delete()
      .then(() => {
        console.log(`${nameCollection2} deleted!`);
      })
      .catch(e => {
        console.log(`Error deleting ${nameCollection2}: `, e);
      });
  };

  const checkIsFollowed = () => {
    if (route.params.followingList.includes(route.params.userId)) {
      setIsFollowed(true);
    } else {
      setIsFollowed(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchPostsLiked();
    getFollowings();
    getFollowers();
    if (route.params) {
      checkIsFollowed();
    }
  }, []);

  useEffect(() => {
    getUser();
    fetchPosts();
    fetchPostsLiked();
    getCurrentUser();
    getFollowings();
    getFollowers();
    navigation.addListener('focus', () => {
      setLoading(!loading);
    });
    setDeleted(false);
  }, [deleted, navigation, loading]);

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
    if (ref.current.getCurrentIndex() == 1) {
      const updatedFavouriteList = favouriteList.map(item => {
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
      setFavouriteList(updatedFavouriteList);
    } else if (ref.current.getCurrentIndex() == 0) {
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
    }
    updatePost(post, 'like');
  };

  const disLike = post => {
    if (ref.current.getCurrentIndex() == 1) {
      const updatedFavouriteList = favouriteList.map(item => {
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
      setFavouriteList(updatedFavouriteList);
    } else if (ref.current.getCurrentIndex() == 0) {
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
    }
    updatePost(post, 'dislike');
  };

  const renderHeader = () => {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#fff', pointerEvents: 'box-none'}}>
        <Modal
          isVisible={isModalVisible}
          useNativeDriver={true}
          hideModalContentWhileAnimating={true}
          backdropOpacity={1}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}
          style={{margin: 0}}>
          <View style={{flex: 1}}>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
              }}
              style={styles.modal}>
              <Icon name="close-outline" size={40} color="#fff" />
            </TouchableOpacity>
            <ImageBackground
              source={{uri: imageShown}}
              style={{width: '100%', height: windowHeight}}
              resizeMode="contain"
            />
          </View>
        </Modal>
        <View style={styles.container}>
          <Image
            style={styles.userImg}
            source={{
              uri: userData
                ? userData.userImg ||
                  'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'
                : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
            }}
          />
          <Text style={styles.userName}>
            {userData ? userData.fname || 'Test' : 'Test'}{' '}
            {userData ? userData.lname || 'User' : 'User'}
          </Text>
          <Text>ID: {route.params ? route.params.userId : user.uid}</Text>
          <Text style={styles.aboutUser}>
            {userData ? userData.about || 'No details added.' : ''}
          </Text>
          <View style={styles.userBtnWrapper}>
            {route.params ? (
              route.params.userId == user.uid ? (
                <>
                  <TouchableOpacity
                    style={styles.userBtn}
                    onPress={() => navigation.push('EditProfileScreen')}>
                    <Text style={styles.userBtnTxt}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.userBtn} onPress={logout}>
                    <Text style={styles.userBtnTxt}>Logout</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                    <Text
                      style={styles.userBtnTxt}
                      onPress={() => {
                        message(),
                          navigation.navigate('Chat', {
                            userId: route.params.userId,
                            userName: userData
                              ? userData.fname
                                ? userData.fname + ' ' + userData.lname
                                : 'New User'
                              : 'New User',
                            userImg: userData.userImg
                              ? userData.userImg
                              : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
                          });
                      }}>
                      Message
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.userBtn}
                    onPress={() => {
                      if (isFollowed) {
                        unFollow();
                        setIsFollowed(false);
                      } else {
                        follow();
                        setIsFollowed(true);
                      }
                    }}>
                    {isFollowed ? (
                      <Icon name="people-outline" size={20} />
                    ) : (
                      <Text style={styles.userBtnTxt}>Follow</Text>
                    )}
                  </TouchableOpacity>
                </>
              )
            ) : (
              <>
                <TouchableOpacity
                  style={styles.userBtn}
                  onPress={() => navigation.navigate('EditProfileScreen')}>
                  <Text style={styles.userBtnTxt}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.userBtn} onPress={logout}>
                  <Text style={styles.userBtnTxt}>Logout</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.userInfoWrapper}>
            <TouchableOpacity
              style={styles.userInfoItem}
              onPress={() => {
                if (route.params) {
                  navigation.push('FriendsFollowersScreen', {
                    userId: route.params.userId,
                    followingList: following,
                  });
                } else {
                  navigation.push('FollowersScreen', {
                    userId: user.uid,
                    followingList: following,
                  });
                }
              }}>
              <Text style={styles.userInfoTitle}>{follower}</Text>
              <Text style={styles.userInfoSubTitle}>
                {follower.length > 1 ? 'Followers' : 'Follower'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userInfoItem}
              onPress={() => {
                if (route.params) {
                  navigation.push('FriendsFollowingsScreen', {
                    userId: route.params.userId,
                    followingList: following,
                  });
                } else {
                  navigation.push('FollowingsScreen', {
                    userId: user.uid,
                    followingList: following,
                  });
                }
              }}>
              <Text style={styles.userInfoTitle}>{following.length}</Text>
              <Text style={styles.userInfoSubTitle}>
                {following.length > 1 ? 'Followings' : 'Following'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userInfoItem}
              onPress={() => {
                Alert.alert(
                  'Congratulations!',
                  `${userData.fname} ${userData.lname} has received ${
                    totalLike > 1 ? totalLike + ' likes' : totalLike + ' like'
                  } in total posts`,
                );
              }}>
              <Text style={styles.userInfoTitle}>{totalLike}</Text>
              <Text style={styles.userInfoSubTitle}>Liked</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  };

  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        activeColor="#000"
        inactiveColor="gray"
        labelStyle={{fontWeight: 'bold'}}
        TabItemComponent={props => (
          <MaterialTabItem {...props} pressColor="#fff" />
        )}
      />
    );
  };

  return (
    <Tabs.Container
      renderHeader={renderHeader}
      renderTabBar={renderTabBar}
      ref={ref}>
      <Tabs.Tab
        name="Posts"
        label={
          posts.length > 1
            ? `${posts.length} Posts`
            : posts.length == 1
            ? '1 Post'
            : 'Post'
        }
        index={0}>
        <Tabs.FlatList
          data={posts}
          renderItem={({item}) => (
            <PostCard
              item={item}
              onDelete={handleDelete}
              currentUserData={currentUserData}
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
                  followingList: following
                });
              }}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          padding={10}
        />
      </Tabs.Tab>
      <Tabs.Tab
        name="Favourites"
        label={
          favouriteList.length > 1
            ? `${favouriteList.length} Favourites`
            : favouriteList.length == 1
            ? '1 Favourite'
            : 'Favourite'
        }
        index={1}>
        <Tabs.FlatList
          data={favouriteList}
          renderItem={({item}) => (
            <PostCard
              item={item}
              onDelete={handleDelete}
              currentUserData={currentUserData}
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
                  followingList: following,
                });
              }}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          padding={10}
        />
      </Tabs.Tab>
    </Tabs.Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    alignItems: 'center',
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    // marginVertical: 20,
    marginBottom: 10,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modal: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    lef: 0,
    top: 0,
    zIndex: 100,
  },
  postsTab: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    // alignItems: 'center',
  },
});
