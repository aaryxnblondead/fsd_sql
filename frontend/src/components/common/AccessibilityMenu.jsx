import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * AccessibilityMenu Component
 * 
 * A floating accessibility menu with options for:
 * - Font size adjustment
 * - High contrast mode
 * - Motion reduction
 * - Focus mode 
 */
const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('accessibility-settings');
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          fontSize: 'medium',
          highContrast: false,
          reducedMotion: false,
          focusMode: false,
        };
  });

  // Apply settings whenever they change
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Apply font size
    const htmlElement = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'x-large': '20px',
    };
    htmlElement.style.fontSize = fontSizeMap[settings.fontSize] || '16px';

    // Apply high contrast
    if (settings.highContrast) {
      htmlElement.classList.add('high-contrast');
    } else {
      htmlElement.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      htmlElement.classList.add('reduced-motion');
    } else {
      htmlElement.classList.remove('reduced-motion');
    }

    // Apply focus mode
    if (settings.focusMode) {
      htmlElement.classList.add('focus-mode');
    } else {
      htmlElement.classList.remove('focus-mode');
    }
  }, [settings]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const updateSetting = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.accessibility-menu') && !e.target.closest('.accessibility-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-label="Accessibility options"
        className="accessibility-toggle fixed bottom-4 right-4 z-50 p-3 bg-hr-primary text-white rounded-full shadow-lg hover:bg-hr-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hr-primary"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-1.017a2 2 0 01-1.964-1.622l-1.367-6.119m-.73-2.359L7.437 5M5 10H1m0 0l4-4m-4 4l4 4"
          />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-labelledby="accessibility-title"
            className="accessibility-menu fixed bottom-20 right-4 z-50 bg-white dark:bg-hr-dark-secondary p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="accessibility-title" className="text-lg font-semibold">
                Accessibility
              </h2>
              <button
                aria-label="Close accessibility menu"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <label htmlFor="font-size" className="block text-sm font-medium mb-1">
                  Font Size
                </label>
                <select
                  id="font-size"
                  className="w-full p-2 border rounded"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="x-large">Extra Large</option>
                </select>
              </div>

              {/* High Contrast */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="high-contrast"
                  className="mr-2"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                />
                <label htmlFor="high-contrast">High Contrast</label>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reduced-motion"
                  className="mr-2"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                />
                <label htmlFor="reduced-motion">Reduced Motion</label>
              </div>

              {/* Focus Mode */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="focus-mode"
                  className="mr-2"
                  checked={settings.focusMode}
                  onChange={(e) => updateSetting('focusMode', e.target.checked)}
                />
                <label htmlFor="focus-mode">Focus Mode</label>
              </div>

              {/* Reset Button */}
              <button
                className="w-full mt-2 p-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
                onClick={() =>
                  setSettings({
                    fontSize: 'medium',
                    highContrast: false,
                    reducedMotion: false,
                    focusMode: false,
                  })
                }
              >
                Reset to Default
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AccessibilityMenu; 