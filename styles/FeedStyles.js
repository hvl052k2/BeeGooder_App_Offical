import {styled} from 'styled-components/native';
import {windowHeight, windowWidth} from '../utils/Dimensions';

export const Container = styled.View`
  flex: 1;
  /* align-items: center; */
  background-color: #fff;
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 10px;
`;

export const Card = styled.View`
  background-color: #f8f8f8;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 10px;
`;

export const UserInfo = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  padding: 15px;
`;

export const UserImg = styled.Image`
  width: 50px;
  height: 50px;
  border-radius: 25px;
`;

export const UserInfoText = styled.View`
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
`;

export const UserName = styled.Text`
  font-size: 14px;
  font-weight: bold;
  font-family: 'Lato-Regular';
`;

export const PostTime = styled.Text`
  font-size: 12px;
  font-family: 'Lato-Regular';
  color: #666;
`;

export const PostText = styled.Text`
  font-size: 14px;
  font-family: 'Lato-Regular';
  padding: 5px 15px 10px 15px;
`;

export const PostImg = styled.ImageBackground`
  width: 100%;
  height: 250px;
  /* margin-top: 15px; */
`;

export const Devider = styled.View`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #ddd;
  width: 92%;
  align-self: center;
  margin-top: 15px;
`;

export const InteractionWrapper = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 15px;
`;

export const Interaction = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: center;
  border-radius: 5px;
  padding: 2px 5px;
  /* background-color: ${props => (props.active ? '#fce9ec' : 'transparent')}; */
`;

export const InteractionText = styled.Text`
  font-size: 12px;
  font-family: 'Lato-Regular';
  font-weight: bold;
  color: ${props => (props.active ? '#e73b54' : '#333')};
  margin-top: 5px;
  margin-left: 5px;
`;

export const FloatFunctionContainer = styled.View`
  position: absolute;
  width: 120px;
  right: 25px;
  top: 15px;
  z-index: 2;
  overflow: hidden;
  border-radius: 10px;
  border-top-width: 1px;
  border-right-width: 1px;
  border-left-width: 1px;
  border-color: #ccc;
`;

export const FloatFunctionButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-bottom-width: 1px;
  border-color: #ccc;
  height: 50px;
`;

export const FloatFunctionText = styled.Text`
  font-size: 16px;
`