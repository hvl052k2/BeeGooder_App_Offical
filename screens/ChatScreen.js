import React, {useState, useCallback, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Container} from '../styles/FeedStyles';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
  Composer,
} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment';
import ImagePicker from 'react-native-image-crop-picker';

export default ChatScreen = ({route}) => {
  const {user} = useContext(AuthContext);
  const [messageList, setMessageList] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isOpenActions, setIsOpenActions] = useState(false);

  const takePhotoFromCamera = () => {
    setIsOpenActions(false);

    ImagePicker.openCamera({
      // width: 1200,
      // height: 780,
      cropping: true,
    })
      .then(image => {
        const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
        console.log('imageUri: ', imageUri);
        setImageData(imageUri);
        uploadImage(imageUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  };

  const choosePhotoFromLibrary = () => {
    setIsOpenActions(false);
    ImagePicker.openPicker({
      // width: 1200,
      // height: 780,
      cropping: true,
    })
      .then(image => {
        const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
        console.log('imageUri: ', imageUri);
        setImageData(imageUri);
        uploadImage(imageUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  };

  // const takeVideoFromCamera = () => {
  //   ImagePicker.openPicker({
  //     // width: 1200,
  //     // height: 780,
  //     mediaType: 'video',
  //     // cropping: true,
  //   }).then(image => {
  //     const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
  //     console.log('imageUri: ', imageUri);
  //     setImageData(imageUri);
  //     uploadImage(imageUri);
  //   });
  // };

  const chooseVideoFromLibrary = () => {
    setIsOpenActions(false);
    ImagePicker.openPicker({
      // width: 1200,
      // height: 780,
      // cropping: true,
      mediaType: 'video',
    })
      .then(image => {
        const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
        console.log('imageUri: ', imageUri);
        setImageData(imageUri);
        uploadImage(imageUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  };

  const uploadImage = async imageUri => {
    const uploadUri = imageUri;
    let filename = 'IMG_' + uploadUri.substring(uploadUri.lastIndexOf('-') + 1);

    // Set transferred state
    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    try {
      await task;
      const url = await storageRef.getDownloadURL();
      setImageUrl(url);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchMessageList = () => {
    const querySnapshot = firestore()
      .collection('chats')
      .doc(user.uid + route.params.userId)
      .collection('messages')
      .orderBy('createdAt', 'desc');
    querySnapshot.onSnapshot(snapShot => {
      const allMessages = snapShot.docs.map(snap => {
        return {
          ...snap.data(),
          createdAt: snap.data().createdAt.toDate(),
          user: {
            _id: snap.data().user._id,
            avatar: route.params.userImg,
          },
          // image: snap.data().image ? snap.data().image : '',
          // sent: true,
          // received: true,
        };
      });
      setMessageList(allMessages);
    });
  };

  useEffect(() => {
    fetchMessageList();
  }, []);

  const onSend = async (messages = []) => {
    const msg = messages[0];
    const myMsg = {
      ...msg,
      sendBy: user.uid,
      sendTo: route.params.userId,
      createdAt: new Date(),
      image: imageUrl,
    };
    setMessageList(previousMessages =>
      GiftedChat.append(previousMessages, myMsg),
    );

    firestore()
      .collection('chats')
      .doc(user.uid + route.params.userId)
      .collection('messages')
      .add(myMsg);

    firestore()
      .collection('chats')
      .doc(route.params.userId + user.uid)
      .collection('messages')
      .add(myMsg);
    setImageUrl('');
    setImageData(null);
  };

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2e64e5',
          },
          left: {
            backgroundColor: '#f1f1f1',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
          left: {
            color: '#000',
          },
        }}
      />
    );
  };

  const renderSend = props => {
    return (
      <View style={{marginBottom: 0, marginRight: 10, flexDirection: 'row'}}>
        {imageUrl != '' ? (
          <>
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 10,
                backgroundColor: '#fff',
                marginRight: 15,
                // position: 'absolute',
                // top: -205,
                // right: 100
              }}>
              <Image
                source={{uri: imageUrl}}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 10,
                  position: 'absolute',
                }}
              />
              <TouchableOpacity>
                <Icon
                  name="close-circle-outline"
                  size={22}
                  style={{
                    marginStart: 10,
                    marginTop: 8,
                    position: 'absolute',
                    right: -20,
                    top: -10,
                  }}
                  onPress={() => {
                    setImageUrl('');
                  }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Icon
                name="happy-outline"
                size={25}
                style={{marginStart: 10, marginTop: 8}}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity>
              <Icon
                name="happy-outline"
                size={25}
                style={{marginStart: 10, marginTop: 8}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                name="mic-outline"
                size={25}
                style={{marginStart: 10, marginTop: 8}}
              />
            </TouchableOpacity>
          </>
        )}

        <Send {...props}>
          <Icon
            name="send"
            color="#2e64e5"
            size={25}
            style={{marginStart: 10}}
          />
        </Send>
      </View>
    );
  };

  const scrollToBottomComponent = () => {
    return <Icon name="arrow-down-outline" size={25} color="#2e64e5" />;
  };

  const renderInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: 'transparent',
          // borderTopWidth: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  };

  const renderActions = () => {
    return (
      <View style={{marginBottom: 8}}>
        {isOpenActions ? (
          <View
            style={{
              width: 100,
              height: 110,
              borderWidth: 0.5,
              borderRadius: 10,
              position: 'absolute',
              backgroundColor: '#fff',
              top: -125,
              left: 10,
            }}>
            <TouchableOpacity
              onPress={takePhotoFromCamera}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                // backgroundColor: 'pink',
                padding: 5,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              }}>
              <Icon name="camera-outline" size={25} style={{marginRight: 5}} />
              <Text>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={choosePhotoFromLibrary}
              style={{flexDirection: 'row', alignItems: 'center', padding: 5}}>
              <Icon name="image-outline" size={25} style={{marginRight: 5}} />
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={()=>{console.log('choose file clicked!')}}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                // backgroundColor: 'yellow',
                padding: 5,
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10,
              }}>
              <Icon name="attach-outline" size={25} style={{marginRight: 5}} />
              <Text>File</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <TouchableOpacity
          onPress={() => {
            setIsOpenActions(!isOpenActions);
          }}>
          <Icon
            name="add-circle-outline"
            size={28}
            color="#2e64e5"
            style={{marginStart: 10}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messageList}
        onSend={messages => onSend(messages)}
        user={{
          _id: user.uid,
        }}
        renderBubble={renderBubble}
        alwaysShowSend
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        renderActions={renderActions}
        textInputStyle={{
          // borderWidth: 0.5,
          // borderColor: 'gray',
          // borderRadius: 20,
          // marginRight: 10,
          paddingHorizontal: 10,
          backgroundColor: '#fff',
        }}
        renderInputToolbar={renderInputToolbar}
        // renderActions={renderActions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
