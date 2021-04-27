import { Button, View, Text, TextInput } from "react-native";
import React from "react";
import { firebase } from "../../firebase/config";
import SingleMessage from "../ChatMessengerScreen/SingleMessage";
// import { GiftedChat } from "react-native-gifted-chat";
import styles from "../ChatMessengerScreen/styles";

export default class ConversationScreen extends React.Component {
  state = {
    convo: [],
    senderMessage: "",
  };

  getMessagesFromChatroom = async (cb) => {
    const snapshot = await firebase
      .firestore()
      .collection("chatRooms")
      .doc(this.props.roomId)
      .collection("Messages")
      .onSnapshot((querySnapshot) => {
        const conversation = querySnapshot.docs.map((doc) => {
          const firebaseData = doc.data();
          return firebaseData;
          // console.log(firebaseData, "<<<< firebase data");
        });
        // const conversation = {};

        // snapshot.forEach((doc) => {
        //   conversation[doc.id] = doc.data();
        // });
        // const chats = Object.values(conversation);
        cb(conversation);
      });
    // console.log(typeof snapshot);
    return snapshot;
  };

  componentDidMount() {
    this.getMessagesFromChatroom((messages) => {
      this.setState({ convo: messages });
    });
    // .then((messages) => {
    //   console.log(messages());
    //   this.setState({ convo: messages });
    // });
  }

  sendMessage = () => {
    const sender = this.props.senderName;
    const message = this.state.senderMessage;
    const roomId = this.props.roomId;

    firebase
      .firestore()
      .collection("chatRooms")
      .doc(roomId)
      .collection("Messages")
      .add({
        sentBy: sender,
        text: message,
      })
      .then((doc) => {
        firebase
          .firestore()
          .collection("chatRooms")
          .doc(roomId)
          .collection("Messages")
          .doc(doc.id)
          .update({
            id: doc.id,
          });
      });
  };

  onChange = (text) => {
    console.log(text);
    return this.setState({ senderMessage: text });
  };

  render() {
    const { convo } = this.state;
    return (
      <View>
        {convo.map((convObj) => {
          return (
            <SingleMessage
              sentBy={convObj.senderName}
              value={convObj.text}
              key={convObj.id}
            />
          );
        })}
        <TextInput
          style={styles.text_input}
          placeholder="Type your message..."
          placeholderTextColor="#3f3f3f"
          onChangeText={this.onChange}
          clearButtonMode="always"
        ></TextInput>
        <Button title="Send" onPress={() => this.sendMessage()}></Button>
      </View>
    );
  }
}
