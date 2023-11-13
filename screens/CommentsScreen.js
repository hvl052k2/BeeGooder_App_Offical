import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useId,
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
  UserImageReply,
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
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';

export default CommentsScreen = ({navigation, route}) => {
  const {user, logout} = useContext(AuthContext);
  const [commentText, setCommentText] = useState('');
  // const [commentTextReply, setCommentTextReply] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [userData, setUserData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageShown, setImageShown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(route.params.item);
  const [commentSelected, setCommentSelected] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [cmtId, setCmtId] = useState(null);

  const id = useId();

  const commentInputRef = useRef();

  useEffect(() => {
    getUser();
    fetchComments();
    getPostName();
    generateId();
    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        commentInputRef.current.blur();
        setReplyTo(null);
      },
    );
    return () => {
      keyboardDidHideSubscription?.remove();
    };
  }, []);

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
          .then(async snapShot => {
            const {fname, lname, userImg} = snapShot.data();
            const listReply = [];
            for (let j = 0; j < comments[i].commentReplies.length; j++) {
              await firestore()
                .collection('users')
                .doc(comments[i].commentReplies[j].userId)
                .get()
                .then(async snapShot => {
                  const {fname, lname, userImg} = snapShot.data();

                  const sendToUserData = (
                    await firestore()
                      .collection('users')
                      .doc(comments[i].commentReplies[j].sendTo)
                      .get()
                  ).data();
                  const sendToUserfname = sendToUserData.fname;
                  const sendToUserlname = sendToUserData.lname;

                  listReply.push({
                    id: comments[i].commentReplies[j].id,
                    userId: comments[i].commentReplies[j].userId,
                    userName: `${fname} ${lname}`,
                    sendToUserName: `${sendToUserfname} ${sendToUserlname}`,
                    userImg: userImg,
                    commentText: comments[i].commentReplies[j].commentText,
                    commentTime: comments[i].commentReplies[j].commentTime,
                  });
                });
            }

            list.push({
              id: comments[i].id,
              userId: comments[i].userId,
              userName: `${fname} ${lname}`,
              userImg: userImg,
              commentText: comments[i].commentText,
              commentTime: comments[i].commentTime,
              commentReplies: listReply,
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
      // console.log(list);
      setCommentList(list);
    }
    setIsLoading(false);
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

  const generateId = () => {
    const idRandom = id + Math.floor(Math.random() * 1000000001);
    setCmtId(idRandom);
  };

  // Cập nhật comment trên firebase
  const updatePostComment = async (post, command) => {
    await firestore()
      .collection('Posts')
      .doc(post.id)
      .get()
      .then(async documentSnapshot => {
        if (documentSnapshot.exists) {
          const comments = documentSnapshot.data().comments;

          if (command == 'addComment') {
            comments.push({
              id: cmtId,
              userId: user.uid,
              commentText: commentText,
              commentTime: firestore.Timestamp.fromDate(new Date()),
              commentReplies: [],
            });
          }

          if (command == 'deleteComment') {
            const indexToRemove = comments.findIndex(
              item => item.id === commentSelected.id,
            );
            if (indexToRemove !== -1) {
              comments.splice(indexToRemove, 1);
            }
          }

          if (command == 'addCommentReply') {
            const commentToChange = comments.find(
              item => item.id === commentSelected.id,
            );

            // console.log('commentToChange: ', commentToChange);
            commentToChange.commentReplies.push({
              id: cmtId,
              userId: user.uid,
              commentText: commentText,
              commentTime: firestore.Timestamp.fromDate(new Date()),
              sendBy: user.uid,
              sendTo: commentSelected.userId,
            });
          }

          await firestore()
            .collection('Posts')
            .doc(post.id)
            .update({
              comments: comments,
            })
            .then(() => {
              console.log(`${command} cmt post updated!`);
            });
        }
      });
  };

  // Hàm thêm comment
  const onAddComment = post => {
    setCommentList([
      ...commentList,
      {
        id: cmtId,
        userId: user.uid,
        userName: `${userData.fname} ${userData.lname}`,
        userImg: userData.userImg,
        commentText: commentText,
        commentTime: firestore.Timestamp.fromDate(new Date()),
        commentReplies: [],
      },
    ]);
    setPost({
      ...post,
      comments: [
        ...post.comments,
        {
          id: cmtId,
          userId: user.uid,
          commentText: commentText,
          commentTime: firestore.Timestamp.fromDate(new Date()),
          commentReplies: [],
        },
      ],
    });
    updatePostComment(post, 'addComment');
  };

  const onAddCommentReply = post => {
    // cập nhật setCommentList
    const commentToChange = commentList.find(item => item.id === replyTo.id);
    if (commentToChange) {
      commentToChange.commentReplies.push({
        id: cmtId,
        userId: user.uid,
        userName: `${userData.fname} ${userData.lname}`,
        userImg: userData.userImg,
        commentText: commentText,
        commentTime: firestore.Timestamp.fromDate(new Date()),
        sendToUserName: commentSelected.userName,
      });
    }

    // cập nhật setPost
    const commentReplyToChange = post.comments.find(
      item => item.id === replyTo.id,
    );
    commentReplyToChange.commentReplies.push({
      id: cmtId,
      userId: user.uid,
      commentText: commentText,
      commentTime: firestore.Timestamp.fromDate(new Date()),
    });
    updatePostComment(post, 'addCommentReply');
  };

  const onDeleteComment = post => {
    const tempt_1 = commentList.filter(item => item.id !== commentSelected.id);
    setCommentList(tempt_1);

    const tempt_2 = post.comments.filter(
      item => item.id !== commentSelected.id,
    );

    setPost({...post, comments: tempt_2});

    updatePostComment(post, 'deleteComment');
  };

  const handleDeleteComment = post => {
    Alert.alert(
      'Delete comment',
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
            onDeleteComment(post);
          },
        },
      ],
      {cancelable: false},
    );
  };

  // Cập nhật số lượng like của post
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

  // Hàm like
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

  // Hàm dislike
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

  // Hàm xóa post ảnh, sau đó xóa post
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

  // Hàm xóa post trên firebase
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

  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ['25%'], []);

  const backdropComponent = props => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
  );

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
            <View key={item.id}>
              <CommentCard
                onLongPress={() => {
                  bottomSheetRef.current.snapToIndex(0);
                  setCommentSelected(item);
                }}
                onPress={() => {
                  commentInputRef.current.focus();
                  setCommentSelected(item);
                  setReplyTo(item);
                  console.log('ReplyId: ', item.id);
                }}>
                <UserImage source={{uri: item.userImg}} />
                <ContentWarapper>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <UserName>{item.userName}</UserName>
                  </View>
                  <CommentText>{item.commentText}</CommentText>
                  <View style={{flexDirection: 'row', marginTop: 5}}>
                    <Icon name="time-outline" />
                    <CommentTime>
                      {moment(item.commentTime.toDate()).fromNow()}
                    </CommentTime>
                  </View>
                </ContentWarapper>
              </CommentCard>

              {item.commentReplies.map(item => (
                <View style={{paddingLeft: 20}} key={item.id}>
                  <CommentCard
                    onLongPress={() => {
                      bottomSheetRef.current.snapToIndex(0);
                      setCommentSelected(item);
                    }}
                    onPress={() => {
                      commentInputRef.current.focus();
                      setReplyTo(item);
                      console.log('ReplyId in Reply: ', item.id);
                    }}>
                    <UserImageReply source={{uri: item.userImg}} />
                    <ContentWarapper>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <UserName>{item.userName}</UserName>
                        <Icon
                          name="caret-forward"
                          color="#ccc"
                          style={{marginHorizontal: 4}}
                        />
                        <UserName>{item.sendToUserName}</UserName>
                      </View>
                      <CommentText>{item.commentText}</CommentText>
                      <View style={{flexDirection: 'row', marginTop: 5}}>
                        <Icon name="time-outline" />
                        <CommentTime>
                          {moment(item.commentTime.toDate()).fromNow()}
                        </CommentTime>
                      </View>
                    </ContentWarapper>
                  </CommentCard>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <CommentContainerWrapper>
        {replyTo != null ? (
          <View style={{marginBottom: 10}}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
              }}>
              Replying to {replyTo.userName}
            </Text>
            <Text>{replyTo.commentText}</Text>
          </View>
        ) : null}

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
              if (replyTo != null) {
                if (commentText != '') {
                  onAddCommentReply(post);
                  generateId();
                  commentInputRef.current.blur();
                  setCommentText('');
                }
              } else {
                if (commentText != '') {
                  onAddComment(post);
                  generateId();
                  commentInputRef.current.blur();
                  setCommentText('');
                }
              }
            }}>
            <Icon name="send" size={30} color="#2e64e5" />
          </TouchableOpacity>
        </View>
      </CommentContainerWrapper>

      <BottomSheet
        enablePanDownToClose={true}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={backdropComponent}>
        <View style={styles.bottomSheetContainer}>
          {commentSelected.userId == user.uid ? (
            <TouchableOpacity
              style={styles.panelButton}
              onPress={() => {
                bottomSheetRef.current.close();
                handleDeleteComment(post);
              }}>
              <Text style={styles.panelButtonTitle}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.panelButton}
              onPress={() => {
                bottomSheetRef.current.close();
              }}>
              <Text style={styles.panelButtonTitle}>Another feature...</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.panelButtonCancel}
            onPress={() => {
              bottomSheetRef.current.close();
            }}>
            <Text style={styles.panelButtonTitleCancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
  bottomSheetContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  panelButton: {
    width: '100%',
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#2e64e5',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonCancel: {
    width: '100%',
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginVertical: 7,
    borderWidth: 1,
    borderColor: '#2e64e5',
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  panelButtonTitleCancel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2e64e5',
  },
});
