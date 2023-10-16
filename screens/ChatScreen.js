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
  const [userData, setUserData] = useState(null);
  const [myData, setMyData] = useState(null);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    }).then(image => {
      console.log(image);
      const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then(image => {
      console.log(image);
      const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = 'IMG_' + uploadUri.substring(uploadUri.lastIndexOf('-') + 1);

    //Add timestamp to File Name
    // const extension = filename.split(".").prop();
    // const name = filename.split(".").slice(0, -1).join(".");
    // filename = name + Date.now() + "." + extension;

    setUploading(true);
    setTransferred(0);

    // Set transferred state
    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);
    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;
      const url = await storageRef.getDownloadURL();
      // setImageUrl(url);
      setUploading(false);
      setImage(null);
      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const getUserData = useCallback(async () => {
    await firestore()
      .collection('users')
      .doc(route.params.userId)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          console.log('User Data: ', documentSnapshot.data());
          setUserData(documentSnapshot.data());
        }
      });
  }, []);

  const getMyData = useCallback(async () => {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .get()
      .then(documentSnapshot => {
        if (documentSnapshot.exists) {
          console.log('My Data: ', documentSnapshot.data());
          setMyData(documentSnapshot.data());
        }
      });
  }, []);

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

  const onSend = useCallback(async (messages = []) => {
    // const url = uploadImage();
    const msg = messages[0];
    const myMsg = {
      ...msg,
      sendBy: user.uid,
      sendTo: route.params.userId,
      createdAt: new Date(),
      // image: url,
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
  }, []);

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
        <TouchableOpacity>
          <Icon name="camera-outline" size={25} style={{marginStart: 10, marginTop: 8}} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="image-outline" size={25} style={{marginStart: 10, marginTop: 8}} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="mic-outline" size={25} style={{marginStart: 10, marginTop: 8}} />
        </TouchableOpacity>
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

  const renderActions = useCallback(() => {
    return (
      <View style={{marginBottom: 8, flexDirection: 'row'}}>
        <TouchableOpacity>
          <Icon
            name="add-circle-outline"
            size={28}
            color="#2e64e5"
            style={{marginStart: 10}}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <Icon name="camera-outline" size={28} style={{marginStart: 10}} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="image-outline" size={28} style={{marginStart: 10}} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="mic-outline" size={28} style={{marginStart: 10}} />
        </TouchableOpacity> */}
      </View>
    );
  }, []);

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
        textInputStyle={{
          // borderWidth: 0.5,
          // borderColor: 'gray',
          // borderRadius: 20,
          // marginRight: 10,
          paddingHorizontal: 10,
          backgroundColor: '#fff',
        }}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderActions}
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
