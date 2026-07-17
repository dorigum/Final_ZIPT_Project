let kakaoSdkPromise = null;

export function loadKakao() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Maps SDK requires a browser."));
  }

  if (window.kakao?.maps?.services) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoSdkPromise) {
    return kakaoSdkPromise;
  }

  const key = import.meta.env.VITE_KAKAO_MAP_KEY || "";

  if (!key) {
    return Promise.reject(new Error("VITE_KAKAO_MAP_KEY is empty."));
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      try {
        window.kakao.maps.load(() => resolve(window.kakao));
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK."));

    document.head.appendChild(script);

    window.setTimeout(() => {
      reject(new Error("Kakao Maps SDK load timed out."));
    }, 8000);
  });

  return kakaoSdkPromise;
}
