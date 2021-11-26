import { useRef, useState } from "react"

const useWebsocket = (onOpenCallback, onCloseCallback) => {
  const websocketRef = useRef(null);

  const [lastMessage, setLastMessage] = useState(null);

  const connect = (url) => {
    if (!websocketRef.current) {
      try {
        websocketRef.current = new WebSocket(url);
        if (!websocketRef.current) return;

        const websocket = websocketRef.current;
        websocket.onopen = () => {
          if (onOpenCallback) {
            onOpenCallback();
          }
        }

        websocket.onmessage = (e) => {
          setLastMessage(e);
        }

        websocket.onclose = (e) => {
          websocketRef.current = null;
          if (onCloseCallback) {
            onCloseCallback();
          }
        }
      } catch (e) {
        websocketRef.current = null;
      }
    }
  };

  const send = (payload) => {
    if (websocketRef.current) {
      websocketRef.current.send(payload);
    }
  }

  return { lastMessage, connect, send };
};

export default useWebsocket;