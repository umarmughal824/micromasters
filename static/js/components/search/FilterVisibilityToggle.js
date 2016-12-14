// @flow
import React from 'react';
import _ from 'lodash';
import { SearchkitComponent } from 'searchkit';
import Icon from 'react-mdl/lib/Icon';

const FILTER_ID_ADJUST = {
  "birth_location": "profile.birth_country4",
  "courses": "program.enrollments.title3"
};

export default class FilterVisibilityToggle extends SearchkitComponent {
  props: {
    filterName:             string,
    checkFilterVisibility:  (filterName: string) => boolean,
    setFilterVisibility:    (filterName: string, visibility: boolean) => void,
    children:               React$Element<*>[],
  };

  openClass: Function = (): string => {
    const { filterName, checkFilterVisibility } = this.props;
    return checkFilterVisibility(filterName) ? "" : "closed";
  };

  getChildFacetDocCount: Function = (results: Object, resultId: string): number => {
    const elementResult = _.get(results, ['aggregations', resultId]);
    if (elementResult['inner']) {
      return elementResult['inner']['doc_count'];
    } else {
      return elementResult['doc_count'];
    }
  };

  isInResults: Function = (id: string): boolean => {
    let results = this.getResults();
    if (results) {
      const resultId = FILTER_ID_ADJUST[id] || id;
      const docCount = this.getChildFacetDocCount(results, resultId);
      if (docCount > 0) {
        return true;
      }
    }
    return false;
  };

  openStateIcon: Function = (children: React$Element<*>): React$Element<*>|null => {
    if (!this.isInResults(children.props.id)) {
      return null;
    }

    return <Icon
      name="arrow_drop_down"
      onClick={this.toggleFilterVisibility}
      className={this.openClass()}
    />;
  };

  toggleFilterVisibility: Function = (): void => {
    const {
      filterName,
      checkFilterVisibility,
      setFilterVisibility,
    } = this.props;
    setFilterVisibility(
      filterName,
      !checkFilterVisibility(filterName)
    );
  };

  render () {
    const { children } = this.props;
    return (
      <div className={`filter-visibility-toggle ${this.openClass()}`}>
        { this.openStateIcon(children) }
        { children }
      </div>
    );
  }
}
