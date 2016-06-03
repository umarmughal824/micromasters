import React from 'react';
import Button from 'react-mdl/lib/Button';
import IconButton from 'react-mdl/lib/IconButton';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Switch from 'react-mdl/lib/Switch';
import FABButton from 'react-mdl/lib/FABButton';
import Icon from 'react-mdl/lib/Icon';
import Dialog from 'material-ui/Dialog';
import { Card } from 'react-mdl/lib/Card';
import _ from 'lodash';
import moment from 'moment';

import ProfileFormFields from '../util/ProfileFormFields';
import { generateNewEducation } from "../util/util";
import { saveProfileStep } from '../util/profile_edit';
import { HIGH_SCHOOL } from '../constants';

class EducationTab extends ProfileFormFields {
  constructor(props) {
    super(props);
    this.educationLevelLabels = {};
    this.educationLevelOptions.forEach(level => {
      this.educationLevelLabels[level.value] = level.label;
    });
  }

  prevUrl = "/profile/personal";
  nextUrl = "/profile/professional";
  
  static propTypes = {
    profile:                        React.PropTypes.object,
    ui:                             React.PropTypes.object,
    updateProfile:                  React.PropTypes.func,
    clearProfileEdit:               React.PropTypes.func,
    errors:                         React.PropTypes.object,
    setEducationDialogVisibility:   React.PropTypes.func,
    setEducationDialogIndex:        React.PropTypes.func,
    setEducationDegreeLevel:        React.PropTypes.func,
    setEducationDegreeInclusions:   React.PropTypes.func,
  };

  openNewEducationForm = (level, index) => {
    const {
      profile,
      updateProfile,
      setEducationDialogIndex,
      setEducationDegreeLevel,
      setEducationDialogVisibility,
    } = this.props;
    let newIndex = index;
    if (index === null){
      newIndex = profile['education'].length;
    }
    /* add empty education */
    let clone = Object.assign({}, profile);
    clone['education'] = clone['education'].concat(generateNewEducation(level));
    updateProfile(clone);
    setEducationDialogIndex(newIndex);
    setEducationDegreeLevel(level);
    setEducationDialogVisibility(true);
  };

  deleteEducationEntry = index => {
    const { updateProfile, profile } = this.props;
    let clone = _.cloneDeep(profile);
    clone['education'].splice(index, 1);
    updateProfile(clone);
  };

  renderEducationLevel(level){
    const { ui: { educationDegreeInclusions }, profile: { education } } = this.props;
    if (educationDegreeInclusions[level.value]) {
      let rows = [];
      if (education !== undefined) {
        rows = Object.entries(education).
          filter(([, education]) => education.degree_name === level.value).
          map(([index, education]) => this.educationRow(education, index));
      }
      rows.push(
        <FABButton
          colored
          onClick={() => this.openNewEducationForm(level.value, null)}
          className="profile-add-button"
          key="I'm unique!"
        >
          <Icon name="add" />
        </FABButton>
      );
      return rows;
    }
  }

  educationRow = (education, index) => {
    const { errors } = this.props;
    if (!('id' in education)) {
      // don't show new educations, wait until we saved on the server before showing them
      return;
    }

    let deleteEntry = () => this.deleteEducationEntry(index);
    let editEntry = () => this.openEditEducationForm(index);
    let validationAlert = () => {
      if (_.get(errors, ['education', index])) {
        return <IconButton name="error" onClick={editEntry} />;
      }
    };
    let dateFormat = date => moment(date).format("MM[/]YYYY");

    return <Grid className="profile-tab-card-grid" key={index}>
      <Cell col={4} className="profile-row-name">
        {education.school_name}
      </Cell>
      <Cell col={6} className="profile-row-date-range">
        {`${dateFormat(education.graduation_date)}`}
      </Cell>
      <Cell col={2} className="profile-row-icons">
        {validationAlert()}
        <IconButton name="edit" onClick={editEntry} />
        <IconButton name="delete" onClick={deleteEntry} />
      </Cell>
    </Grid>;
  };

  openEditEducationForm = index => {
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
  };

  saveEducationForm = () => {
    saveProfileStep.call(this).then(() => {
      this.clearEducationEdit();
    });
  };

  handleSwitchClick(level){
    const {
      ui: { educationDegreeInclusions },
      setEducationDegreeInclusions,
    } = this.props;
    let newState = Object.assign({}, educationDegreeInclusions);
    newState[level] = !educationDegreeInclusions[level];
    setEducationDegreeInclusions(newState);
  }

  clearEducationEdit = () => {
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

  editEducationForm = level => {
    const { ui: { educationDialogIndex } } = this.props;

    let keySet = (key) => ['education', educationDialogIndex, key];

    let fieldOfStudy, highSchoolPadding;
    if (level !== HIGH_SCHOOL) {
      fieldOfStudy = <Cell col={6}>
        {this.boundTextField(keySet('field_of_study'), 'Field of Study')}
      </Cell>;
    } else {
      highSchoolPadding = <Cell col={6} />;
    }

    return <Grid className="profile-tab-grid">
      <Cell col={12} className="profile-form-title">
        {this.educationLevelLabels[level]}
      </Cell>
      {fieldOfStudy}
      <Cell col={6}>
        {this.boundDateField(keySet('graduation_date'), 'Graduation Date', true)}
      </Cell>
      {highSchoolPadding}
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

  render() {
    let {
      profile,
      ui: {
        educationDialogVisibility,
        educationDegreeInclusions,
        educationDegreeLevel,
      }
    } = this.props;

    if (profile['education'] === undefined){
      return null;
    }

    let cardClass = level => {
      if (!educationDegreeInclusions[level.value]) {
        return 'profile-tab-card-greyed';
      }
      return "";
    };

    let levelsGrid = this.educationLevelOptions.map(level => {
      return [
        <Cell col={1} key={1} />,
        <Cell col={10} key={2}>
          <Card shadow={1} className={`profile-tab-card ${cardClass(level)}`}>
            <Grid className="profile-tab-card-grid">
              <Cell col={4} className="profile-card-title">
                {level.label}
              </Cell>
              <Cell col={7} />
              <Cell col={1}>
                <Switch
                  onChange={()=>{this.handleSwitchClick(level.value);}}
                  checked={educationDegreeInclusions[level.value]}
                />
              </Cell>
            </Grid>
            {this.renderEducationLevel(level)}
          </Card>
        </Cell>,
        <Cell col={1} key={3} />
      ];
    });

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

    return <div>
      <Grid className="profile-splash">
        <Cell col={12}>
          Please tell us more about your educational background.
        </Cell>
      </Grid>
      <Grid className="profile-tab-grid">
        <Dialog
          open={educationDialogVisibility}
          className="dashboard-dialog"
          onRequestClose={this.clearEducationEdit}
          actions={actions}
          autoScrollBodyContent={true}
        >
          {this.editEducationForm(educationDegreeLevel)}
        </Dialog>
        {levelsGrid}
        <Cell col={1} />
        <Cell col={10}>
          {this.progressControls()}
        </Cell>
        <Cell col={1} />
      </Grid>
    </div>;
  }
}

export default EducationTab;
