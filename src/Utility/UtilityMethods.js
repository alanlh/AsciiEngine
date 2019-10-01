function unionIntoFirst(first, second, alertIfSameKey) {
  for (let key in second) {
    if (alertIfSameKey && (key in first)) {
      CONSOLE.WARN("Key: ", key, " appears in both ", first, " and ", second);
    }
    if (!(key in first)) {
      first[key] = second[key];
    }
  }
}
