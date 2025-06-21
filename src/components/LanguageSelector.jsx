import React from 'react';

const LanguageSelector = ({ value, setValue }) => (
  <div className="language">
    <label>Langue:</label>
    <select value={value} onChange={e => setValue(e.target.value)}>
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  </div>
);

export default LanguageSelector;
