import fs from 'fs';
import path from 'path';
import Plotly from 'plotly';
import { join } from 'path';
import { parse } from 'csv-parse/sync'; // Ensure you have this package installed for parsing

const execute = async (datasetFilePath, action) => {
    const filePath = join(process.cwd(), datasetFilePath);
    
    // Load and parse the dataset
    const data = fs.readFileSync(filePath, 'utf8');
    const records = parse(data, {
        columns: true,
        delimiter: ' ',
    });
    
    // Convert records to a more usable format
    const parsedData = records.map(record => {
        return Object.fromEntries(
            Object.entries(record).map(([key, value]) => [key, parseFloat(value)])
        );
    });

    if (action === 'describe') {
        return Object.keys(parsedData[0]);
    }

    if (action === 'median') {
        const medians = {};
        for (const key of Object.keys(parsedData[0])) {
            const values = parsedData.map(record => record[key]).filter(v => !isNaN(v));
            medians[key] = calculateMedian(values);
        }
        return medians;
    }

    if (action === 'max') {
        const maxValues = {};
        for (const key of Object.keys(parsedData[0])) {
            const values = parsedData.map(record => record[key]).filter(v => !isNaN(v));
            maxValues[key] = Math.max(...values);
        }
        return maxValues;
    }

    if (action === 'correlation') {
        // Assume two variables are specified in the request (key1 and key2)
        const { key1, key2 } = action.parameters; // You might need to adjust how you access parameters
        const x = parsedData.map(record => record[key1]).filter(v => !isNaN(v));
        const y = parsedData.map(record => record[key2]).filter(v => !isNaN(v));
        return calculateCorrelation(x, y);
    }

    if (action === 'plot') {
        const { xVar, yVar } = action.parameters; // Get variable names from parameters
        const xData = parsedData.map(record => record[xVar]);
        const yData = parsedData.map(record => record[yVar]);

        const trace = {
            x: xData,
            y: yData,
            mode: 'markers',
            type: 'scatter',
        };

        const layout = {
            title: `Scatter Plot of ${yVar} vs ${xVar}`,
            xaxis: { title: xVar },
            yaxis: { title: yVar },
        };

        const figure = { data: [trace], layout: layout };
        const imgOpts = {
            format: 'png',
            width: 800,
            height: 600,
        };

        const image = await Plotly.getImage(figure, imgOpts);
        return { image: image };
    }

    return `Action ${action} not recognized!`;
};

const calculateMedian = (values) => {
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
};

const calculateCorrelation = (x, y) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, value, i) => sum + value * y[i], 0);
    const sumX2 = x.reduce((sum, value) => sum + value ** 2, 0);
    const sumY2 = y.reduce((sum, value) => sum + value ** 2, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));

    return denominator === 0 ? 0 : numerator / denominator;
};

const details = {
    type: 'function',
    function: {
        name: 'dataAnalysis',
        parameters: {
            type: 'object',
            properties: {
                datasetFilePath: {
                    type: 'string',
                    description: 'Path to the dataset file'
                },
                action: {
                    type: 'string',
                    description: 'Action to perform: describe, median, max, correlation, plot'
                },
                parameters: {
                    type: 'object',
                    description: 'Additional parameters required for certain actions'
                }
            },
            required: ['datasetFilePath', 'action']
        }
    },
    description: 'This function performs various analyses on the given dataset.'
};

export { execute, details };
