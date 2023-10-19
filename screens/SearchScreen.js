import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useRef,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import filter from 'lodash.filter';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {AuthContext} from '../navigation/AuthProvider.android';

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
  const searchRef = useRef();

  useEffect(() => {
    setIsLoading(true);
    fetchFollowings();
    fetchAllUser();
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

  const fetchFollowings = async () => {
    try {
      const listUserId = [];
      const list = [];
      const querySnapshot = await firestore()
        .collection('follows')
        .doc(user.uid)
        .collection('followings')
        .get();

      for (const documentSnapshot of querySnapshot.docs) {
        const userId = documentSnapshot.data().userId;
        listUserId.push(userId);
        const snapShot = await firestore()
          .collection('users')
          .doc(userId)
          .get();
        const {fname, lname, userImg} = snapShot.data();

        list.push({
          userId: snapShot.id,
          userName: fname ? `${fname} ${lname}` : 'New User',
          userImg: userImg
            ? userImg
            : 'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg',
        });
      }
      setFollowingList(listUserId);
      setFollowings(list);
      setData(list);
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
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = filter(followings, user => {
      return contains(user, formattedQuery);
    });
    setData(filteredData);
  };

  const submitSearch = () => {
    // fetchAllUser();
    setIsLoading(true);
    const formattedQuery = searchQuery.toLowerCase();
    const filteredData = filter(allUserData, user => {
      return contains(user, formattedQuery);
    });
    setData(filteredData);
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
                  setData(followings);
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
                submitSearch();
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
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() =>
                  navigation.push('HomeProfile', {
                    userId: item.userId,
                    userName: item.userName,
                    followingList: followingList,
                  })
                }>
                <Image source={{uri: item.userImg}} style={styles.image} />
                <View>
                  <Text style={{color: '#000'}}>{item.userName}</Text>
                  {/* <Text>following</Text> */}
                  <Text>{item.userId}</Text>
                </View>
              </TouchableOpacity>
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
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
});
