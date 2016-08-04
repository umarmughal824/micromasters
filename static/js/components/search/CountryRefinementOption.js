// @flow
import React from 'react';
import iso3166 from 'iso-3166-2';

export default class CountryRefinementOption extends React.Component {
  props: {
    label:    string,
    active:   boolean,
    onClick:  Function,
    count:    number,
  };

  countryName: Function = (countryCode: string): string => (
    iso3166.country(countryCode).name
  );

  render () {
    const { active, onClick, count, label } = this.props;
    let activeClass = () => active ? "is-active" : "";
    let option = "sk-item-list-option";
    return (
      <div className={`${option} sk-item-list__item ${activeClass()}`} onClick={onClick}>
        <input 
          type="checkbox"
          data-qa="checkbox"
          checked={active}
          readOnly
          className={`${option} checkbox`}
        >
        </input>
        <div className={`${option}__text`}>
          { this.countryName(label) }
        </div>
        <div className={`${option}__count`}>
          { count }
        </div>
      </div>
    );
  }
}
