import { useApp } from '../contexts/AppContext';
import '../styles/LangToggle.css';

export default function LangToggle() {
  const { lang, toggleLanguage } = useApp();

  return (
    <div className="lang-toggle" data-lang={lang} onClick={toggleLanguage}>
      <div className="lang-slider" />
      <span className="lang-opt">EN</span>
      <span className="lang-opt">TL</span>
    </div>
  );
}
