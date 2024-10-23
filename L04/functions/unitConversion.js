// Function to perform unit conversion
const execute = async (value, fromUnit, toUnit) => {
    const conversionRates = {
        mass: {
            "kg_to_lbs": 2.20462,
            "lbs_to_kg": 1 / 2.20462
        },
        length: {
            "m_to_ft": 3.28084,
            "ft_to_m": 1 / 3.28084,
            "m_to_in": 39.3701,
            "in_to_m": 1 / 39.3701,
            "m_to_mi": 0.000621371,
            "mi_to_m": 1 / 0.000621371
        },
        volume: {
            "L_to_gal": 0.264172,
            "gal_to_L": 1 / 0.264172
        },
        velocity: {
            "mps_to_mph": 2.23694,
            "mph_to_mps": 1 / 2.23694,
            "mps_to_fts": 3.28084,
            "fts_to_mps": 1 / 3.28084
        },
        temperature: {
            C_to_F: (tempC) => (tempC * 9/5) + 32,
            F_to_C: (tempF) => (tempF - 32) * 5/9
        }
    };

    const unitCategories = {
        mass: ["kg", "lbs"],
        length: ["m", "ft", "in", "mi"],
        volume: ["L", "gal"],
        velocity: ["m/s", "mph", "ft/s"],
        temperature: ["C", "F"]
    };

    const getUnitCategory = (unit) => {
        for (let category in unitCategories) {
            if (unitCategories[category].includes(unit)) {
                return category;
            }
        }
        return null; // If the unit doesn't belong to any category
    };

    const fromCategory = getUnitCategory(fromUnit);
    const toCategory = getUnitCategory(toUnit);

    // Check if units are from the same category
    if (fromCategory !== toCategory) {
        return { error: `Error: Cannot convert from ${fromUnit} to ${toUnit} (incompatible types)` };
    }

    // Handle temperature conversion separately due to non-linear conversion
    if (fromCategory === "temperature") {
        if (fromUnit === "C" && toUnit === "F") {
            return { result: `${value}°C is ${(conversionRates.temperature.C_to_F(value)).toFixed(2)}°F` };
        } else if (fromUnit === "F" && toUnit === "C") {
            return { result: `${value}°F is ${(conversionRates.temperature.F_to_C(value)).toFixed(2)}°C` };
        } else {
            return { error: `Error: Unsupported temperature conversion` };
        }
    }

    // Handle other unit conversions
    const conversionKey = `${fromUnit}_to_${toUnit}`;
    if (conversionRates[fromCategory] && conversionRates[fromCategory][conversionKey]) {
        const result = value * conversionRates[fromCategory][conversionKey];
        return { result: `${value} ${fromUnit} is ${result.toFixed(4)} ${toUnit}` };
    } else {
        return { error: `Error: Conversion from ${fromUnit} to ${toUnit} not supported` };
    }
};

// Function details for the conversion
const details = {
    type: "function",
    function: {
        name: 'unitConversion',
        parameters: {
            type: 'object',
            properties: {
                value: {
                    type: 'number',
                    description: 'The numerical value to convert'
                },
                fromUnit: {
                    type: 'string',
                    description: 'The unit to convert from'
                },
                toUnit: {
                    type: 'string',
                    description: 'The unit to convert to'
                }
            },
            required: ['value', 'fromUnit', 'toUnit']
        },
    },
    description: 'This function converts a value from one unit to another (e.g., kg to lbs, m to ft) and handles errors for incompatible unit types.'
};

// Exporting the function and its details
export { execute, details };


const result = await execute(1.80, 'm', 'ft');
console.log(result); //