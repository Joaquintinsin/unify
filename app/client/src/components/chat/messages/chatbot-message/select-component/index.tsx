import React from 'react';

const SelectComponent = ({ options, onChange }: any) => {
    return (
        <select onChange={(e) => onChange(e.target.value)}>
            <option value="">Select an option</option>
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};

export default SelectComponent;