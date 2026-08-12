import { io } from "socket.io-client";

export const socket = io({
  autoConnect: false, // only connect when user actually uses rooms
});