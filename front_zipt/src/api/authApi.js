import instance from './instance';

// 회원가입
const register = async ({ email, name, password }) => {
  const { data } = await instance.post('/auth/register', { email, name, password });
  return data;
}

// 로그인
const login = async ({ email, password }) => {
  const { data } = await instance.post('/auth/login', { email, password });
  return data;
}


// 토큰 재발급 → refreshToken 쿠키 자동 전송 (withCredentials가 instance에 설정됨)
// 인터셉터 밖(앱 마운트 시 silent refresh)에서만 호출, 인터셉터 내부는 refreshClient 사용
const refresh = async () => {
  const { data } = await instance.post("/auth/refresh");
  return data; // { accessToken: "..." }
};

const logout = async () => {
  await instance.post("/auth/logout");
}
export { register, login, refresh, logout };