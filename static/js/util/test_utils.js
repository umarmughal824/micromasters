import TestUtils from 'react-addons-test-utils';

export const modifyTextField = (field, text) => {
  field.value = text;
  TestUtils.Simulate.change(field);
  TestUtils.Simulate.keyDown(field, {key: "Enter", keyCode: 13, which: 13});
};
