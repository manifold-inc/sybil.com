'use client';

import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

export default function Countdown() {
  return (
    <div className="scale-[0.8] sm:scale-100 md:scale-125 lg:scale-150 origin-center">
      <FlipClockCountdown 
        to={new Date(1743714000 * 1000)}
        digitBlockStyle={{ 
          fontWeight: 'bold',
          color: '#C5DBFF',
          backgroundColor: '#2A2C33',
        }}
        labelStyle={{
          textTransform: 'uppercase',
          color: '#C5DBFF'
        }}
        separatorStyle={{
          color: '#58E8B4'
        }}
        dividerStyle={{
          color: '#17181F',
          height: '2px'
        }}
      />
    </div>
  );
}