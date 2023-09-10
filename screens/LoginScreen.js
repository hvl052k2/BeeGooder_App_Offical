import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import FormButton from "../components/FormButton";
import FormInput from "../components/FormInput";
import SocialButton from "../components/SocialButton";
import { useState, useContext } from "react";
import { AuthContext } from "../navigation/AuthProvider.android";

export default LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const {login, googleLogin, fbLogin} = useContext(AuthContext)

  return (
    <View style={styles.container}>
      <Icon name="logo-octocat" size={120} color="purple" />
      <Text style={styles.title}>LOG IN</Text>

      <FormInput
        lableValue={email}
        onChangeText={(userEmail) => {
          setEmail(userEmail);
        }}
        placeHolderText="Email"
        iconType="person-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FormInput
        lableValue={password}
        onChangeText={(userPassword) => {
          setPassword(userPassword);
        }}
        placeHolderText="Password"
        iconType="lock-closed-outline"
        secureTextEntry={visible}
      >
        <View style={styles.iconStyle}>
          <Icon
            name={visible ? "eye-outline" : "eye-off-outline"}
            size={25}
            color="#666"
            onPress={() => {
              setVisible(!visible);
            }}
          />
        </View>
      </FormInput>

      <FormButton
        buttonTitle="Sign In"
        onPress={() => login(email, password)}
      />

      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.text}>Forgot Password?</Text>
      </TouchableOpacity>

      <SocialButton
        buttonTitle="Sign in with facebook"
        btnType="logo-facebook"
        color="#4867aa"
        backgroundColor="#e6eaf4"
        onPress={() => fbLogin()}
      />

      <SocialButton
        buttonTitle="Sign in with google"
        btnType="logo-google"
        color="#de4d41"
        backgroundColor="#f5e7ea"
        onPress={() => googleLogin()}
      />

      <View style={styles.navButton}>
        <Text style={styles.text}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.navButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
    color: "purple",
    fontWeight: "600",
  },
  iconStyle: {
    padding: 10,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
  },
  navButton: {
    marginTop: 30,
    flexDirection: "row",
  },
  forgotButton: {
    marginVertical: 30,
    flexDirection: "row",
  },
  text: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2e64e5",
  },
  navButtonText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2e64e5",
    textDecorationLine: "underline",
  },
});
