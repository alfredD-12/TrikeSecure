import { useRef, useCallback } from 'react';
import '../styles/BottomSheet.css';

export default function BottomSheet({ id, children }) {
  const sheetRef = useRef(null);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startTranslateRef = useRef(0);

  const getCurrentTranslateY = useCallback(() => {
    const transform = window.getComputedStyle(sheetRef.current).transform;
    if (!transform || transform === 'none') return 0;
    return new DOMMatrix(transform).m42;
  }, []);

  const onPointerDown = useCallback((e) => {
    if (!sheetRef.current) return;
    draggingRef.current = true;
    startYRef.current = e.clientY;
    sheetRef.current.style.transition = 'none';
    startTranslateRef.current = getCurrentTranslateY();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current || !sheetRef.current) return;
    let delta = e.clientY - startYRef.current;
    let newY = startTranslateRef.current + delta;
    if (newY < 0) newY = 0;
    sheetRef.current.style.transform = `translateY(${newY}px)`;
  }, []);

  const onPointerEnd = useCallback(() => {
    if (!draggingRef.current || !sheetRef.current) return;
    draggingRef.current = false;
    sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    const finalY = getCurrentTranslateY();
    const height = sheetRef.current.offsetHeight;
    if (finalY > height * 0.3) {
      sheetRef.current.style.transform = `translateY(${height - 100}px)`;
    } else {
      sheetRef.current.style.transform = 'translateY(0px)';
    }
  }, [getCurrentTranslateY]);

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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="w-14 h-1.5 bg-gray-300 rounded-full" />
      </div>
      <div className="sheet-content hide-scrollbar">
        {children}
      </div>
    </div>
  );
}
