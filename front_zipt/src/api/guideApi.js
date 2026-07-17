import axios from 'axios';
import guideData from '../mocks/guides.json';

const getPublicApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  return import.meta.env.DEV ? '/api' : (configuredUrl || '/api');
};

const publicInstance = axios.create({
  baseURL: getPublicApiBaseUrl(),
  timeout: 60000,
  withCredentials: true,
});

const LOCAL_GUIDES = Array.isArray(guideData?.guides) ? guideData.guides : [];

const normalizeGuides = (data) => {
  const payload = data?.data ?? data;
  return payload?.guides ?? payload?.content ?? (Array.isArray(payload) ? payload : []);
};

const filterLocalGuides = ({ category, q } = {}) => {
  const query = String(q || '').trim().toLowerCase();

  return LOCAL_GUIDES.filter((guide) => {
    const categoryMatches = !category || category === 'all' || guide.category === category;
    const queryTarget = [
      guide.title,
      guide.summary,
      guide.content,
      guide.source,
      guide.sourceNote,
      ...(Array.isArray(guide.tags) ? guide.tags : []),
    ].filter(Boolean).join(' ').toLowerCase();
    const queryMatches = !query || queryTarget.includes(query);

    return categoryMatches && queryMatches;
  });
};

// 부동산 계약 가이드 목록 조회. API 실패 시 로컬 백업 데이터를 사용한다.
const listGuides = async (params = {}) => {
  const { category, q } = params;

  try {
    const { data } = await publicInstance.get('/guides', { params: { category, q } });
    return normalizeGuides(data);
  } catch (error) {
    console.warn('[ZIPT Guide] API 호출 실패로 로컬 가이드 데이터를 사용합니다.', error);
    return filterLocalGuides({ category, q });
  }
};

export { listGuides };
