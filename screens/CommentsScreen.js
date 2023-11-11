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
  Keyboard,
  ActivityIndicator,
} from 'react-native';

import {
  Container,
  CommentCard,
  UserImage,
  ContentWarapper,
  UserName,
  CommentText,
  CommentContainerWrapper,
  CommentInputField,
  CommentTime,
} from '../styles/CommentStyles';

import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../components/PostCard';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {AuthContext} from '../navigation/AuthProvider.android';
import {useIsFocused} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {windowHeight, windowWidth} from '../utils/Dimensions';
import moment from 'moment';

export default CommentsScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageShown, setImageShown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(route.params.item);

  const commentInputRef = useRef();
  useEffect(() => {
    getUser();
    fetchComments();
    getPostName();

    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        commentInputRef.current.blur();
      },
    );
    return () => {
      keyboardDidHideSubscription?.remove();
    };
  }, []);

  const fetchComments = async () => {
    const documentSnapshot = await firestore()
      .collection('Posts')
      .doc(post.id)
      .get();

    const comments = documentSnapshot.data().comments;
    if (comments.length != 0) {
      const list = [];
      for (let i = 0; i < comments.length; i++) {
        await firestore()
          .collection('users')
          .doc(comments[i].userId)
          .get()
          .then(snapShot => {
            const {fname, lname, userImg} = snapShot.data();
            list.push({
              id: i,
              userId: comments[i].userId,
              userName: `${fname} ${lname}`,
              userImg: userImg,
              commentText: comments[i].commentText,
              commentTime: comments[i].commentTime,
            });
          });
      }
      // Sắp xếp post của bạn lên đầu để dễ quan sát
      list.sort((a, b) => {
        if (a.userId === user.uid && b.userId !== user.uid) {
          return -1;
        } else if (a.userId !== user.uid && b.userId === user.uid) {
          return 1;
        } else {
          return 0;
        }
      });
      setCommentList(list);
    }
    setIsLoading(false);
  };

  const updatePostComment = async post => {
    await firestore()
      .collection('Posts')
      .doc(post.id)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          const comments = documentSnapshot.data().comments;
          comments.push({
            userId: user.uid,
            commentText: commentText,
            commentTime: firestore.Timestamp.fromDate(new Date()),
          });

          firestore()
            .collection('Posts')
            .doc(post.id)
            .update({
              comments: comments,
            })
            .then(() => {
              console.log('cmt post updated!');
            });
        }
      });
  };

  const onAddComment = post => {
    setCommentList([
      ...commentList,
      {
        id: commentList.length + 1,
        userId: user.uid,
        userName: `${userData.fname} ${userData.lname}`,
        userImg: userData.userImg,
        commentText: commentText,
        commentTime: firestore.Timestamp.fromDate(new Date()),
      },
    ]);
    setPost({
      ...post,
      comments: [
        ...post.comments,
        {
          userId: user.uid,
          commentText: commentText,
          commentTime: firestore.Timestamp.fromDate(new Date()),
        },
      ],
    });
    updatePostComment(post);
  };

  const getUser = async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          setUserData(documentSnapshot.data());
        }
      });
  };

  const getPostName = async () => {
    await firestore()
      .collection('users')
      .doc(post.userId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          const {fname, lname} = documentSnapshot.data();
          navigation.setOptions({
            headerTitle: `This is ${fname} ${lname}'s post`,
          });
        }
      });
  };

  const updatePostLike = async (post, command) => {
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
              console.log('like post updated!');
            });
        }
      });
  };

  const onLike = post => {
    if (!post.likes.includes(user.uid)) {
      const likeList = post.likes;
      likeList.push(user.uid);
      setPost({
        ...post,
        liked: !post.liked,
        likes: likeList,
      });
    }
    updatePostLike(post, 'like');
  };

  const disLike = post => {
    const likeList = post.likes;
    setPost({
      ...post,
      liked: !post.liked,
      likes: likeList.filter(item => item != user.uid),
    });
    updatePostLike(post, 'dislike');
  };

  // detele post
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
            navigation.goBack();
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
                // setDeleted(true);
              })
              .catch(e => {
                console.log('Error while deleting the image: ', e);
              });
          } else {
            deleteFirestoreData(postId);
            // setDeleted(true);
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <PostCard
          item={post}
          onDelete={handleDelete}
          onComment={() => {
            commentInputRef.current.focus();
          }}
          onShowImage={() => {
            setIsModalVisible(true);
            setImageShown(post.postImg);
          }}
          onLike={() => {
            if (post.liked) {
              console.log('dislike');
              disLike(post);
            } else {
              console.log('like');
              onLike(post);
            }
          }}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#5500dc" />
        ) : (
          commentList.map(item => (
            <CommentCard key={item.id}>
              <UserImage source={{uri: item.userImg}} />
              <ContentWarapper>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <UserName>{item.userName}</UserName>
                  <Icon name="time-outline" />
                  <CommentTime>
                    {moment(item.commentTime.toDate()).fromNow()}
                  </CommentTime>
                </View>
                <CommentText>{item.commentText}</CommentText>
              </ContentWarapper>
            </CommentCard>
          ))
        )}
      </ScrollView>
      <CommentContainerWrapper>
        <CommentInputField
          ref={commentInputRef}
          placeholder="Type your comment ..."
          placeholderTextColor="#ccc"
          multiline={true}
          value={commentText}
          onChangeText={text => setCommentText(text)}
        />
        <TouchableOpacity
          onPress={() => {
            if (commentText != '') {
              onAddComment(route.params.item);
              commentInputRef.current.blur();
              setCommentText('');
            }
          }}>
          <Icon name="send" size={30} color="#2e64e5" />
        </TouchableOpacity>
      </CommentContainerWrapper>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
});
