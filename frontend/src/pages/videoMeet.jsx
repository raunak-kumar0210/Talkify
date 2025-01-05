import React from "react";
import  "../styles/videoComponent.css";
import { useState, useEffect, useRef } from "react";
import {TextField, Button } from '@mui/material';
// import { Server } from "socket.io";
import { io } from "socket.io-client";



const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

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

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])


    // TODO
    // if(isChrome() === false) {
    // }


    const getPermissions = async () => { 
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});

            if(videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});

            if(audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable , audio: audioAvailable});

                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch(err) {
            console.error(err);
        }
    }


    useEffect(() => {
        getPermissions();
    }, []);

    //TODO
    let getMessageFromServer = (fromId, message) => {

    }

    //TODO 
    let addMessage = () => {

    }


    let getUserMediaSuccess = (stream) => {

        socketRef.current = io.connect(server_url, { secure:false})

        socketRef.current.on('signal' , getMessageFromServer);

        socketRef.current.on("connect", () => {

            // console.log("connected to the server with id : " , socketRef.current.id)

            socketRef.current.emit("join-call", window.location.href)

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                
                setVideo((videos) => videos.filter((video) => video.socketId !== id))

            })

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)


                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].oneaddstream = (event) => {

                        let videoExists = videoRef.current.find(video => video.sockeid === socketListId);

                        if (videoExists) {
                            setVideo(videos => {
                                const updateVideos = videos.map(video => 
                                    video.socket === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updateVideos;
                                return updateVideos;
                                
                            })
                        } else {

                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playinline: true
                            }

                            setVideos(videos => {
                                const updateVideos = [...videos, newVideo];
                                videoRef.current = updateVideos;
                                return updateVideos;
                            })
                        }

                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localstream);
                    } else {
                        //TODO BLACKSILENCE
                        // let BlackSilence
                    }

                })

                if (id === socketIdRef.current) {
                    for(let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        }
                        catch (e) {

                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription}))
                            })
                            .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio})
                .then(getUserMediaSuccess) //todo: getUserMediaSuccess
                .then(stream => { })
                .catch(e =>  console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e)
            }
        }

    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video])

    let connectToSocketServer = () => {

        socketIdRef.current = io.connect(server_url, { secure: false})


    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="Outlined" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={ connect }>Connect</Button>


                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>
                </div> : <></> }
        </div>
    )
}


