'use client';

import { useState, useEffect } from 'react';

const CountdownTimer = ({ hours = 0, minutes = 0, seconds = 0, onTimeUp }: any) => {
  const [time, setTime] = useState(hours * 3600 + minutes * 60 + seconds);

  useEffect(() => {
    if (time <= 0) {
      if (onTimeUp) {
        onTimeUp(); // Panggil callback ketika waktu habis
      }
      return;
    }

    const interval = setInterval(() => {
      setTime((prevTime: any) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval); // Bersihkan interval saat komponen unmount
  }, [time]);

  const formatTime = (time: any) => {
    const hrs = String(Math.floor(time / 3600)).padStart(2, '0');
    const mins = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const secs = String(time % 60).padStart(2, '0');
    return { hrs, mins, secs };
  };

  const { hrs, mins, secs } = formatTime(time);

  return (
    <div className="border p-5 rounded-lg flex-col">
      <span className="font-bold mb-5">Remaining Time</span>

      <div className="flex justify-center mt-5 items-center gap-2">
        <span className="text-4xl font-thin font-mono">{hrs}</span>
        <span>:</span>
        <span className="text-4xl font-thin font-mono">{mins}</span>
        <span>:</span>
        <span className="text-4xl font-thin font-mono">{secs}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
