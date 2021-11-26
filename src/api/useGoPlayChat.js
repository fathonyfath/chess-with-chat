import { useEffect, useState } from "react";
import useWebsocket from "../websocket/useWebsocket";
import { getGuardUrl } from "./goplay-api";
import GoPlayChatState from "./goplay-chat-state";

const useGoPlayChat = () => {
  const [chatAuth, setChatAuth] = useState(null);
  const [lastChatMessage, setLastChatMessage] = useState(null);
  const [chatState, setChatState] = useState(GoPlayChatState.Idle);

  const onOpenGuardHandler = () => {
    guardWsSend(JSON.stringify({
      action_type: 'join_chat_room',
      iat: Date.now() + (600 * 1000),
      recon: false,
      username: 'anonymous'
    }));
  };

  const guardWs = useWebsocket(onOpenGuardHandler);
  const guardWsLastMessage = guardWs.lastMessage;
  const guardWsConnect = guardWs.connect;
  const guardWsSend = guardWs.send;

  useEffect(() => {
    if (guardWsLastMessage) {
      const data = JSON.parse(guardWsLastMessage.data);
      if (data.action_type === 'join_chat_success') {
        const roomId = data.room_id;
        const token = data.token;
        setChatAuth({ roomId, token });
      };
    }
  }, [guardWsLastMessage]);

  const onOpenChatHandler = () => {
    if (!chatAuth) return;
    chatWsSend(JSON.stringify({
      ct: 10,
      recon: false,
      room_id: chatAuth.roomId,
      token: chatAuth.token
    }));

    setChatState(GoPlayChatState.Connected);
  };

  const onCloseChatHandler = () => {
    if (!chatAuth) return;
    chatWsConnect("wss://gschat.goplay.co.id/chat");
  }

  const chatWs = useWebsocket(onOpenChatHandler, onCloseChatHandler);
  const chatWsLastMessage = chatWs.lastMessage;
  const chatWsConnect = chatWs.connect;
  const chatWsSend = chatWs.send;

  useEffect(() => {
    if (!chatAuth) return;
    chatWsConnect("wss://gschat.goplay.co.id/chat");
  }, [chatAuth, chatWsConnect]);

  useEffect(() => {
    if (chatWsLastMessage) {
      const data = JSON.parse(chatWsLastMessage.data);
      if (data.ct === 20) {
        setLastChatMessage(data);
      }
    }
  }, [chatWsLastMessage]);

  const connect = (eventSlug) => {
    const connectInternal = async (eventSlug) => {
      if (!eventSlug) return;
      const guardUrl = await getGuardUrl(eventSlug);
      if (guardUrl) {
        guardWsConnect(guardUrl);
      }
    }
    connectInternal(eventSlug);
  }

  return { lastChatMessage, chatState, connect };
};

export default useGoPlayChat;