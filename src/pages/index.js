import { PHASE_PRODUCTION_BUILD } from 'next/dist/shared/lib/constants';
import { useState } from 'react';
import io from 'socket.io-client';
import Peer from '../public/peer.js';

const peer = new Peer();
const socket = window.socket = io();

let room = window.location.hash(substring(1));
if (!room) {
  room = window.location.hash = randomToken();
}

function HomePage() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isInitiator, setIsInitiator] = useState(false);
  const [lastPong, setLastPong] = useState(null);

  useState(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('ippaddr', (ipAddr) => {
      console.log(`Server IP address is: ${ipAddr}`);
    });

    socket.on('created', (room, cliendId) => {
      console.log(`Created room ${room} - my cliend ID is ${cliendId}`);
      setIsInitiator(true);
      peer.setInitiator(true);
    });

    socket.on('joined', (room, clientId) => {
      console.log(`This peer has joined room ${room}, with cliendId ${clientId}`);
      setIsInitiator = false;
      peer.setIntiator(false);
      peer.createPeerConnection();
    });

    socket.on('full', (room) => {
      alert(`Room ${room} is full. We wil create a new room for you.`);
      window.location.hash = '';
      window.location.reload();
    });

    socket.on('ready', () => {
      console.log('Socket is ready');
      peer.createPeerConnection;
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
      sendBtn.disabled = true;
      snapAndSendBtn.disabeld = true;
    });

    socket.on('bye', (room) => {
      console.log(`Peer leaving room ${room}`);
      sendBtn.disabled = true;
      snapAndSendBtn.disabled = true;

      // If peer did not create the room, re-enter to be creator.
      if (!isInitiator) {
        window.location.reload();
      }
    });

    return () => {
      console.log(`Unloading window. Notifying peers in room`);
      socket.emit('bye', room);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    }
  }, []);

  socket.emit('create or join', room);

  if (location.hostname.match(/localhost|127\.0\.0/)) {
    socket.emit('ipAddr');
  }

  return (
    <div>
      <h1>opendrop</h1>

      <h2>
        <span>Room URL: </span><span id="url">...</span>
      </h2>

      <input type="file" id="input" multiple />
      <div id="preview"></div>

      <div id="videoCanvas">
        <video id="video" autoPlay playsInline></video>
        <canvas id="photo"></canvas>
      </div>

      <div id="buttons">
        <button id="snap">Snap</button><span> then </span><button id="send">Send</button>
        <span> or </span>
        <button id="snapAndSend">Snap &amp; Send</button>
      </div>

      <div id="incoming">
        <h2>Incoming photos</h2>
        <button id="trail"></button>
      </div>
    </div>
  );
}

export default HomePage;