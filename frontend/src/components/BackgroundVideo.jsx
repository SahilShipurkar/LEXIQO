import React from 'react';
import videoBg from '../assets/video_rs.webm';

const BackgroundVideo = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover blur-[1px] opacity-60"
      >
        <source src={videoBg} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/20 to-[#030712]" />
    </div>
  );
};

export default BackgroundVideo;
