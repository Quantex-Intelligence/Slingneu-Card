export const calculateAge = (birthDate: string): number => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

export const isAbove18 = (birthDate: string): boolean => {
    return calculateAge(birthDate) >= 18;
};
