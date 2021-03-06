const Functions = {
  generateId: (function() {
    let currId = 0;
    
    return function(name) {
      if (name === undefined) {
        name = "AsciiEngine"
      }
      currId ++;
      return name + "_" + currId;
    }
  })(),
  clamp: function(num, min, max) {
    return Math.max(min, Math.min(num, max));
  },
  /**
   * Splits a single line of text (no \n) into an array of strings
   * such that each individual string has length at most the specified width.
   * Does not append white-space if the row is less than the desired width.
   * 
   * @todo Optimize and clean up.
   * @param {string} line A line of text
   * @param {number} width The max number of chars on each row.
   * @param {boolean} [fillWidth] Whether or not lines with less than the specified width
   * should have spaces appended to them. Default false.
   * @returns {Array<string>} The line broken up into rows.
   */
  breakLineIntoRows: (line, width, fillWidth = false) => {
    let words = line.split(" ");
    let rows = [];

    let currRowLength = 0;
    let rowStartIdx = 0;
    let rowStartCharIdx = 0;
    for (let i = 0; i < words.length; i++) {
      // TODO: Is there any easier way to express this logic?
      if (i > rowStartIdx) {
        if (currRowLength + 1 + words[i].length <= width) {
          currRowLength += 1 + words[i].length;
          continue;
        }
        let row = words.slice(rowStartIdx, i).join(" ").substr(rowStartCharIdx);
        if (row.length < width && fillWidth) {
          row += " ".repeat(width - row.length);
        }
        rows.push(row);
        currRowLength = 0;
        rowStartIdx = i;
        rowStartCharIdx = 0;
      }
      // For the first word only, break into multiple lines if too long.
      if (words[i].length > width) {
        let c = 0;
        for (; c < words[i].length - width; c += width) {
          rows.push(words[i].substr(c, width));
        }
        currRowLength = words[i].length - c;
        rowStartCharIdx = c;
      } else {
        currRowLength = words[i].length;
      }
    }

    rows.push(words.slice(rowStartIdx, words.length).join(" ").substr(rowStartCharIdx));
    return rows;
  },
  /**
   * Splices a string. 
   * @param {string} string The string to splice
   * @param {number} index The start index from which to remove characters
   * @param {number} count The number of characters to remove
   * @param {string} [add] The string to insert in its place
   */
  stringSplice(string, index, count, add) {
    return string.substring(0, index) + (add || "") + string.substring(index + count);
  }
}

Object.freeze(Functions);
export default Functions;
