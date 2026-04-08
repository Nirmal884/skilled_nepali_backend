const countryOptions = [
    { value: 1, label: 'Nepal' },
    { value: 2, label: 'India' },
    { value: 3, label: 'Bangladesh' },
    { value: 4, label: 'Pakistan' },
    { value: 5, label: 'Sri Lanka' },
    { value: 6, label: 'Afghanistan' },
    { value: 7, label: 'Bhutan' },
    { value: 8, label: 'Maldives' },
];

const gccCountryOptions = [
    { value: 9, label: 'Saudi Arabia' },
    { value: 10, label: 'United Arab Emirates (UAE)' },
    { value: 11, label: 'Qatar' },
    { value: 12, label: 'Kuwait' },
    { value: 13, label: 'Bahrain' },
    { value: 14, label: 'Oman' },
];

const groupedCountryOptions = [
    {
        label: 'South Asia',
        options: countryOptions,
    },
    {
        label: 'GCC Countries',
        options: gccCountryOptions,
    },
];

module.exports = {
    countryOptions,
    gccCountryOptions,
    groupedCountryOptions
};