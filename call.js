let localVideo = document.getElementById("local-video")

let remoteVideo = document.getElementById("remote-video")

localVideo.style.opacity = 0

remoteVideo.style.opacity = 0

localVideo.onplaying = () => { localVideo.style.opacity = 1 }

remoteVideo.onplaying = () => { remoteVideo.style.opacity = 1 }

var cam = 0;

var ID1;

var ID2;

var VideoTracks=[];

var AudioTracks=[];

navigator.mediaDevices.enumerateDevices().then((device)=>{

    for(var i=0; i < device.length; i++) {

        if(device[i].kind=='videoinput') {

            VideoTracks[VideoTracks.length] = device[i];

        }

    }

    for(var i=0; i < device.length; i++) {

        if(device[i].kind=='audiooutput') {

            AudioTracks[AudioTracks.length] = device[i];

        }

    }

    alert('Cams:'+VideoTracks.length)

    alert('Audios:'+AudioTracks.length)

    alert('Loaded');

});

let peer

function init(userId) {

    ID1 = userId

    peer = new Peer(userId, {

        host: 'd-call.herokuapp.com',

        port: 443,

        secure: true

    })

    

    peer.on('open',(id)=>{

        alert('Initialised')

    })
    

    listen()

}

let localStream

function listen() {
    peer.on('call', (remoteCall) => {
        
        ID2 = remoteCall.peer

        navigator.getUserMedia({
            audio: true, 
            video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localStream = null
            localStream = stream
            localVideo.srcObject = localStream

            remoteCall.answer(localStream)

            listenStream(remoteCall)

        })
        
    })
}

function startWebCall(ID) {

    let tmr = setInterval(startCall(ID+" web"), 1500);

}

function startCall(otherUserId) {

    ID2 = otherUserId

    alert('Calling:'+otherUserId)

    navigator.getUserMedia({
        audio: true,
        video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localStream = null
            localStream = stream
            localVideo.srcObject = localStream

        const localCall = peer.call(otherUserId, localStream)

        listenStream(localCall)

    })
}

function listenStream(call) {
    call.on('stream', (remoteStream) => {
            
        remoteVideo.srcObject = remoteStream
    
        remoteVideo.className = "primary-video"
        localVideo.className = "secondary-video"
    })
}

function toggleVideo(b) {

    if (b == "true") {

        localStream.getVideoTracks()[0].enabled = true

    } else {

        localStream.getVideoTracks()[0].enabled = false

    }

} 

function toggleAudio(b) {

    if (b == "true") {

        localStream.getAudioTracks()[0].enabled = true

    } else {

        localStream.getAudioTracks()[0].enabled = false

    }

}

function switchCam(c) {
    
    localStream.getTracks().forEach((track)=> {

        if (track.readyState == 'live') {

            track.stop();
            
        }
    });

    if(c != -1) {

        cam = c;
        
        peer._connections.values().next().value[0].close()
        
        startCall(ID2)

    }
    
}
