import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const VideoRecorder = () => {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [paused, setPaused] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [audioStream, setAudioStream] = useState(null);

    const startRecording = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true, // Enable echo cancellation
                    noiseSuppression: true // Enable noise suppression
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
                const blob = new Blob(chunks, { type: "video/webm" });
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
    };

    return (
        <div>
            {videoUrl ? (
                <video controls src={videoUrl} />
            ) : (
                <Webcam
                    audio={false} // Enable audio capture
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                />
            )}
            <div>
                <button onClick={startRecording} disabled={recording}>Start Recording</button>
                <button onClick={pauseRecording} disabled={!recording || paused}>Pause Recording</button>
                <button onClick={resumeRecording} disabled={!paused}>Resume Recording</button>
                <button onClick={stopRecording} disabled={!recording}>Stop Recording</button>
                <button onClick={retakeRecording}>Retake</button>
            </div>
        </div>
    );
};

export default VideoRecorder;











