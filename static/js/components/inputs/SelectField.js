// @flow
import React from 'react';
import _ from 'lodash';
import VirtualizedSelect from 'react-virtualized-select';

import { validationErrorSelector, classify } from '../../util/util';
import type { Option } from '../../flow/generalTypes';
import type { Validator, UIValidator } from '../../lib/validation/profile';
import type {
  Profile,
  ValidationErrors,
  UpdateProfileFunc,
} from '../../flow/profileTypes';

class SelectField extends React.Component {
  props: {
    className:                  string,
    errors:                     ValidationErrors,
    id?:                        string,
    keySet:                     Array<string>,
    label:                      string,
    onChange:                   Function,
    options:                    Array<Option>,
    profile:                    Profile,
    topMenu:                    boolean,
    updateProfile:              UpdateProfileFunc,
    updateValidationVisibility: (xs: Array<string>) => void,
    validator:                  Validator|UIValidator,
  };

  onChange: Function = (selection: Option): void => {
    const {
      profile,
      updateProfile,
      keySet,
      validator,
    } = this.props;
    let clone = _.cloneDeep(profile);
    _.set(clone, keySet, selection ? selection.value : "");
    updateProfile(clone, validator);
  };

  onBlur: Function = (): void => {
    const {
      updateValidationVisibility,
      validator,
      updateProfile,
      profile,
      keySet,
    } = this.props;
    if (_.isFunction(updateValidationVisibility)) {
      updateValidationVisibility(keySet);
    }
    updateProfile(profile, validator);
  };

  label: Function = (label: string): React$Element<*> => (
    <div className="select-label">
      { label }
    </div>
  );

  className = (): string => {
    const { className, label } = this.props;
    return `select-field ${classify(className)} ${classify(label)}`;
  };

  selectClassName = (): string => {
    const { errors, keySet, topMenu } = this.props;
    return `${validationErrorSelector(errors, keySet)} ${topMenu ? 'menu-outer-top' : ''}`;
  };


  render() {
    const { errors, keySet, id, profile, label } = this.props;
    return (
      <div className={this.className()} id={id ? id : ""}>
        { label ? this.label(label) : null }
        <VirtualizedSelect
          value={_.get(profile, keySet, "")}
          className={this.selectClassName()}
          onChange={this.onChange}
          onBlur={this.onBlur}
          {...this.props}
        />
        <span className="validation-error-text">
          {_.get(errors, keySet)}
        </span>
      </div>
    );
  }
}

export default SelectField;
