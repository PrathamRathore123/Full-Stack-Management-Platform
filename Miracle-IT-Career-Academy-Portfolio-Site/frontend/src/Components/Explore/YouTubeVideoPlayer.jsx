import React, { useEffect, useRef } from 'react';

const YouTubeVideoPlayer = ({ 
  videoId, 
  isEnrolled, 
  previewDuration, 
  onPreviewEnd 
}) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
    };
  }, [videoId]);

  const initPlayer = () => {
    if (!window.YT || !window.YT.Player) {
      setTimeout(initPlayer, 100);
      return;
    }

    if (playerRef.current) {
      playerInstance.current = new window.YT.Player(playerRef.current, {
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
    }
  };

  const onPlayerReady = (event) => {
    // Start timer to track video progress if not enrolled
    if (!isEnrolled) {
      timerRef.current = setInterval(() => {
        if (playerInstance.current && playerInstance.current.getCurrentTime) {
          const currentTime = playerInstance.current.getCurrentTime();
          
          // Check if preview time limit is reached
          if (currentTime >= previewDuration) {
            clearInterval(timerRef.current);
            playerInstance.current.pauseVideo();
            onPreviewEnd();
          }
        }
      }, 1000);
    }
  };

  const onPlayerStateChange = (event) => {
    // Track when video is playing
    if (!isEnrolled) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        if (!timerRef.current) {
          timerRef.current = setInterval(() => {
            if (playerInstance.current && playerInstance.current.getCurrentTime) {
              const currentTime = playerInstance.current.getCurrentTime();
              
              // Check if preview time limit is reached
              if (currentTime >= previewDuration) {
                clearInterval(timerRef.current);
                playerInstance.current.pauseVideo();
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
    }
  };

  return <div ref={playerRef} id={`youtube-player-${videoId}`} style={{ width: '100%', height: '100%' }}></div>;
};

export default YouTubeVideoPlayer;