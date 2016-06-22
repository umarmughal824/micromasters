// @flow
import React from 'react';
import _ from 'lodash';
import SelectField from './SelectField';
import FIELDS_OF_STUDY from '../../fields_of_study';

let fieldOfStudyOptions = _.map(FIELDS_OF_STUDY, (name, code) => ({
  value: code,
  label: name
}));

export default class FieldsOfStudySelectField extends React.Component {
  static propTypes = {
    resultLimit: React.PropTypes.number
  };

  static defaultProps = {
    resultLimit: 10
  };

  static autocompleteStyleProps = {
    menuStyle: {maxHeight: 300},
    listStyle: {width: '100%'},
    menuHeight: 300,
    fullWidth: true
  };

  render() {
    return <SelectField
      options={fieldOfStudyOptions}
      resultLimit={this.props.resultLimit}
      autocompleteStyleProps={FieldsOfStudySelectField.autocompleteStyleProps}
      {...this.props}
    />;
  }
}
