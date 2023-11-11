import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import {AuthContext} from '../navigation/AuthProvider.android';

import {
  InputField,
  InputWrapper,
  AddImage,
  SubmitBtn,
  SubmitBtnText,
  StatusWrapper,
} from '../styles/AddPost';

export default AddPostScreen = () => {
  const {user, logout} = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);
  const [showInformation, setShowInformation] = useState(false);
  const [isOpenCategories, setIsOpenCategories] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: 'Human', value: 'human'},
    {label: 'Animal', value: 'animal'},
    {label: 'Util', value: 'util'},
  ]);

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      // width: 1200,
      // height: 780,
      cropping: true,
    })
      .then(image => {
        console.log(image);
        const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      // width: 1200,
      // height: 780,
      cropping: true,
    })
      .then(image => {
        console.log(image);
        const imageUri = Platform.OS == 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          return false;
        }
      });
  };

  const submitPost = async () => {
    const imageUrl = await uploadImage();
    console.log('Image Url: ', imageUrl);

    firestore()
      .collection('Posts')
      .add({
        userId: user.uid,
        post: post,
        postImg: imageUrl,
        postTime: firestore.Timestamp.fromDate(new Date()),
        likes: [],
        comments: [],
        category: value ? value : '',
      })
      .then(() => {
        console.log('Post added!');
        Alert.alert(
          'Post published!',
          'Your post has been published successfully!',
        );
        setPost(null);
      })
      .catch(error => {
        console.log(
          'Some thing went wrong with added post to firestore.',
          error,
        );
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
      setUploading(false);
      setImage(null);
      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <InputWrapper>
        {image != null ? <AddImage source={{uri: image}} /> : null}
        <InputField
          placeholder="What's on your mind?"
          multiline
          numberOfLines={4}
          value={post}
          onChangeText={content => setPost(content)}
        />
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => {
                setShowInformation(!showInformation);
              }}>
              <Icon name="information-circle" size={25} />
            </TouchableOpacity>
            {showInformation ? (
              <View style={styles.information}>
                <Text>
                  Choosing the right category helps increase the chances of
                  success in searching.
                </Text>
                <View style={styles.viewDependent} />
              </View>
            ) : null}

            <DropDownPicker
              open={isOpenCategories}
              value={value}
              items={items}
              setOpen={setIsOpenCategories}
              setValue={setValue}
              setItems={setItems}
              placeholder={'Choose a category.'}
              containerStyle={{
                width: 200,
                marginRight: 10,
              }}
            />
            <SubmitBtn onPress={submitPost}>
              <SubmitBtnText>Post</SubmitBtnText>
            </SubmitBtn>
          </View>
        )}
      </InputWrapper>
      <ActionButton buttonColor="rgba(231,76,60,1)">
        <ActionButton.Item
          buttonColor="#9b59b6"
          title="Take Photo"
          onPress={takePhotoFromCamera}>
          <Icon name="camera-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="Choose Photo"
          onPress={choosePhotoFromLibrary}>
          <Icon name="image-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  information: {
    padding: 5,
    position: 'absolute',
    width: 200,
    height: 70,
    backgroundColor: '#e8e8e8',
    bottom: 60,
    left: -20,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  viewDependent: {
    width: 15,
    height: 15,
    backgroundColor: '#fff',
    transform: [{rotate: '45deg'}],
    position: 'absolute',
    bottom: -8,
    left: 25,
    backgroundColor: '#e8e8e8',
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
  },
});
