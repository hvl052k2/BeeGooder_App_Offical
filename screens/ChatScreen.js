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

  useEffect(() => {
    const querySnapshot = firestore()
      .collection('chats')
      .doc(user.uid + route.params.userId)
      .collection('messages')
      .orderBy('createdAt', 'desc');
    querySnapshot.onSnapshot(snapShot => {
      const allMessages = snapShot.docs.map(snap => {
        return {...snap.data(), createdAt: snap.data().createdAt.toDate()};
      });
      setMessageList(allMessages);
    });
  }, []);

  const onSend = useCallback(async (messages = []) => {
    const msg = messages[0];
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
        }}
        textStyle={{
          right: {
            color: '#fff',
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
