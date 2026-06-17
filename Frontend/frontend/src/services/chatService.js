/*  import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/chat`;

export const sendChatMessage = async (message, history = []) => {
  const res = await axios.post(API, { message, history });
  return res.data;
}; */
// ✅ Sends message with sessionId — backend handles conversation memory
export const sendChatMessage = async (message, sessionId) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
};