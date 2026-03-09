import { Moon, Sun } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import LangToggle from './LangToggle';
import '../styles/Header.css';

export default function Header({ badge }) {
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <header className="fixed top-0 w-full max-w-lg mx-auto z-50 p-4 flex justify-between items-center pointer-events-none">
      {/* Left: logo pill */}
      <div className="header-glass px-3 py-2 rounded-full shadow-md flex items-center gap-2 pointer-events-auto border border-red-200">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
        <img
          src="/Gemini_Generated_Image_ylicdmylicdmylic-removebg-preview.png"
          alt="TrikeSecure"
          className="h-6 object-contain"
        />
      </div>

      {/* Right: lang toggle + dark mode + optional badge */}
      <div className="flex items-center gap-2">
        <LangToggle />
        <button
          onClick={toggleDarkMode}
          className="header-glass p-2.5 rounded-full shadow-md pointer-events-auto border border-red-200 btn-press"
        >
          {darkMode
            ? <Sun size={20} className="text-gray-700" />
            : <Moon size={20} className="text-gray-700" />}
        </button>
        {badge && (
          <div className="header-glass px-4 py-2.5 rounded-full shadow-md pointer-events-auto border border-red-200 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800">{badge}</span>
          </div>
        )}
      </div>
    </header>
  );
}
