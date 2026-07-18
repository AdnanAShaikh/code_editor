import { io } from "socket.io-client";

export const socket = io("http://localhost:3715/", {
  autoConnect: false, // only connect when user actually uses rooms
});