// @flow
import React from 'react';
import Button from 'react-mdl/lib/Button';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Dialog from 'material-ui/Dialog';
import _ from 'lodash';

import { HIGH_SCHOOL, BACHELORS, EDUCATION_LEVELS } from '../constants';
import ProfileFormFields from '../util/ProfileFormFields';
import { educationValidation } from '../util/validation';

export default class EducationDialog extends ProfileFormFields {
  constructor(props: Object) {
    super(props);
    this.educationLevelLabels = {};
    this.educationLevelOptions.forEach(level => {
      this.educationLevelLabels[level.value] = level.label;
    });
  }
  educationLevelLabels: Object;

  static propTypes = {
    open:           React.PropTypes.bool,
    onClose:        React.PropTypes.func,
    onSave:         React.PropTypes.func,
    showLevelForm:  React.PropTypes.bool,
  };

  clearEducationEdit: Function = (): void => {
    const {
      setEducationDialogVisibility,
      setEducationDegreeLevel,
      setEducationDialogIndex,
      clearProfileEdit,
    } = this.props;
    setEducationDialogVisibility(false);
    setEducationDegreeLevel('');
    setEducationDialogIndex(null);
    clearProfileEdit();
  };

  saveEducationForm: Function = (): void => {
    const { saveProfile, profile, ui } = this.props;
    saveProfile(educationValidation, profile, ui).then(() => {
      this.clearEducationEdit();
    });
  };

  editEducationForm: Function = (): void => {
    const {
      ui: { educationDialogIndex},
      showLevelForm,
      profile: { education },
    } = this.props;

    let educationDegreeLevel = _.get(education, [educationDialogIndex, "degree_name"]) || BACHELORS;
    let keySet = (key) => ['education', educationDialogIndex, key];

    let fieldOfStudy = () => {
      if (educationDegreeLevel !== HIGH_SCHOOL) { 
        return <Cell col={6}>{this.boundTextField(keySet('field_of_study'), 'Field of Study')}</Cell>;
      }
    };
    let highSchoolPadding = () => (
      educationDegreeLevel === HIGH_SCHOOL ? <Cell col={6} /> : undefined
    );
    let levelForm = () => {
      if ( showLevelForm ) {
        return <Cell col={12}>
          {this.boundSelectField(keySet('degree_name'), 'Degree Type', EDUCATION_LEVELS)}
        </Cell>;
      }
    };

    return <Grid className="profile-tab-grid">
      <Cell col={12} className="profile-form-title">
        {this.educationLevelLabels[educationDegreeLevel]}
      </Cell>
      { levelForm() }
      { fieldOfStudy() }
      <Cell col={6}>
        {this.boundDateField(keySet('graduation_date'), 'Graduation Date', true)}
      </Cell>
      { highSchoolPadding() }
      <Cell col={6}>
        {this.boundTextField(keySet('school_name'), 'School Name')}
      </Cell>
      <Cell col={6}>
      </Cell>
      <Cell col={4}>
        {this.boundCountrySelectField(
          keySet('school_state_or_territory'),
          keySet('school_country'),
          'Country'
        )}
      </Cell>
      <Cell col={4}>
        {this.boundStateSelectField(
          keySet('school_state_or_territory'),
          keySet('school_country'),
          'State'
        )}
      </Cell>
      <Cell col={4} key="school_city">
        {this.boundTextField(keySet('school_city'), 'City')}
      </Cell>
    </Grid>;
  };

  render () {
    const { ui: {educationDialogVisibility } } = this.props;

    let actions = [
      <Button
        type='button'
        key='cancel'
        className="cancel-button"
        onClick={this.clearEducationEdit}>
        Cancel
      </Button>,
      <Button
        key='save'
        type='button'
        className="save-button"
        onClick={this.saveEducationForm}>
        Save
      </Button>,
    ];

    return (
      <Dialog
        open={educationDialogVisibility}
        className="dashboard-dialog education-dashboard-dialog"
        onRequestClose={this.clearEducationEdit}
        actions={actions}
        autoScrollBodyContent={true}
      >
        {this.editEducationForm()}
      </Dialog>
    );
  }
}

