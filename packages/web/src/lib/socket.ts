import { io } from 'socket.io-client';
import { getSocketUrl } from './api';

export const socket = io(getSocketUrl(), {
  autoConnect: false
});
