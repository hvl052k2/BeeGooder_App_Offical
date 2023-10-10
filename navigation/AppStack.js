import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

// import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AddPostScreen from '../screens/AddPostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FeedStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="BeeGooder"
      component={HomeScreen}
      options={{
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: '#2e64e5',
          fontFamily: 'Kufam-SemiBoldItalic',
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerStyle: {
          shadowColor: '#fff',
          elevation: 0,
        },
        headerRight: () => (
          <View style={{marginRight: 10}}>
            <Icon
              name="add-circle"
              size={35}
              backgroundColor="#fff"
              color="#2e64e5"
              onPress={() => navigation.navigate('AddPostScreen')}
            />
          </View>
        ),
      }}
    />

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
        headerBackImage: () => (
          <TouchableOpacity
            style={styles.gobackButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="#2e64e5" />
          </TouchableOpacity>
        ),
      }}
    />

    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({route}) => ({
        title: route.params.userName,
        headerBackTitleVisible: false,
        headerTitleAlign: 'center',
      })}
    />
  </Stack.Navigator>
);

const MessageStack = ({navigation}) => (
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
        title: route.params.userName,
        headerBackTitleVisible: false,
        headerTitleAlign: 'center',
      })}
    />
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
        headerBackTitleVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
      }}
    />
  </Stack.Navigator>
);

const AppStack = ({route}) => {
  const getTabBarVisibility = route => {
    const routeName = getFocusedRouteNameFromRoute(route);
    if (
      routeName == 'ChatScreen' ||
      routeName == 'AddPostScreen' ||
      routeName == 'EditProfileScreen' ||
      routeName == 'Chat'
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
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2e64e5',
        // tabBarInactiveTintColor: "gray"
      })}>
      <Tab.Screen
        name="Home"
        component={FeedStack}
        options={({route}) => ({
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarStyle: {display: getTabBarVisibility(route) ? 'flex' : 'none'},
        })}
      />

      <Tab.Screen
        name="Messages"
        component={MessageStack}
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
});
