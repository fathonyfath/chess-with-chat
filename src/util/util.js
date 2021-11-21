const stringToColor = (stringInput) => {
  let stringUniqueHash = [...stringInput].reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `hsl(${(stringUniqueHash * stringUniqueHash) % 360}, 100%, 80%)`;
}

export { stringToColor };