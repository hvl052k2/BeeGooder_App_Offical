import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

// import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AddPostScreen from '../screens/AddPostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FollowingsScreen from '../screens/FollowingsScreen';
import FollowersScreen from '../screens/FollowersScreen';
import SearchScreen from '../screens/SearchScreen';
import HumanPostsScreen from '../screens/toptapscreens/HumanPostsScreen';
import AnimalPostsScreen from '../screens/toptapscreens/AnimalPostsScreen';
import UtilPostsScreen from '../screens/toptapscreens/UtilPostsScreen';
import VideoCallPage from '../screens/VideoCallPage';
import CommentsScreen from '../screens/CommentsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const TopTabHome = () => {
  return (
    <TopTab.Navigator
      screenOptions={({route, navigation}) => ({
        tabBarIcon: ({color, focused, size}) => {
          let iconName;
          if (route.name === 'All') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Human') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Animal') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Util') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }
          return <Icon name={iconName} size={25} color={color} />;
        },
        tabBarActiveTintColor: '#2e64e5',
        tabBarLabelStyle: {
          textTransform: 'none',
          fontWeight: 'bold',
          fontFamily: 'Kufam-SemiBoldItalic',
        },
        tabBarShowLabel: false,
        tabBarInactiveTintColor: 'gray',
        tabBarPressColor: '#fff',
      })}>
      <TopTab.Screen name="All" component={HomeScreen} />
      <TopTab.Screen name="Human" component={HumanPostsScreen} />
      <TopTab.Screen name="Animal" component={AnimalPostsScreen} />
      <TopTab.Screen name="Util" component={UtilPostsScreen} />
    </TopTab.Navigator>
  );
};

const FeedStack = ({navigation}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TopTabHome"
        // component={HomeScreen}
        component={TopTabHome}
        options={{
          // headerTitleAlign: 'center',
          headerTitle: 'iFinder',
          headerTitleStyle: {
            color: '#2e64e5',
            fontFamily: 'Kufam-SemiBoldItalic',
            letterSpacing: 2,
            // fontFamily: 'Lato-Italic',
            fontSize: 30,
            fontWeight: 'bold',
          },
          headerStyle: {
            shadowColor: '#000',
            elevation: 0,
          },
          headerRight: () => (
            <View style={{marginRight: 15, flexDirection: 'row'}}>
              <TouchableOpacity>
                <Icon
                  name="search"
                  size={35}
                  backgroundColor="#fff"
                  color="#2e64e5"
                  style={{marginRight: 15}}
                  onPress={() => navigation.navigate('SearchScreen')}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon
                  name="add-circle"
                  size={35}
                  backgroundColor="#fff"
                  color="#2e64e5"
                  onPress={() => navigation.navigate('AddPostScreen')}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Stack.Screen name="CommentsScreen" component={CommentsScreen} options={{headerTitle: 'Comment screen'}}/>

      <Stack.Screen
        name="AddPostScreen"
        component={AddPostScreen}
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#2e64e515',
            shadowColor: '#2e64e515',
            elevation: 0,
          },
          headerBackTitleVisible: false,
          headerBackImage: () => (
            <TouchableOpacity
              style={styles.gobackButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={30} color="#2e64e5" />
            </TouchableOpacity>
          ),
          // headerRight: ()=>(
          //   <Text style={{marginRight: 10, color: "#2e64e5", fontSize: 18, fontWeight: 'bold'}}>Post</Text>
          // )
        }}
      />

      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{
          headerShown: false,
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name="HomeProfile"
        component={ProfileScreen}
        options={{
          title: '',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: '#fff',
            elevation: 0,
          },
          headerBackTitleVisible: false,
          // headerBackImage: () => (
          //   <TouchableOpacity
          //     style={styles.gobackButton}
          //     onPress={() => navigation.goBack()}>
          //     <Icon name="arrow-back" size={30} color="#2e64e5" />
          //   </TouchableOpacity>
          // ),
        }}
      />

      <Stack.Screen name="VideoCallPage" component={VideoCallPage} />

      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({route}) => ({
          headerTitleStyle: {
            flexDirection: 'row',
            alignItems: 'center',
          },
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: '#000',
            elevation: 5,
          },
          headerTitleAlign: 'left',
          headerBackTitleVisible: false,
          headerTitle: props => (
            <View {...props}>
              <Image
                style={{width: 40, height: 40, borderRadius: 50}}
                source={{uri: route.params.userImg}}
              />
              <Text
                style={{
                  fontSize: 15,
                  color: '#000',
                  marginLeft: 10,
                  fontWeight: 'bold',
                }}>
                {route.params.userName}
              </Text>
            </View>
          ),
          headerRight: () => (
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('VideoCallPage', {
                    userId: route.params.userId,
                    userName: route.params.userName,
                  });
                }}>
                <Icon
                  name="call"
                  size={28}
                  backgroundColor="#fff"
                  color="#2e64e5"
                  style={{marginRight: 15, backgroundColor: 'transparent'}}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon
                  name="videocam"
                  size={28}
                  backgroundColor="#fff"
                  color="#2e64e5"
                  style={{marginRight: 15, backgroundColor: 'transparent'}}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Icon
                  name="alert-circle"
                  size={28}
                  backgroundColor="#fff"
                  color="#2e64e5"
                  style={{marginRight: 15, backgroundColor: 'transparent'}}
                />
              </TouchableOpacity>
            </View>
          ),
        })}
      />

      <Stack.Screen
        name="FriendsFollowingsScreen"
        component={FollowingsScreen}
        options={{
          title: 'Followings',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: '#fff',
            elevation: 0,
          },
          headerBackTitleVisible: false,
          // headerBackImage: () => (
          //   <TouchableOpacity
          //     style={styles.gobackButton}
          //     onPress={() => navigation.goBack()}>
          //     <Icon name="arrow-back" size={30} color="#2e64e5" />
          //   </TouchableOpacity>
          // ),
        }}
      />

      <Stack.Screen
        name="FriendsFollowersScreen"
        component={FollowersScreen}
        options={{
          title: 'Followers',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: '#fff',
            elevation: 0,
          },
          headerBackTitleVisible: false,
          // headerBackImage: () => (
          //   <TouchableOpacity
          //     style={styles.gobackButton}
          //     onPress={() => navigation.goBack()}>
          //     <Icon name="arrow-back" size={30} color="#2e64e5" />
          //   </TouchableOpacity>
          // ),
        }}
      />
    </Stack.Navigator>
  );
};

const MessagesStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="MessagesScreen"
      component={MessagesScreen}
      options={{
        headerTitle: 'Messages',
        headerTitleAlign: 'center',
      }}
    />
    <Stack.Screen
      name="ChatScreen"
      component={ChatScreen}
      options={({route}) => ({
        headerTitleStyle: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#000',
          elevation: 5,
        },
        headerTitleAlign: 'left',
        headerBackTitleVisible: false,
        headerTitle: props => (
          <View {...props}>
            <Image
              style={{width: 40, height: 40, borderRadius: 50}}
              source={{uri: route.params.userImg}}
            />
            <Text
              style={{
                fontSize: 15,
                color: '#000',
                marginLeft: 10,
                fontWeight: 'bold',
              }}>
              {route.params.userName}
            </Text>
          </View>
        ),
        headerRight: () => (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('VideoCallScreen', {
                  userId: route.params.userId,
                  userName: route.params.userName,
                });
              }}>
              <Icon
                name="call"
                size={28}
                backgroundColor="#fff"
                color="#2e64e5"
                style={{marginRight: 15, backgroundColor: 'transparent'}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                name="videocam"
                size={28}
                backgroundColor="#fff"
                color="#2e64e5"
                style={{marginRight: 15, backgroundColor: 'transparent'}}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon
                name="alert-circle"
                size={28}
                backgroundColor="#fff"
                color="#2e64e5"
                style={{marginRight: 15, backgroundColor: 'transparent'}}
              />
            </TouchableOpacity>
          </View>
        ),
      })}
    />
    <Stack.Screen name="VideoCallScreen" component={VideoCallPage} />
  </Stack.Navigator>
);

const ProfileStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{
        headerShown: false,
      }}
    />

    <Stack.Screen
      name="EditProfileScreen"
      component={EditProfileScreen}
      options={{
        headerTitle: 'Edit Profile',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: () => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.navigate('ProfileScreen')}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />

    <Stack.Screen
      name="FollowingsScreen"
      component={FollowingsScreen}
      options={{
        title: 'Followings',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: (props) => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.goBack()}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />

    <Stack.Screen
      name="FollowersScreen"
      component={FollowersScreen}
      options={{
        title: 'Followers',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: ({navigation}) => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.popToTop()}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />

    <Stack.Screen
      name="HomeProfile"
      component={ProfileScreen}
      options={{
        title: '',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: ({navigation}) => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.popToTop()}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />

    <Stack.Screen
      name="FriendsFollowingsScreen"
      component={FollowingsScreen}
      options={{
        title: 'Followings',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: ({navigation}) => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.popToTop()}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />

    <Stack.Screen
      name="FriendsFollowersScreen"
      component={FollowersScreen}
      options={{
        title: 'Followers',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
        headerBackTitleVisible: false,
        // headerBackImage: ({navigation}) => (
        //   <TouchableOpacity
        //     style={styles.gobackButton}
        //     onPress={() => navigation.popToTop()}>
        //     <Icon name="arrow-back" size={30} color="#2e64e5" />
        //   </TouchableOpacity>
        // ),
      }}
    />
  </Stack.Navigator>
);

// const FriendsStack = ({navigation}) => (
//   <Stack.Navigator>
//     <Stack.Screen
//       name="FriendsScreen"
//       component={FriendsScreen}
//       options={{
//         // headerShown: false,
//         headerTitle: 'Friends',
//         headerTitleAlign: 'center',
//       }}
//     />

//     <Stack.Screen
//       name="FriendProfileScreen"
//       component={ProfileScreen}
//       options={{
//         title: '',
//         headerTitleAlign: 'center',
//         headerStyle: {
//           backgroundColor: '#fff',
//           shadowColor: '#fff',
//           elevation: 0,
//         },
//         headerBackTitleVisible: false,
//         headerBackImage: () => (
//           <TouchableOpacity
//             style={styles.gobackButton}
//             onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={30} color="#2e64e5" />
//           </TouchableOpacity>
//         ),
//       }}
//     />
//   </Stack.Navigator>
// );

// const NotificationsStack = () => {
//   <Stack.Navigator>
//     <Stack.Screen/>
//   </Stack.Navigator>;
// };

const AppStack = ({route}) => {
  const getTabBarVisibility = route => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (
      routeName == 'ChatScreen' ||
      routeName == 'AddPostScreen' ||
      routeName == 'EditProfileScreen' ||
      routeName == 'Chat' ||
      routeName == 'SearchScreen' || 
      routeName == 'CommentsScreen'
    ) {
      return false;
    }
    return true;
  };
  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => ({
        tabBarIcon: ({color, focused, size}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Messages') {
            iconName = focused
              ? 'chatbox-ellipses'
              : 'chatbox-ellipses-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people-circle-outline' : 'people-circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e64e5',
        // tabBarInactiveTintColor: "gray"
      })}>
      {/* <Tab.Screen
        name="Home"
        component={TopTabNavigator}
        options={({route}) => ({
          tabBarLabel: 'Home',
          // headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      /> */}

      <Tab.Screen
        name="Home"
        component={FeedStack}
        options={({route}) => ({
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      />

      {/* <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={({route}) => ({
          tabBarLabel: 'Notifications',
          headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      /> */}

      {/* <Tab.Screen
        name="Friends"
        component={FriendsStack}
        options={({route}) => ({
          tabBarLabel: 'Friends',
          headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      /> */}

      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={({route}) => ({
          tabBarLabel: 'Messages',
          headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={({route}) => ({
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      />
    </Tab.Navigator>
  );
};

export default AppStack;

const styles = StyleSheet.create({
  gobackButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  inputContainer: {
    width: 280,
    height: 45,
    borderColor: '#ccc',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  iconStyle: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  input: {
    padding: 10,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    flex: 1,
    fontSize: 16,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
