// import {
//   ZegoUIKitPrebuiltCall,
//   ONE_ON_ONE_VIDEO_CALL_CONFIG,
// } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import {View, StyleSheet, Text} from 'react-native';
import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from 'react';

export default VideoCallPage = ({navigation, route}) => {
  return (
    <View style={styles.container}>
        <Text>Video Call Page</Text>
      {/* <ZegoUIKitPrebuiltCall
        appID={1178755444}
        appSign={
          'c0e4287855e2ce785bc382219b1b1d6b3cb78422fcedcf61d78133980dacdb43'
        }
        userID={route.params.userName} // userID can be something like a phone number or the user id on your own user system.
        userName={route.params.userName}
        callID={'MyCallID'} // callID can be any unique string.
        config={{
          // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
          ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
          onOnlySelfInRoom: () => {
            navigation.navigate('ChatScreen');
          },
          onHangUp: () => {
            navigation.navigate('ChatScreen');
          },
        }}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
