import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Autocomplete.css';

const Autocomplete = ({ value, onChange, name, placeholder, required }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Debounce API calls
  const fetchPlaces = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setFilteredOptions([]);
      return;
    }
    setIsLoading(true);
    try {
      // Usamos la API gratuita de OpenStreetMap (Nominatim) limitada a México
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=mx&limit=5`);
      const data = await response.json();
      const places = data.map(item => item.display_name);
      setFilteredOptions(places);
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (showOptions) {
        fetchPlaces(value);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [value, fetchPlaces, showOptions]);

  const handleChange = (e) => {
    onChange(e);
    setShowOptions(true);
  };

  const selectOption = (optionName) => {
    const event = {
      target: {
        name: name,
        value: optionName
      }
    };
    onChange(event);
    setShowOptions(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        name={name}
        onChange={handleChange}
        onFocus={() => {
            setShowOptions(true);
            if(value && value.length >= 3) fetchPlaces(value);
        }}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {showOptions && (filteredOptions.length > 0 || isLoading) && (
        <ul className="autocomplete-options">
          {isLoading ? (
            <li className="loading-option">Buscando lugares...</li>
          ) : (
            filteredOptions.map((optionName, index) => (
              <li key={index} onClick={() => selectOption(optionName)}>
                {optionName}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
