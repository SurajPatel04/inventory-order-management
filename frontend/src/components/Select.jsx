import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Select({ options, value, onChange, placeholder, icon: Icon, className = '', variant = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  let buttonClass = "w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none";
  let textClass = selectedOption ? 'text-gray-900 font-medium' : 'text-gray-500';
  let chevronColor = 'text-gray-400';

  if (variant === 'status') {
      const statusColors = {
          'cancelled': 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500',
          'delivered': 'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500',
          'shipped': 'bg-purple-100 text-purple-800 hover:bg-purple-200 focus:ring-purple-500',
          'pending': 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-500',
          'confirmed': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 focus:ring-emerald-500',
      };
      const colorClass = statusColors[value] || 'bg-gray-100 text-gray-800';
      buttonClass = `w-full flex items-center justify-between text-xs px-3 py-1.5 rounded-full font-semibold focus:ring-2 transition-all outline-none border-none ${colorClass}`;
      textClass = '';
      chevronColor = 'opacity-70';
  }

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={buttonClass}
      >
        <div className="flex items-center truncate">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
          <span className={textClass}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${chevronColor}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1 overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-thin">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${value === '' ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-gray-600'}`}
              >
                {placeholder}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(option.value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${value === option.value ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-gray-600'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
