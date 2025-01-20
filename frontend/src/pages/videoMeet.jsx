import React, { useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import { TextField, Button, IconButton, Badge } from "@mui/material";
// import { Server } from "socket.io";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css"
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from "react-router-dom";
import server from "../environment"
import CloseIcon from '@mui/icons-material/Close';

const server_url = server;

var connections = {};

const peerConfigConnections = {
  "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

 

  useEffect(() => {
      getPermissions();
  }, []); 

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoPermission) {
        setVideoAvailable(true);
        // console.log('Video permission granted');
      } else {
        setVideoAvailable(false);
        // console.log('Video permission denied');
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (audioPermission) {
        setAudioAvailable(true);
        // console.log('Audio permission granted');
      } else {
        setAudioAvailable(false);
        // console.log('Audio permission denied');
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.gettracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            // console.log(`Set remote description for ${fromId}`, signal.sdp);
            if (signal.sdp.type === "offer") {
              
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  // console.log(`Created answer for ${fromId}`, description);
                  return connections[fromId].setLocalDescription(description)
                })
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    fromId,
                    JSON.stringify({
                      sdp: connections[fromId].localDescription,
                    })
                  );
                })
                .catch((e) => console.log(e));
              }
            })
            .catch((e) => console.log(e));
        }

        if (signal.ice) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log(e));
        }
      }
    };


  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false })

    socketRef.current.on('signal', getMessageFromServer)

    socketRef.current.on('connect', () => {
        socketRef.current.emit('join-call', window.location.href)
        socketIdRef.current = socketRef.current.id

        socketRef.current.on('chat-message', addMessage)

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketRef.current.on('user-joined', (id, clients) => {
            clients.forEach((socketListId) => {

                connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                // Wait for their ice candidate       
                connections[socketListId].onicecandidate = function (event) {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                    }
                }

                // Wait for their video stream
                connections[socketListId].onaddstream = (event) => {
                    // console.log("BEFORE:", videoRef.current);
                    // console.log("FINDING ID: ", socketListId);

                    let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                    if (videoExists) {

                        // console.log("FOUND EXISTING");
                        // Update the stream of the existing video
                        setVideos(videos => {
                            const updatedVideos = videos.map(video =>
                                video.socketId === socketListId ? { ...video, stream: event.stream } : video
                            );
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    } else {

                        // Create a new video
                        // console.log("CREATING NEW");
                        let newVideo = {
                            socketId: socketListId,
                            stream: event.stream,
                            autoplay: true,
                            playsinline: true,
                            username: username
                        };

                        

                        setVideos(videos => {
                            const updatedVideos = [...videos, newVideo];
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    }
                };


                // Add the local video stream
                if (window.localStream !== undefined && window.localStream !== null) {
                    connections[socketListId].addStream(window.localStream)
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    connections[socketListId].addStream(window.localStream)
                }
            })

            if (id === socketIdRef.current) {
                for (let id2 in connections) {
                    if (id2 === socketIdRef.current) continue

                    try {
                        connections[id2].addStream(window.localStream)
                    } catch (e) { }

                    connections[id2].createOffer().then((description) => {
                        connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }
        })
    })
  }
  

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess) 
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
      // console.log("SET STATE HAS ", video, audio);
    }
  }, [audio, video]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  let handleVideo = () => {
    setVideo(!video);
  }


  let handleAudio = () => {
    setAudio(!audio);
  }

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stream)

    } catch (e) {console.log(e)}

  window.localStream = stream;
  localVideoRef.current.srcobject = stream;

  for (let id in connections) {
    if (id === socketIdRef.current) continue;

    connections[id].addStream(window.localStream)
    connections[id].createOffer().then((description) => {
      connections[id].setLocalDescription(description)
      .then(() => {
        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
      })
      .catch(e => console.log(e))
    })
  }
  stream.getTracks().forEach(
    (track) =>
      (track.onended = () => {
        setScreen(false);

        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (e) {
          console.log(e);
        }

        let blackSilence = (...args) =>
          new MediaStream([black(...args), silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      })
    )
  }
  
  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
              .then(getDisplayMediaSuccess)
              .then((stream) => { })
              .catch((e) => console.log(e))
      }
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen])

  let handleScreen = () => {
    setScreen(!screen);
  };
  
  //TODO
  let addMessage = (data, sender, socketIdSender) => {

    setMessages((prevMessages) => [
      ...prevMessages,
      {sender: sender, data: data},
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1)
    }
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  }
  
  let handleEndCall = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    }
    catch (e) {}
    routeTo("/home");
  }

  useEffect(() => {
    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        if (window.localStream) {
            window.localStream.getTracks().forEach((track) => track.stop());
        }
    };
}, []);


  return (
    <div>
      {askForUsername === true ? (

        <div>

          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
          
        </div>  ) : ( 

        <div className={styles.meetVideoConatiner}>

          {showModal ? 
          <div className={styles.chatRoom}>
            <div className={styles.chatConatiner}>
              <div className={styles.chatNav}>
                <h1>Chat</h1>
                <CloseIcon onClick = {() => setModal(!showModal)}/>
              </div>
              
              <div className={styles.chattingDisplay}>
                { messages.length !== 0 ? messages.map((item, index) => {

                  // console.log(messages)
                  return (
                    <div style={{ marginBottom: "20px"}} key={index}>
                      <p style={{fontWeight: "bold"}}>{item.sender}</p>
                      <p>{item.data}</p>
                    </div>
                  )}
                ) : <p>no  messages yet</p>  }

              </div>

              <div className={styles.chattingArea}>
                <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" />
                <Button onClick={sendMessage} variant="contained">Send</Button>
              </div>

            </div>
      
          </div> : <></> }

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} className={styles.largeButton}>
              {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/>}
            </IconButton >
            <IconButton onClick={handleEndCall} style={{color: "red"}} className={styles.largeButton}>
              <CallEndIcon></CallEndIcon>
            </IconButton>
            <IconButton onClick={handleAudio} className={styles.largeButton}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? 
            <IconButton onClick={handleScreen} className={styles.largeButton}>
              {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
            </IconButton> : <></>} 

          <Badge badgeContent={newMessages} max={999} >
            <IconButton onClick = {() => setModal(!showModal)} className={styles.largeButton}>
              <ChatIcon />
            </IconButton>
          </Badge>
            
          </div>

          <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
          <h2>{video.username}</h2>

          <div className = {styles.conferenceView} >
            {videos.map((video, index) => (
              <div  key={`${video.socketId}-${index}`}>
                

                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
                <h2>{video.username}</h2>

              </div>

            ))}
          </div>

        </div>
      )}
    </div>
  );
}

