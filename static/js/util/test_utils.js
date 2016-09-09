import TestUtils from 'react-addons-test-utils';
import { assert } from 'chai';

export const modifyTextField = (field, text) => {
  field.value = text;
  TestUtils.Simulate.change(field);
  TestUtils.Simulate.keyDown(field, {key: "Enter", keyCode: 13, which: 13});
};

export const isActiveDialog = (dialog) => (
  dialog.style["left"] === "0px"
);

let findActiveDialog = (dialogClassName) => (
  [...document.getElementsByClassName(dialogClassName)].find(dialog => (
    isActiveDialog(dialog)
  ))
);

export const noActiveDialogs = (dialogClassName) => (
  findActiveDialog(dialogClassName) === undefined
);

export const activeDialog = (dialogClassName) => {
  let dialog = findActiveDialog(dialogClassName);
  assert.isDefined(dialog, `dialog element w/ className '${dialogClassName}' should be active`);
  return dialog;
};

export const activeDeleteDialog = () => (
  activeDialog('deletion-confirmation')
);

export const noActiveDeleteDialogs = () => (
  noActiveDialogs('deletion-confirmation')
);
