import { randomToken } from '../lib/utils';
import { peer } from './peer';
import { socket } from './socket';

export function initSocket(setIsConnected, setIsInitiator, isInitiator) {
  let room = window.location.hash.substring(1);
  if (!room) {
    room = window.location.hash = randomToken();
  }

  socket.on('connect', () => {
    setIsConnected(true);
  });

  socket.on('disconnect', () => {
    setIsConnected(false);
  });

  socket.on('ipaddr', (ipAddr) => {
    console.log(`Server IP address is: ${ipAddr}`);
  });

  socket.on('created', (room, cliendId) => {
    console.log(`Created room ${room} - my cliend ID is ${cliendId}`);
    setIsInitiator(true);
    peer.setInitiator(true);
  });

  socket.on('joined', (room, clientId) => {
    console.log(`This peer has joined room ${room}, with cliendId ${clientId}`);
    setIsInitiator(false);
    peer.setInitiator(false);
    peer.createPeerConnection();
  });

  socket.on('full', (room) => {
    alert(`Room ${room} is full. We wil create a new room for you.`);
    window.location.hash = '';
    window.location.reload();
  });

  socket.on('ready', () => {
    console.log('Socket is ready');
    peer.createPeerConnection();
  });

  socket.on('log', (array) => {
    console.log.apply(console, array);
  });

  socket.on('message', (message) => {
    console.log('Client received message: ', message);
    peer.signalingMessageCallback(message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected: ', reason);
  });

  socket.on('bye', (room) => {
    console.log(`Peer leaving room ${room}`);

    // If peer did not create the room, re-enter to be creator.
    // @TODO currently not working
    if (!isInitiator) {
      window.location.reload();
    }
  });

  socket.emit('create or join', room);

  if (location.hostname.match(/localhost|127\.0\.0/)) {
    socket.emit('ipAddr');
  }

  return function unsubscribeSocket() {
    console.log(`Unloading window. Notifying peers in room`);
    socket.emit('bye', room);
    socket.off('connect');
    socket.off('disconnect');
    socket.off('ipaddr');
    socket.off('created');
    socket.off('joined');
    socket.off('full');
    socket.off('ready');
    socket.off('log');
    socket.off('message');
    socket.off('disconnect');
    socket.off('bye');
  };
}
