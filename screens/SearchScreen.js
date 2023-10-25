import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
  useId,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import filter from 'lodash.filter';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {AuthContext} from '../navigation/AuthProvider.android';
import AsyncStorage, {
  useAsyncStorage,
} from '@react-native-async-storage/async-storage';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

export default SearchScreen = ({route, navigation}) => {
  const {user} = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [allUserData, setAllUserData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [followings, setFollowings] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [recent, setRecent] = useState([]);

  const id = useId();

  useEffect(() => {
    setIsLoading(true);
    fetchFollowings();
    fetchAllUser();
    readItemFromStorage();
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [refresh]);

  useEffect(() => {
    setIsLoading(true);
    navigation.addListener('focus', () => {
      fetchFollowings();
    });
  }, [navigation]);

  const readItemFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('recent');
      if (jsonValue != null) {
        setData(JSON.parse(jsonValue));
        setRecent(JSON.parse(jsonValue));
      }
      console.log('recent: ', recent);
    } catch (e) {
      // error reading value
    }
  };

  const writeItemToStorage = async newValue => {
    try {
      setRecent(newValue);
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('recent', jsonValue);
      console.log('recent: ', recent);
    } catch (e) {
      // saving error
    }
  };

  clearAll = async () => {
    try {
      await AsyncStorage.clear();
      setRecent([]);
      setData([]);
      // setRefresh(!refresh);
    } catch (e) {
      // clear error
    }
  };

  const fetchFollowings = async () => {
    try {
      const listUserId = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(user.uid)
        .collection('followings')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        listUserId.push(documentSnapshot.data().userId);
      }
      setFollowingList(listUserId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAllUser = async () => {
    try {
      const list = [];
      const querySnapshot = await firestore().collection('users').get();

      for (const documentSnapshot of querySnapshot.docs) {
        const {fname, lname, userImg} = documentSnapshot.data();

        list.push({
          userId: documentSnapshot.id,
          userName: fname ? `${fname} ${lname}` : 'New User',
          userImg: userImg
            ? userImg
            : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
        });
      }
      setAllUserData(list);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSearch = query => {
    const formattedQuery = query.toLowerCase();
    const filteredData = filter(recent, user => {
      return contains(user, formattedQuery);
    });
    setData(filteredData);
  };

  const submitSearch = async () => {
    setIsLoading(true);
    const formattedQuery = searchQuery.toLowerCase();
    const filteredData = filter(allUserData, user => {
      return contains(user, formattedQuery);
    });
    if (filteredData.length != 0) {
      console.log('filteredData: ', filteredData);
      setData(filteredData);
      setRefresh(!refresh);
    } else {
      const isExisted = recent.some(item => item.userName === searchQuery);
      if (recent && !isExisted) {
        writeItemToStorage([
          ...recent,
          {userId: id + searchQuery, userName: searchQuery},
        ]);
      } else if (!recent) {
        writeItemToStorage([{userId: id + searchQuery, userName: searchQuery}]);
      }
    }
    setRefresh(!refresh);
  };

  const contains = ({userName}, query) => {
    const formattedUserName = userName.toLowerCase();
    if (formattedUserName.includes(query)) {
      return true;
    }
  };

  const sortByName = () => {
    setIsLoading(true);
    setData(data.sort((a, b) => (a.userName > b.userName ? 1 : -1)));
    setRefresh(!refresh);
  };

  const handleDeleteAllRecent = () => {
    Alert.alert(
      'Information',
      'Are you sure to delete all history search',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancle Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => {
            clearAll();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const deleteItem = itemId => {
    const index = recent.findIndex(item => item.userId == itemId);
    if (index !== -1) {
      recent.splice(index, 1);
      setData(recent);
      setRecent(recent);
    }
    writeItemToStorage([...recent]);
  };

  const handleDelete = itemId => {
    Alert.alert(
      'Information',
      'Are you sure to delete',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancle Pressed!'),
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: () => {
            deleteItem(itemId);
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity>
          <Icon
            name="arrow-back-outline"
            size={30}
            backgroundColor="#fff"
            marginRight={10}
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            autoFocus={true}
            style={styles.input}
            value={searchQuery}
            numberOfLines={1}
            placeholder="Search..."
            placeholderTextColor="#666"
            onChangeText={text => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
          {searchQuery != '' ? (
            <TouchableOpacity style={styles.iconStyle}>
              <Icon
                name="close-outline"
                size={30}
                backgroundColor="transparent"
                onPress={() => {
                  setSearchQuery('');
                  setData(recent);
                }}
              />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.iconStyle, styles.iconStyleRight]}>
            <Icon
              name="search-outline"
              size={30}
              backgroundColor="transparent"
              onPress={() => {
                if (searchQuery != '') {
                  submitSearch();
                }
              }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Icon
            name="filter-outline"
            size={30}
            backgroundColor="#fff"
            style={{marginLeft: 10}}
            onPress={sortByName}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.recentBar}>
        <Icon
          name="time-outline"
          size={30}
          color="#000"
          style={{marginLeft: 10}}
          onPress={sortByName}
        />
        <Text
          style={{
            marginLeft: 10,
            fontSize: 18,
            fontWeight: 500,
            color: '#000',
          }}>
          Recent
        </Text>
        <TouchableOpacity
          style={styles.btnClear}
          onPress={() => {
            if (recent.length != 0) {
              handleDeleteAllRecent();
            }
          }}>
          <Text style={{fontSize: 15}}>Clear all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchResult}>
        {error ? (
          <View style={{width: 300, alignSelf: 'center'}}>
            <Text style={{fontSize: 20, color: 'red'}}>
              Error in fetching data ... Please check your internet connection!
            </Text>
          </View>
        ) : isLoading ? (
          <ActivityIndicator size="large" color="#5500dc" />
        ) : (
          <FlatList
            data={data}
            renderItem={({item}) => (
              <View style={styles.itemContainer}>
                <TouchableOpacity
                  style={styles.itemInfor}
                  onPress={() => {
                    const isExisted = recent.some(
                      recent_item => recent_item.userName === item.userName,
                    );
                    if (recent && !isExisted) {
                      writeItemToStorage([...recent, item]);
                    } else if (!recent) {
                      writeItemToStorage([item]);
                    }
                    navigation.push('HomeProfile', {
                      userId: item.userId,
                      userName: item.userName,
                      followingList: followingList,
                    });
                  }}>
                  {item.userImg ? (
                    <Image source={{uri: item.userImg}} style={styles.image} />
                  ) : (
                    <Image
                      source={require('../assets/images/search.png')}
                      style={styles.image}
                    />
                  )}
                  <View>
                    <Text style={{color: '#000'}}>{item.userName}</Text>
                    {/* <Text>following</Text> */}
                    <Text>{item.userId}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDelete}
                  onPress={() => {
                    handleDelete(item.userId);
                  }}>
                  <Icon name="close-outline" size={35} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.userId}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchResult: {
    flex: 1,
    width: '100%',
    padding: 0,
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#f0f0f0',
  },
  inputContainer: {
    width: 300,
    height: 45,
    borderColor: '#ccc',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  iconStyle: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    flexDirection: 'row',
    // backgroundColor: 'pink',
    width: 40,
  },
  iconStyleRight: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: 1,
    borderColor: '#ccc',
  },
  iconStyleLeft: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  input: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flex: 1,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemInfor: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  recentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  btnClear: {
    position: 'absolute',
    right: 0,
    marginRight: 10,
    padding: 4,
    // borderWidth: 1,
    // borderRadius: 10,
    // borderColor: '#ccc'
  },
  btnDelete: {
    width: 70,
    height: '100%',
    backgroundColor: 'transparent',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
  },
});
