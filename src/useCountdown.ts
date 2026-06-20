import { useState, useEffect, useCallback, useRef } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDateStr: string, targetTimeStr: string, isPreview: boolean, isPaused: boolean = false): TimeLeft {
  const getTargetDate = useCallback(() => {
    if (!targetDateStr || !targetTimeStr) return new Date();
    return new Date(`${targetDateStr}T${targetTimeStr}`);
  }, [targetDateStr, targetTimeStr]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    isExpired: false
  });

  const requestRef = useRef<number>(null);

  const calculateTimeLeft = useCallback(() => {
    const target = getTargetDate().getTime();
    const now = Date.now();
    const difference = target - now;

    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0, isExpired: true });
      return;
    }

    setTimeLeft({
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      milliseconds: Math.floor((difference % 1000)),
      isExpired: false
    });
  }, [getTargetDate]);

  useEffect(() => {
    if (isPaused) return;

    const target = getTargetDate().getTime();
    if (Date.now() >= target) {
      calculateTimeLeft(); // Ensure expired state is immediately set
      return;
    }

    const update = () => {
      const difference = getTargetDate().getTime() - Date.now();
      calculateTimeLeft();
      
      if (difference > 0) {
        requestRef.current = requestAnimationFrame(update);
      }
    };
    
    // We use RAF for high precision, especially when showing MS
    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [calculateTimeLeft, isPreview, isPaused]);

  return timeLeft;
}
