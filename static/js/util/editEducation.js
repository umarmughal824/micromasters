// @flow
import _ from 'lodash';

import { generateNewEducation } from "../util/util";
import { educationValidation } from '../util/validation';

export function openEditEducationForm(index: number) {
  const {
    profile,
    setEducationDialogIndex,
    setEducationDegreeLevel,
    setEducationDialogVisibility,
  } = this.props;

  let education = profile['education'][index];
  setEducationDialogIndex(index);
  setEducationDegreeLevel(education.degree_name);
  setEducationDialogVisibility(true);
}

export function openNewEducationForm(level: string, index: number) {
  const {
    profile,
    updateProfile,
    setEducationDialogIndex,
    setEducationDegreeLevel,
    setEducationDialogVisibility,
    validator,
  } = this.props;
  let newIndex = index;
  if (index === null){
    newIndex = profile['education'].length;
  }
  /* add empty education */
  let clone = Object.assign({}, profile);
  clone['education'] = clone['education'].concat(generateNewEducation(level));
  updateProfile(clone, validator);
  setEducationDialogIndex(newIndex);
  setEducationDegreeLevel(level);
  setEducationDialogVisibility(true);
}

export function deleteEducationEntry () {
  const { saveProfile, profile, ui } = this.props;
  let clone = _.cloneDeep(profile);
  clone['education'].splice(ui.deletionIndex, 1);
  saveProfile(educationValidation, clone, ui);
}


