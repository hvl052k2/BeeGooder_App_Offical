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
  const [commentSelected, setCommentSelected] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [cmtId, setCmtId] = useState(null);
  const [seeMoreReplies, setSeeMoreReplies] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');

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
          setHeaderTitle(`This is ${fname} ${lname}'s post`);
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

                  if (comments[i].commentReplies[j].sendTo != '') {
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
                      sendTo: comments[i].commentReplies[j].sendTo,
                      userImg: userImg,
                      commentText: comments[i].commentReplies[j].commentText,
                      commentTime: comments[i].commentReplies[j].commentTime,
                    });
                  } else {
                    listReply.push({
                      id: comments[i].commentReplies[j].id,
                      userId: comments[i].commentReplies[j].userId,
                      userName: `${fname} ${lname}`,
                      sendToUserName: '',
                      userImg: userImg,
                      commentText: comments[i].commentReplies[j].commentText,
                      commentTime: comments[i].commentReplies[j].commentTime,
                    });
                  }
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
            if (commentSelected.length == 1) {
              const indexToRemove = comments.findIndex(
                item => item.id === commentSelected[0].id,
              );
              if (indexToRemove !== -1) {
                comments.splice(indexToRemove, 1);
              }
            } else {
              const commentToChange = comments.find(
                item => item.id === commentSelected[1].id,
              );

              const indexToRemove = commentToChange.commentReplies.findIndex(
                item => item.id === commentSelected[0].id,
              );

              if (indexToRemove !== -1) {
                commentToChange.commentReplies.splice(indexToRemove, 1);
              }
            }
          }

          if (command == 'addCommentReply') {
            let commentToChange;
            if (replyTo.length == 1) {
              commentToChange = comments.find(
                item => item.id === replyTo[0].id,
              );
            } else {
              commentToChange = comments.find(
                item => item.id === replyTo[1].id,
              );
            }

            // console.log('commentToChange: ', commentToChange);
            commentToChange.commentReplies.push({
              id: cmtId,
              userId: user.uid,
              commentText: commentText,
              commentTime: firestore.Timestamp.fromDate(new Date()),
              sendBy: user.uid,
              sendTo: replyTo.length == 2 ? replyTo[0].userId : '',
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
    commentList.push({
      id: cmtId,
      userId: user.uid,
      userName: `${userData.fname} ${userData.lname}`,
      userImg: userData.userImg,
      commentText: commentText,
      commentTime: firestore.Timestamp.fromDate(new Date()),
      commentReplies: [],
    });

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
    let commentToChange;
    if (replyTo.length == 1) {
      commentToChange = commentList.find(item => item.id === replyTo[0].id);
    } else {
      commentToChange = commentList.find(item => item.id === replyTo[1].id);
    }

    if (commentToChange) {
      commentToChange.commentReplies.push({
        id: cmtId,
        userId: user.uid,
        userName: `${userData.fname} ${userData.lname}`,
        userImg: userData.userImg,
        commentText: commentText,
        commentTime: firestore.Timestamp.fromDate(new Date()),
        sendToUserName: replyTo.length == 1 ? '' : replyTo[0].userName,
      });
    }

    // cập nhật setPost
    let commentReplyToChange;
    if (replyTo.length == 1) {
      commentReplyToChange = post.comments.find(
        item => item.id === replyTo[0].id,
      );
    } else {
      commentReplyToChange = post.comments.find(
        item => item.id === replyTo[1].id,
      );
    }

    if (commentReplyToChange) {
      commentReplyToChange.commentReplies.push({
        id: cmtId,
        userId: user.uid,
        commentText: commentText,
        commentTime: firestore.Timestamp.fromDate(new Date()),
      });
    }
    updatePostComment(post, 'addCommentReply');
  };

  const onDeleteComment = post => {
    if (commentSelected.length == 1) {
      // cập nhật setCommentList
      const indexToRemove = commentList.findIndex(
        item => item.id === commentSelected[0].id,
      );
      commentList.splice(indexToRemove, 1);

      // cập nhật setPost
      const index = post.comments.findIndex(
        item => item.id === commentSelected[0].id,
      );
      post.comments.splice(index, 1);
    } else {
      // cập nhật setCommentList
      const commentListTempt = commentList.find(
        item => item.id === commentSelected[1].id,
      );

      const indexToRemove = commentListTempt.commentReplies.findIndex(
        item => item.id === commentSelected[0].id,
      );

      if (indexToRemove !== -1) {
        commentListTempt.commentReplies.splice(indexToRemove, 1);
      }

      // cập nhật setPost
      const postCommentsTempt = post.comments.find(
        item => item.id === commentSelected[1].id,
      );

      const index = postCommentsTempt.commentReplies.findIndex(
        item => item.id === commentSelected[0].id,
      );

      if (index !== -1) {
        postCommentsTempt.commentReplies.splice(index, 1);
      }
    }
    setCommentSelected(null);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.btnBack}
          onPress={() => navigation.pop()}>
          <Icon name="arrow-back-sharp" size={25} color="#1c1c1e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>
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
              disLike(post);
            } else {
              onLike(post);
            }
          }}
          onPress={() =>
            navigation.navigate('HomeProfile', {
              userId: post.userId,
              followingList: route.params.followingList,
            })
          }
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#5500dc" />
        ) : (
          commentList.map(comment => (
            <View key={comment.id}>
              <CommentCard
                onLongPress={() => {
                  bottomSheetRef.current.snapToIndex(0);
                  setCommentSelected([comment]);
                }}
                onPress={() => {
                  commentInputRef.current.focus();
                  // setCommentSelected([comment]);
                  setReplyTo([comment]);
                }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.push('HomeProfile', {
                      userId: comment.userId,
                      followingList: route.params.followingList,
                    })
                  }>
                  <UserImage source={{uri: comment.userImg}} />
                </TouchableOpacity>

                <ContentWarapper>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.push('HomeProfile', {
                          userId: comment.userId,
                          followingList: route.params.followingList,
                        })
                      }>
                      <UserName>{comment.userName}</UserName>
                    </TouchableOpacity>
                  </View>
                  <CommentText>{comment.commentText}</CommentText>
                  <View style={{flexDirection: 'row', marginTop: 5}}>
                    <Icon name="time-outline" />
                    <CommentTime>
                      {moment(comment.commentTime.toDate()).fromNow()}
                    </CommentTime>
                  </View>
                </ContentWarapper>
              </CommentCard>

              {seeMoreReplies.includes(comment.id) == true ? (
                comment.commentReplies.map(commentReply => (
                  <View style={{paddingLeft: 20}} key={commentReply.id}>
                    <CommentCard
                      onLongPress={() => {
                        bottomSheetRef.current.snapToIndex(0);
                        setCommentSelected([commentReply, comment]);
                      }}
                      onPress={() => {
                        commentInputRef.current.focus();
                        setReplyTo([commentReply, comment]);
                      }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.push('HomeProfile', {
                            userId: commentReply.userId,
                            followingList: route.params.followingList,
                          })
                        }>
                        <UserImageReply source={{uri: commentReply.userImg}} />
                      </TouchableOpacity>
                      <ContentWarapper>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.push('HomeProfile', {
                                userId: commentReply.userId,
                                followingList: route.params.followingList,
                              })
                            }>
                            <UserName>{commentReply.userName}</UserName>
                          </TouchableOpacity>
                          {commentReply.sendToUserName != '' ? (
                            <>
                              <Icon
                                name="caret-forward"
                                color="#ccc"
                                style={{marginHorizontal: 4}}
                              />
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.push('HomeProfile', {
                                    userId: commentReply.sendTo,
                                    followingList: route.params.followingList,
                                  })
                                }>
                                <UserName>
                                  {commentReply.sendToUserName}
                                </UserName>
                              </TouchableOpacity>
                            </>
                          ) : null}
                        </View>
                        <CommentText>{commentReply.commentText}</CommentText>
                        <View style={{flexDirection: 'row', marginTop: 5}}>
                          <Icon name="time-outline" />
                          <CommentTime>
                            {moment(
                              commentReply.commentTime.toDate(),
                            ).fromNow()}
                          </CommentTime>
                        </View>
                      </ContentWarapper>
                    </CommentCard>
                  </View>
                ))
              ) : comment.commentReplies.length > 0 ? (
                <TouchableOpacity
                  style={styles.btnSeeMore}
                  onPress={() => {
                    setSeeMoreReplies([...seeMoreReplies, comment.id]);
                  }}>
                  <Text style={{fontWeight: 'bold'}}>
                    See {comment.commentReplies.length}{' '}
                    {comment.commentReplies.length > 1 ? 'replies' : 'reply'}{' '}
                  </Text>
                  <Icon name="chevron-down" size={15} />
                </TouchableOpacity>
              ) : null}
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
              Replying to {replyTo[0].userName}
            </Text>
            <Text>{replyTo[0].commentText}</Text>
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
          {commentSelected != null && commentSelected[0].userId == user.uid ? (
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
  btnBack: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    height: 55,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerTitle: {
    fontSize: 20,
    color: '#1c1c1e',
    fontWeight: 'bold',
  },
  btnSeeMore: {
    marginLeft: 68,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
