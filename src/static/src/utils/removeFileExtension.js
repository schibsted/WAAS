const removeFileExtension = (file) => {
    const lastPeriodPos = file.lastIndexOf('.');
    
    if (lastPeriodPos < 0) return file;
    
    return file.substring(0, lastPeriodPos);
};

export default removeFileExtension