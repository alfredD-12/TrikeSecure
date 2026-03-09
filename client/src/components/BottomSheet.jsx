import { useRef, useCallback } from 'react';
import '../styles/BottomSheet.css';

export default function BottomSheet({ id, children }) {
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const startTranslateRef = useRef(0);

  const onTouchStart = useCallback((e) => {
    startYRef.current = e.touches[0].clientY;
    sheetRef.current.style.transition = 'none';
    const matrix = new DOMMatrix(window.getComputedStyle(sheetRef.current).transform);
    startTranslateRef.current = matrix.m42;
  }, []);

  const onTouchMove = useCallback((e) => {
    let delta = e.touches[0].clientY - startYRef.current;
    let newY = startTranslateRef.current + delta;
    if (newY < 0) newY = 0;
    sheetRef.current.style.transform = `translateY(${newY}px)`;
  }, []);

  const onTouchEnd = useCallback(() => {
    sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    const matrix = new DOMMatrix(window.getComputedStyle(sheetRef.current).transform);
    const finalY = matrix.m42;
    const height = sheetRef.current.offsetHeight;
    if (finalY > height * 0.3) {
      sheetRef.current.style.transform = `translateY(${height - 100}px)`;
    } else {
      sheetRef.current.style.transform = 'translateY(0px)';
    }
  }, []);

  // expose a reset method via the DOM element id
  // parent can do: document.getElementById(id + '-sheet').resetSheet?.()
  const reset = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      sheetRef.current.style.transform = 'translateY(0px)';
    }
  }, []);

  return (
    <div id={id + '-sheet'} className="sheet-wrapper" ref={sheetRef}
      style={{ '--reset': reset }}>
      {/* Drag Handle */}
      <div
        className="drag-handle"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-14 h-1.5 bg-gray-300 rounded-full" />
      </div>
      <div className="sheet-content hide-scrollbar">
        {children}
      </div>
    </div>
  );
}
