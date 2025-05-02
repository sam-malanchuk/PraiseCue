import io from 'socket.io-client';

const SERVER = `${window.location.protocol}//${window.location.hostname}:3001`;
export const socket = io(SERVER);
