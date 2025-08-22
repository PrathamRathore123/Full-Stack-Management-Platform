import React, { useState, useEffect, useRef } from 'react';
import './CourseDetail.css';
import { FaLock } from 'react-icons/fa';

const YouTubePlayer = ({ 
  videoId, 
  title, 
  isEnrolled, 
  previewDuration, 
  onPreviewEnd 
}) => {
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Load YouTube API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (playerRef.current && window.YT && window.YT.Player) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
      
      setPlayer(newPlayer);
    } else {
      // If YouTube API isn't ready yet, try again in 100ms
      setTimeout(initializePlayer, 100);
    }
  };

  const onPlayerReady = (event) => {
    // Start timer to track video progress
    if (!isEnrolled) {
      timerRef.current = setInterval(() => {
        if (player && player.getCurrentTime) {
          const time = player.getCurrentTime();
          setCurrentTime(time);
          
          // Check if preview time limit is reached
          if (time >= previewDuration) {
            clearInterval(timerRef.current);
            player.pauseVideo();
            setShowPaymentPrompt(true);
            onPreviewEnd();
          }
        }
      }, 1000);
    }
  };

  const onPlayerStateChange = (event) => {
    // Track when video is playing
    if (event.data === window.YT.PlayerState.PLAYING && !isEnrolled) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          if (player && player.getCurrentTime) {
            const time = player.getCurrentTime();
            setCurrentTime(time);
            
            // Check if preview time limit is reached
            if (time >= previewDuration) {
              clearInterval(timerRef.current);
              player.pauseVideo();
              setShowPaymentPrompt(true);
              onPreviewEnd();
            }
          }
        }, 1000);
      }
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // Clear interval when video is paused
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <div className="youtube-player-container">
      {showPaymentPrompt ? (
        <div className="payment-prompt">
          <div className="payment-prompt-content">
            <h3>Preview Ended</h3>
            <p>To continue watching this course, you need to enroll.</p>
            <button 
              className="enroll-button"
              onClick={onPreviewEnd}
            >
              Enroll Now
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="video-wrapper">
        <div ref={playerRef} id={`youtube-player-${videoId}`}></div>
      </div>
      
      <div className="video-info">
        <h3>{title}</h3>
        {!isEnrolled && (
          <div className="preview-info">
            <FaLock /> Preview: {Math.floor(previewDuration / 60)}:{(previewDuration % 60).toString().padStart(2, '0')} minutes
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;