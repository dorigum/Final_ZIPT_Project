import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icon, Logo, Button } from "./index.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import { logout as logoutApi } from "../../api/authApi";
import styles from "./Header.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";
import profile1 from "../../assets/profiles/profile_1.png?w=120&format=webp";
import profile2 from "../../assets/profiles/profile_2.png?w=120&format=webp";
import profile3 from "../../assets/profiles/profile_3.png?w=120&format=webp";

const NAV_ITEMS = [
  { key: "home", label: "홈", icon: "home", path: "/" },
  { key: "upload", label: "등기부등본 분석", icon: "doc", path: "/analysis", protected: true },
  { key: "compare", label: "임대차계약서 분석", icon: "file-signature", path: "/contract", protected: true },
  { key: "guide", label: "부동산 가이드", icon: "flag", path: "/guide" },
  { key: "terms", label: "용어 정리ZIP", icon: "book", path: "/terms" },
  { key: "infra", label: "인프라 브리핑", icon: "map", path: "/map" },
  { key: "links", label: "유용한 사이트", icon: "info", path: "/links" },
];
const REDIRECT_STORAGE_KEY = "zipt_post_login_redirect";

const getProfileImage = (username) => {
  if (!username) return profile1;
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;
  return [profile1, profile2, profile3][index];
};

function NavItem({ item, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const selected = active === item.key;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`top-nav-item ${styles.stateButton01}`}
      aria-current={selected ? "page" : undefined}
      style={{
        "--state-button01-background": toCssVariable(selected ? "var(--primary-soft)" : hovered ? "var(--surface-2)" : "transparent"),
        "--state-button01-color": toCssVariable(selected ? "var(--primary-700)" : "var(--ink-2)")
      }}
    >
      <Icon name={item.icon} size={17} stroke={selected ? 2.2 : 1.9} />
      <span className={styles.stateText01} style={{ "--state-text01-font-weight": selected ? 700 : 600 }}>
        {item.label}
      </span>
    </button>
  );
}

function AccountActions({
  isAuthenticated,
  profileImg,
  displayName,
  location,
  onLogin,
  onSignup,
  onMypage,
  onLogout,
}) {
  return isAuthenticated ? (
    <>
      <button type="button" className="profile-button" onClick={onMypage}>
        <img
          src={profileImg}
          alt="프로필"
          className="profile-avatar"
          style={{ objectFit: "cover", border: "1px solid rgba(255,255,255,.2)" }}
        />
        <span className="profile-name">{displayName}님</span>
      </button>
      <button
        type="button"
        className="header-icon-button"
        onClick={onLogout}
        title="로그아웃"
        aria-label="로그아웃"
      >
        <Icon name="logout" size={18} />
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        onClick={onLogin}
        className="header-login-button"
        style={{
          color: location.pathname === "/login" ? "var(--primary-700)" : "var(--ink-2)",
        }}
      >
        로그인
      </button>
      <Button size="sm" onClick={onSignup}>
        회원가입
      </Button>
    </>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const setRedirectUrl = useAuthStore((state) => state.setRedirectUrl);
  const beginLogout = useAuthStore((state) => state.beginLogout);
  const finishLogout = useAuthStore((state) => state.finishLogout);
  const logout = useAuthStore((state) => state.logout);
  const member = useAuthStore((state) => state.member);
  
  // 현재 URL 경로를 기준으로 active 탭 자동 매핑
  const [activeTab, setActiveTab] = useState("home");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const pathname = location.pathname;
    const matchedItem = NAV_ITEMS.find((item) => {
      if (item.path === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(item.path);
    });
    if (matchedItem) {
      setActiveTab(matchedItem.key);
    } else {
      setActiveTab("");
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const displayName = member?.name || "사용자";
  const profileImg = getProfileImage(displayName);

  const handleMenuClick = (item) => {
    if (item.protected && !isAuthenticated) {
      openAuthModal(item.path);
      setIsMobileMenuOpen(false);
      return;
    }
    navigate(item.path);
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const returnPath = ["/login", "/signup"].includes(location.pathname) ? "/" : currentPath;
    setRedirectUrl(returnPath);
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, returnPath);
    navigate("/login", { state: { from: returnPath } });
    setIsMobileMenuOpen(false);
  };

  const handleSignupClick = () => {
    navigate("/signup");
    setIsMobileMenuOpen(false);
  };

  const handleMypageClick = () => {
    navigate("/mypage");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    beginLogout();
    closeAuthModal();
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    }
    logout();
    navigate("/", { replace: true });
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
    finishLogout();
  };
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand-button" aria-label="ZIPT 홈">
          <Logo size={25} />
        </Link>

        <nav className="top-nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeTab}
              onClick={() => handleMenuClick(item)}
            />
          ))}
        </nav>

        <div className="header-account">
          <AccountActions
            isAuthenticated={isAuthenticated}
            profileImg={profileImg}
            displayName={displayName}
            location={location}
            onLogin={handleLoginClick}
            onSignup={handleSignupClick}
            onMypage={handleMypageClick}
            onLogout={handleLogout}
          />
        </div>

        {/* 모바일 화면 상단 헤더 전용 로그인/회원가입/로그아웃 액션 */}
        <div className={styles.mobileHeaderAccountActions}>
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={handleMypageClick}
                className={styles.mobileProfileNameBtn}
              >
                {displayName}님
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.mobileLogoutBtn}
                title="로그아웃"
                aria-label="로그아웃"
              >
                <Icon name="logout" size={18} stroke={2.1} />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleLoginClick} className={styles.mobileLoginTextBtn}>
                로그인
              </button>
              <button type="button" onClick={handleSignupClick} className={styles.mobileSignupTextBtn}>
                회원가입
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-header-menu"
        >
          <Icon name={isMobileMenuOpen ? "x" : "list"} size={20} stroke={2.3} />
        </button>
      </div>

      <div
        id="mobile-header-menu"
        className={`mobile-menu-panel ${isMobileMenuOpen ? "is-open" : ""}`}
      >
        <nav className="mobile-menu-nav" aria-label="모바일 주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              active={activeTab}
              onClick={() => handleMenuClick(item)}
            />
          ))}
        </nav>
        <div className="mobile-menu-account">
          <AccountActions
            isAuthenticated={isAuthenticated}
            profileImg={profileImg}
            displayName={displayName}
            location={location}
            onLogin={handleLoginClick}
            onSignup={handleSignupClick}
            onMypage={handleMypageClick}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {showLogoutModal &&
        createPortal(
          <div
            onClick={handleCloseLogoutModal}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(10, 20, 40, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              animation: "zipt-fade 0.18s ease",
              padding: "20px",
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "var(--r-2xl)",
                padding: "32px 28px 28px",
                maxWidth: "380px",
                width: "100%",
                boxShadow: "0 20px 40px rgba(15, 27, 51, 0.16)",
                animation: "zipt-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                textAlign: "center",
                border: "1px solid var(--line-2)",
              }}
            >
              <span
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-soft)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon name="logout" size={26} color="var(--primary)" stroke={2} />
              </span>

              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "var(--ink)",
                  letterSpacing: "-0.02em",
                }}
              >
                로그아웃 되었습니다
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "var(--ink-2)",
                  marginTop: "9px",
                  lineHeight: 1.6,
                }}
              >
                안전하게 로그아웃되었어요. 다시 서비스를 이용하려면<br />
                로그인해 주세요.
              </div>

              <div style={{ marginTop: "26px" }}>
                <Button variant="primary" full onClick={handleCloseLogoutModal}>
                  확인
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
