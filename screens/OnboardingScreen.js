import {
    Button,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
  } from "react-native";
  import Onboarding from "react-native-onboarding-swiper";
  
  const Dots = ({ selected }) => {
    let backgroundColor;
    backgroundColor = selected ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.3)";
    return (
      <View
        style={{ width: 5, height: 5, marginHorizontal: 3, backgroundColor }}
      />
    );
  };
  
  const Skip = ({ ...props }) => {
    return (
      <TouchableOpacity style={{ marginHorizontal: 10 }} {...props}>
        <Text style={{ fontSize: 16 }}>Done</Text>
      </TouchableOpacity>
    );
  };
  
  export default OnboardingScreen = ({ navigation }) => {
    return (
      <Onboarding
        DotComponent={Dots}
        DoneButtonComponent={Skip}
        onSkip={() => navigation.replace("Login")}
        onDone={() => navigation.navigate("Login")}
        pages={[
          {
            backgroundColor: "#a6e4d0",
            image: (
              <Image source={require("../assets/images/onboarding-img1.png")} />
            ),
            title: "Connect To Every One",
            subtitle: "A New Way To Connect With Every One",
          },
          {
            backgroundColor: "#fdeb93",
            image: (
              <Image source={require("../assets/images/onboarding-img2.png")} />
            ),
            title: "Find Your Lover",
            subtitle: "Find Your Dream Prince White Horse",
          },
          {
            backgroundColor: "#e9bcbe",
            image: (
              <Image source={require("../assets/images/onboarding-img3.png")} />
            ),
            title: "Become A Good Person",
            subtitle: "Let's build a better world together",
          },
        ]}
      />
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });
  