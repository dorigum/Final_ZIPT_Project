import instance from './instance';

// 내 정보 조회
const getMyInfo = async () => {
  const { data } = await instance.get('/members/me');
  return data.data; // ApiResponse.data → GetMemberResponse
};

export { getMyInfo };
