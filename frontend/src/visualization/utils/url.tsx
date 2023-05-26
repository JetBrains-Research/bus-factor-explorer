export const generateBreadcrumb = (i: number, currentPath: string): string => {
  return i < currentPath.split("/").length
    ? currentPath
        .split("/")
        .slice(0, i + 1)
        .join("/")
    : currentPath.split("/")[0];
};

export const getFileExtension = (fileName: string): string|undefined => {
  if (fileName !== null) {
    if (fileName.includes('.'))
      return fileName.split('.').pop();
    else {
      return undefined;
    }
  }

  throw new Error("Undefined or null file name!")
}