import React from 'react';
import { connect } from 'react-redux';
import Button from 'react-mdl/lib/Button';
import IconButton from 'react-mdl/lib/IconButton';
import _ from 'lodash';

import ProfileTab from "../util/ProfileTab";
import { generateNewEducation } from "../util/util";
import {
  toggleEducationLevel,
  openEducationForm,
  closeEducationForm,
  clearProfileEdit
} from '../actions';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Switch from 'react-mdl/lib/Switch';
import FABButton from 'react-mdl/lib/FABButton';
import Icon from 'react-mdl/lib/Icon';
import Dialog from 'material-ui/Dialog';

class EducationTab extends ProfileTab {
  constructor(props) {
    super(props);
    this.educationLevelLabels = {};
    this.educationLevelOptions.forEach(level => {
      this.educationLevelLabels[level.value] = level.label;
    });
    this.openNewEducationForm = this.openNewEducationForm.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }
  nextUrl = "/profile/professional";

  static propTypes = {
    educationLevels: React.PropTypes.object,
    educationDialog: React.PropTypes.object,
    profile: React.PropTypes.object,
    saveProfile: React.PropTypes.func,
    updateProfile: React.PropTypes.func,
    errors: React.PropTypes.object,
    dispatch: React.PropTypes.func.isRequired
  };

  static defaultProps = {
    requiredFields: [],
    validationMessages: {
      'degree_name': 'Degree level',
      'graduation_date': 'Graduation Date',
      'field_of_study': 'Field of study',
      'online_degree': 'Online Degree',
      'school_name': 'School name',
      'school_city': 'City',
      'school_state_or_territory': 'State',
      'school_country': 'Country'
    }
  };

  static nestedValidationKeys = [
    'degree_name',
    'graduation_date',
    'field_of_study',
    'online_degree',
    'school_name',
    'school_city',
    'school_state_or_territory',
    'school_country'
  ];

  static validation(profile, requiredFields) {
    let nestedFields = (index) => {
      let keySet = (key) => ['education', index, key];
      return EducationTab.nestedValidationKeys.map(key => keySet(key));
    };
    return requiredFields.concat(
      ...profile.education.map((v, i) => nestedFields(i))
    );
  }

  openNewEducationForm(level, index) {
    const {dispatch, profile, updateProfile} = this.props;
    let newIndex = index;
    if (index === null){
      newIndex = profile['education'].length;
    }
    /* add empty education */
    let clone = Object.assign({}, profile);
    clone['education'] = clone['education'].concat(generateNewEducation(level));
    updateProfile(clone);
    dispatch(openEducationForm(level, newIndex));
  }

  deleteEducationEntry = index => {
    const { updateProfile, profile } = this.props;
    let clone = _.cloneDeep(profile);
    clone['education'].splice(index, 1);
    updateProfile(clone);
  }

  printAddDegree(level){
    const { educationLevels } = this.props;
    if (educationLevels[level.value]){
      return <Grid key={"add-"+level.value}>
        <Cell col={11}></Cell>
        <Cell col={1}>
          <FABButton mini onClick={this.openNewEducationForm.bind(this, level.value, null )} raised ripple>
            <Icon name="add" />
          </FABButton>
        </Cell>
      </Grid>;
    }
    return null;
  }

  printExistingEducations(level) {
    const { profile, errors } = this.props;
    let educationRow = (education, index) => {
      if (education.degree_name === level.value && 'id' in education) {
        let deleteEntry = () => this.deleteEducationEntry(index);
        let editEntry = () => (
          this.openEditEducationForm(education.degree_name, education.id)
        );
        let validationAlert = () => {
          if (_.get(errors, ['education', index])) {
            return <IconButton name="error" onClick={editEntry} />;
          }
        };
        return <Grid key={`education-row-${education.id}`} className="existing-education-grid">
          <Cell col={3}>{this.educationLevelLabels[education.degree_name]}</Cell>
          <Cell col={7}>{education.graduation_date}</Cell>
          <Cell col={2} className="education-icons">
            {validationAlert()}
            <IconButton name="edit" onClick={editEntry} />
            <IconButton name="delete" onClick={deleteEntry} />
          </Cell>
        </Grid>;
      }
    };
    return profile['education'].map(educationRow);
  }

  openEditEducationForm = (level, educationId) => {
    const { dispatch, profile } = this.props;

    let index = profile['education'].findIndex((education) => {
      return educationId === education.id;
    });
    dispatch(openEducationForm(level, index));
  }

  saveEducationForm(nestedValidationCallback){
    const { dispatch, saveProfile, profile, requiredFields, validationMessages } = this.props;
    let fields;
    if (_.isFunction(nestedValidationCallback)) {
      fields = nestedValidationCallback(profile, requiredFields);
    } else {
      fields = requiredFields;
    }
    saveProfile(profile, fields, validationMessages ).then(() => {
      dispatch(closeEducationForm());
    });
  }

  handleSwitchClick(level){
    const {dispatch, educationLevels} = this.props;
    let newState = Object.assign({}, educationLevels);
    newState[level] = !educationLevels[level];
    dispatch(toggleEducationLevel(newState));
  }

  handleCloseDialog(){
    const { dispatch } = this.props;
    dispatch(closeEducationForm());
    dispatch(clearProfileEdit());
  }

  render() {
    let { profile, educationDialog, educationLevels} = this.props;

    if (profile['education'] === undefined){
      return null;
    }

    let levelsGrid = this.educationLevelOptions.map(level =>{
      return <Cell col={12} key={level.value} >
        <Grid key={level.value} className="education-level-header">
          <Cell col={11}><h5 className="education-level-name">{level.label}</h5></Cell>
          <Cell col={1}>
            <Switch ripple onChange={()=>{this.handleSwitchClick(level.value);}}
              checked={educationLevels[level.value]}/>
          </Cell>
        </Grid>
        { this.printAddDegree(level)}
        { this.printExistingEducations(level)}
      </Cell>;
    });

    let keySet = (key) =>['education', educationDialog.educationIndex, key];

    let actions = [
      <Button key="save" type='button' onClick={()=>{this.saveEducationForm(EducationTab.validation);}}>Save</Button>,
      <Button key="cancel" type='button' onClick={this.handleCloseDialog}>Cancel</Button>
    ];

    return <Grid className="profile-tab-grid">
      <Dialog
        open={educationDialog.openDialog}
        className="profile-form-dialog"
        onRequestClose={this.handleCloseDialog}
        title={this.educationLevelLabels[educationDialog.degreeLevel]}
        actions={actions}
      >
        <Grid>
          <Cell col={6}>
            {this.boundTextField(keySet('field_of_study'), 'Field of Study')}
          </Cell>
          <Cell col={6}>
            {this.boundMonthYearField(keySet('graduation_date'), 'Graduation Date')}
          </Cell>
        </Grid>
        <Grid>
          <Cell col={6}>
            {this.boundTextField(keySet('school_name'), 'School Name')}
          </Cell>
          <Cell col={6}>
          </Cell>
        </Grid>
        <Grid>
          <Cell col={4}>
            {this.boundSelectField(keySet('school_country'), 'Country', this.countryOptions)}
          </Cell>
          <Cell col={4}>
            {this.boundStateSelectField(
              keySet('school_state_or_territory'),
              keySet('school_country'),
              'State'
            )}
          </Cell>
          <Cell col={4}>
            {this.boundTextField(keySet('school_city'), 'City')}
          </Cell>
        </Grid>
      </Dialog>

      {levelsGrid}

     <Button raised onClick={this.saveAndContinue}>
        Save and continue
     </Button>
    </Grid>;
  }
}

const mapStateToProps = state => ({
  educationDialog: state.educationDialog,
  educationLevels: state.educationLevels
});

export default connect(mapStateToProps)(EducationTab);
