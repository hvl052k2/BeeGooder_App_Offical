import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Container} from '../styles/FeedStyles';
import PostCard from '../components/PostCard';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useIsFocused} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {run} from 'jest';

export default ProfileScreen = React.memo(({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [following, setFollowing] = useState([]);
  const [follower, setFollower] = useState([]);
  const [isFollowed, setIsFollowed] = useState(null);
  const isFocused = useIsFocused();

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

      setPosts(list);
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
    getFollowings();
    getFollowers();
    if (route.params) {
      checkIsFollowed();
    }
  }, []);

  useEffect(() => {
    getUser();
    fetchPosts();
    getCurrentUser();
    getFollowings();
    getFollowers();
    navigation.addListener('focus', () => {
      setLoading(!loading);
    });
    setDeleted(false);
  }, [deleted, navigation, loading]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
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
        <Text>{route.params ? route.params.userId : user.uid}</Text>
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
          <TouchableOpacity style={styles.userInfoItem} disabled={true}>
            <Text style={styles.userInfoTitle}>{posts.length}</Text>
            <Text style={styles.userInfoSubTitle}>
              {posts.length > 1 ? 'Posts' : 'Post'}
            </Text>
          </TouchableOpacity>

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

          <TouchableOpacity style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>1B</Text>
            <Text style={styles.userInfoSubTitle}>Liked</Text>
          </TouchableOpacity>
        </View>
        {posts.map(item => (
          <PostCard
            key={item.id}
            item={item}
            currentUserData={currentUserData}
            onDelete={handleDelete}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
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
    marginVertical: 20,
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
});
