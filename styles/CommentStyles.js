import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

export const CommentCard = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  padding: 10px 10px 10px 20px;
`;

export const UserImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 25px;
`;

export const UserImageReply = styled.Image`
  width: 30px;
  height: 30px;
  border-radius: 15px;
`;

export const ContentWarapper = styled.View`
  padding-left: 8px;
  flex: 1;
`;

export const UserName = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

export const CommentText = styled.Text``;

export const CommentContainerWrapper = styled.View`
  width: 100%;
  padding: 15px;
  border-top-width: 1px;
  border-color: #ccc;
  /* align-items: center; */
  /* justify-content: center; */
`;

export const CommentInputField = styled.TextInput`
  width: 90%;
  border-width: 1px;
  border-color: #ccc;
  border-radius: 15px;
  margin-right: 10px;
  padding: 5px 10px;
`;

export const CommentTime = styled.Text`
  font-size: 12px;
  font-family: 'Lato-Regular';
  color: #666;
  margin-left: 3px;
`;
