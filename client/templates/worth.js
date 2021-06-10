computeWorth = function(person) {
  let lowercaseRole = person.role.toLowerCase();

  if (person._id === 'hzhang') {
    return 10;
  } else if (person._id === 'eorourke') {
    return 9.5;
  } else if (person._id === 'lgerber' || person._id === 'measterday') {
    return 9;
  } else if (lowercaseRole === 'phd student') {
    return 8;
  } else if (lowercaseRole === 'top dog') {
    return 7.5;
  } else if (lowercaseRole === 'postbac researcher') {
    return 7;
  } else if ((lowercaseRole === 'graduate researcher') || (lowercaseRole === 'grad researcher')) {
    return 6.5;
  } else if ((lowercaseRole === 'undergraduate researcher') || (lowercaseRole === 'undergrad researcher')) {
    return 6;
  } else if (lowercaseRole === 'alumni') {
    return 4;
  } else {
    return 0;
  }
};
