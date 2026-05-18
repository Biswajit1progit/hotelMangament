 import axios from "axios";

const API = `${process.env.REACT_APP_API_URL}/api/chat`;

export const sendChatMessage = async (message, history = []) => {
  const res = await axios.post(API, { message, history });
  return res.data;
};