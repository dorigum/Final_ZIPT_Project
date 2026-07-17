import { useEffect, useRef, useState } from 'react';

// 엘리먼트가 뷰포트에 처음 들어오는 순간을 감지해 등장 애니메이션 트리거에 사용
export function useRevealOnScroll(options) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}
