import Peer from 'peerjs';

// Inside your hook
const [myPeer, setMyPeer] = useState(null);
const [remoteStream, setRemoteStream] = useState(null);

useEffect(() => {
    const peer = new Peer(); // Creates a unique ID for voice
    setMyPeer(peer);

    peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            call.answer(stream); // Answer the call with your mic
            call.on('stream', (userStream) => {
                // Play your friend's voice
                const audio = new Audio();
                audio.srcObject = userStream;
                audio.play();
            });
        });
    });
}, []);