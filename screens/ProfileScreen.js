import React, {useContext, useState, useEffect} from 'react';
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

export default ProfileScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
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
      .add({
        userId: route.params.userId,
        // userName: userData.fname + ' ' + userData.lname,
        // userImg: userData.userImg,
      })
      .then(res => {
        console.log('followed successfully!');
      })
      .catch(err => {
        console.error('Error adding follow: ', err);
      });
  };

  const message = async () => {
    await firestore()
      .collection('follows')
      .doc(user.uid)
      .collection('chateds')
      .add({
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
      .add({
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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    navigation.addListener('focus', () => {
      getUser();
      fetchPosts();
      getCurrentUser();
      setDeleted(false);
    }); //cho phép refresh lại screen khi có thay đổi
  }, [deleted, navigation]);

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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
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
                  onPress={() => navigation.navigate('EditProfileScreen')}>
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
                        });
                    }}>
                    Message
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.userBtn} onPress={follow}>
                  <Text style={styles.userBtnTxt}>Follow</Text>
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
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{posts.length}</Text>
            <Text style={styles.userInfoSubTitle}>Posts</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>1M</Text>
            <Text style={styles.userInfoSubTitle}>Followers</Text>
          </View>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Following</Text>
          </View>
        </View>
        {posts.map(item => (
          <PostCard key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </ScrollView>
      {/* <FlatList
        data={posts}
        renderItem={({item}) => (
          <PostCard item={item} onDelete={handleDelete} />
        )}
        keyExtractor={item => item.id} // Mỗi item được phân biệt bởi id
        showsVerticalScrollIndicator={false}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
