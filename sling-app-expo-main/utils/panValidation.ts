export const validatePAN = (pan: string): boolean => {
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    return panRegex.test(pan.toUpperCase());
};

export const formatPAN = (pan: string): string => {
    return pan.toUpperCase().substring(0, 10);
};
