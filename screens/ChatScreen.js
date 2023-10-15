import React, {useState, useCallback, useEffect, useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider.android';
import {Container} from '../styles/FeedStyles';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {GiftedChat, Bubble, Send} from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import moment from 'moment';

export default ChatScreen = ({route}) => {
  const {user} = useContext(AuthContext);
  const [messageList, setMessageList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [myData, setMyData] = useState(null);

  const getUserData = async () => {
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
  };

  const getMyData = async () => {
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
  };

  const findIndexFromEnd = (messageList, userId) => {
    for (let i = messageList.length - 1; i >= 0; i--) {
      if (messageList[i].sendBy === userId) {
        return i;
      }
    }
    return -1;
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
        };
      });
      if (allMessages.length != 0) {
        index = findIndexFromEnd(allMessages, route.params.userId);
        if (index != -1) {
          allMessages[index].user.avatar =
            'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg';
        }
      }
      console.log('allMessages: ', allMessages);
      setMessageList(allMessages);
    });
  };

  useEffect(() => {
    fetchMessageList();
    getUserData();
    getMyData();
  }, []);

  const onSend = useCallback(async (messages = []) => {
    const msg = messages[0];
    console.log('msg: ', msg);
    const myMsg = {
      ...msg,
      sendBy: user.uid,
      sendTo: route.params.userId,
      createdAt: new Date(),
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
            backgroundColor: '#f0f2f5',
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
      <Send {...props}>
        <View style={{marginBottom: 8, marginRight: 10}}>
          <Icon name="send" color="#2e64e5" size={25} />
        </View>
      </Send>
    );
  };

  const scrollToBottomComponent = () => {
    return <Icon name="arrow-down-outline" size={25} color="#2e64e5" />;
  };

  return (
    <GiftedChat
      style={{backgroundColor: '#fff'}}
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
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
