'use client';

import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { ChevronDownIcon, LucideSearch, CheckIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectContextType = {
  multiple: boolean;
  search: boolean;
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  toggleOption: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  disabled: boolean;
};

const SelectContext = createContext<SelectContextType | null>(null);

type SelectProps = {
  children: React.ReactNode;
  multiple?: boolean;
  search?: boolean;
  value?: string | string[];
  onSelect?: (value: string | string[]) => void;
  className?: string;
  disabled?: boolean;
};

const Select = ({
  children,
  multiple = false,
  search = false,
  value,
  onSelect,
  className,
  disabled = false,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    value ? (Array.isArray(value) ? value : [value]) : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const toggleOption = (selectedValue: string) => {
    if (disabled) return;

    let newSelectedValues;
    if (multiple) {
      newSelectedValues = selectedValues.includes(selectedValue)
        ? selectedValues.filter((v) => v !== selectedValue)
        : [...selectedValues, selectedValue];
    } else {
      newSelectedValues = [selectedValue];
      setIsOpen(false);
    }

    // Remove empty strings before setting the state
    newSelectedValues = newSelectedValues.filter((v) => v.trim() !== '');

    setSelectedValues(newSelectedValues);
    onSelect?.(multiple ? newSelectedValues : newSelectedValues[0]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <SelectContext.Provider
      value={{
        multiple,
        search,
        selectedValues,
        setSelectedValues,
        toggleOption,
        isOpen,
        setIsOpen,
        searchTerm,
        setSearchTerm,
        disabled,
      }}
    >
      <div
        className={cn(
          'relative w-64',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          className
        )}
        ref={selectRef}
        aria-disabled={disabled}
      >
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context)
    throw new Error('Select components must be used within a <Select> parent');
  return context;
};

const SelectValue = ({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) => {
  const {
    selectedValues,
    setIsOpen,
    isOpen,
    multiple,
    disabled,
    toggleOption,
    setSelectedValues,
  } = useSelect();

  return (
    <div
      className={cn(
        'relative flex flex-wrap items-center justify-between gap-2 p-2 border rounded-lg h-9 max-h-20 overflow-y-scroll pr-8',
        disabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer',
        className
      )}
      onClick={() => !disabled && setIsOpen(!isOpen)}
    >
      <div className="flex flex-wrap gap-2">
        {selectedValues.length > 0 ? (
          selectedValues.map((value) => (
            <span
              key={value}
              className={cn(
                'flex gap-2 items-center px-1 rounded-lg',
                multiple && value && 'bg-accent text-sm'
              )}
            >
              {value || placeholder}
              {multiple && value && (
                <button
                  className="cursor-pointer px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(value);
                  }}
                  disabled={disabled}
                >
                  &times;
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-gray-500">
            {placeholder || 'Select an option'}
          </span>
        )}
      </div>

      <div className="absolute right-3 flex items-center">
        {multiple && selectedValues.length > 0 ? (
          <X
            className="text-gray-500 cursor-pointer relative z-10"
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropdown from toggling
              setSelectedValues([]); // Clear selections
            }}
          />
        ) : (
          <ChevronDownIcon className="text-gray-500" />
        )}
      </div>
    </div>
  );
};

const SelectContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { isOpen, search, searchTerm, setSearchTerm, disabled } = useSelect();

  if (!isOpen || disabled) return null;

  return (
    <div
      className={cn(
        'absolute left-0 z-10 w-full mt-1 bg-background border rounded-lg shadow-lg',
        className
      )}
    >
      {search && (
        <div className="flex items-center h-9 px-2 py-2 border-b bg-background rounded-t-lg">
          <LucideSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
          />
        </div>
      )}
      <div className="max-h-60 overflow-y-auto">{children}</div>
    </div>
  );
};

const SelectItem = ({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) => {
  const { selectedValues, toggleOption, searchTerm, disabled } = useSelect();
  const isSelected = selectedValues.includes(value);

  if (!value.toLowerCase().includes(searchTerm.toLowerCase())) return null;

  return (
    <div
      className={cn(
        'flex justify-between items-center px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500',
        isSelected && 'bg-accent',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => !disabled && toggleOption(value)}
    >
      {children}
      {isSelected && <CheckIcon className="w-4 h-4 text-primary" />}
    </div>
  );
};

export { Select, SelectValue, SelectContent, SelectItem };
