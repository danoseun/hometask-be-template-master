function isNumeric(inputStr) {
  // Regular expression matches only numbers
  var numericRegex = /^[0-9]+$/;

  // Test if the input string matches the numeric pattern and returns a boolean
  return numericRegex.test(inputStr);
}

module.exports = { isNumeric };
