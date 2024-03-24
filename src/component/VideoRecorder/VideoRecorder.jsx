import React, {useRef, useState} from "react";
import Webcam from "react-webcam";
import './videoRecorder.css';

const VideoRecorder = () => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const [share, setShare] = useState(false);

    const startRecording = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true, noiseSuppression: true
                }
            });
            const videoTrack = webcamRef.current.video.srcObject.getVideoTracks()[0];
            const combinedStream = new MediaStream([videoTrack, ...audioStream.getAudioTracks()]);

            mediaRecorderRef.current = new MediaRecorder(combinedStream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, {type: "video/webm"});
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            setPaused(false);
            setAudioStream(audioStream);
        } catch (error) {
            console.error("Error accessing user media:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setRecording(false);
            setPaused(false);
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause();
            setPaused(true);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.resume();
            setPaused(false);
        }
    };

    const retakeRecording = () => {
        setVideoUrl(null);
        setRecording(false);
        setPaused(false);
    };

    const showShareOptions = () => {
        setShare(prevShare => !prevShare);
    }

    return (<div className="video-recorder container-fluid position-relative" id='screen'>
        {videoUrl ? (<video controls src={videoUrl} id="playback" className=""/>) : (<Webcam id='webcam'
                                                                                             audio={false}
                                                                                             ref={webcamRef}
                                                                                             screenshotFormat="image/jpeg"
        />)}

        <div id="button-bar" className="w-100 d-flex align-items-center justify-content-center">
            <div className={"w-75 h-auto d-flex align-items-center justify-content-evenly"}>
                <button onClick={startRecording} disabled={recording} id='start-btn'></button>
                <button onClick={pauseRecording} disabled={!recording || paused} id='pause-btn'></button>
                <button onClick={resumeRecording} disabled={!paused} id='resume-btn'></button>
                <button onClick={stopRecording} disabled={!recording} id='stop-btn'></button>
                <button disabled={!videoUrl} onClick={showShareOptions} id='share-btn'></button>

            </div>
        </div>

        <button onClick={retakeRecording} id='retake-btn' className={"position-fixed"}></button>
        {recording && (<div id='indicator' className={paused ? "paused-dot" : "recording-dot"}/>)}

        {share && (<div className={"position-fixed"} id='share-options'>
            <div className={"d-flex align-items-center gap-3 border-bottom me-3 ms-3"}>
                <div></div>
                <h4>WhatsApp</h4>
            </div>
            <div className={"d-flex align-items-center gap-3 border-bottom me-3 ms-3"}>
                <div></div>
                <h4>Email</h4>
            </div>
            <div className={"d-flex align-items-center gap-3 me-3 ms-3"}>
                <div></div>
                <h4>Add to my profile</h4>
            </div>
        </div>)}

    </div>);
};

export default VideoRecorder;