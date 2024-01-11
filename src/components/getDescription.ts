const getDescription = (content: string) => {
    const regex = /(?:<summary>)([\s\S]*)(?:<\/summary>)/gm;
    const matches = regex.exec(content);
    if (matches && matches.length > 1) {
      return matches[1].trim();
    }
    return 'Description not found';
  };

export default getDescription;