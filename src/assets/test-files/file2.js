const getDescription = (content) => {
  const matches = regex.exec(content);
  if (matches && matches.length > 1) {
    return matches[1].trim();
  } else {
    return "Description not found";
  }
}

/// <summary> 
/// this func found description on files with regex
/// </summary>