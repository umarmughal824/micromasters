import React from 'react';
import {
  SearchkitComponent,
  Hits,
  NoHits,
  SelectedFilters,
  RefinementListFilter,
  HitsStats,
  Pagination,
} from 'searchkit';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Card from 'react-mdl/lib/Card/Card';

import LearnerResult from './search/LearnerResult';
import CountryRefinementOption from './search/CountryRefinementOption';
import FilterVisibilityToggle from './search/FilterVisibilityToggle';
import HitsCount from './search/HitsCount';
import type { Option } from '../flow/generalTypes';

export default class LearnerSearch extends SearchkitComponent {
  props: {
    checkFilterVisibility:  (s: string) => boolean,
    setFilterVisibility:    (s: string, v: boolean) => void,
  };

  dropdownOptions: Option[] = [
    { value: 'name', label: "Sort: name" },
    { value: 'dob', label: "Sort: dob" },
  ];

  profileFieldOptions: Function = (): Object => ({
    type: 'nested',
    options: {
      path: 'profile'
    }
  });

  render () {
    return (
      <div className="learners-search">
        <Grid className="search-grid">
          <Cell col={3} className="search-sidebar">
            <Card className="fullwidth">
              <FilterVisibilityToggle
                {...this.props}
                filterName="birth-country"
              >
                <RefinementListFilter
                  id="country"
                  title="Country of Birth"
                  field="profile.birth_country"
                  fieldOptions={this.profileFieldOptions()}
                  itemComponent={CountryRefinementOption}
                />
              </FilterVisibilityToggle>
              <FilterVisibilityToggle
                {...this.props}
                filterName="residence-country"
              >
                <RefinementListFilter
                  id="country"
                  title="Country of Residence"
                  field="profile.country"
                  fieldOptions={this.profileFieldOptions()}
                  itemComponent={CountryRefinementOption}
                />
              </FilterVisibilityToggle>
            </Card>
          </Cell>
          <Cell col={9}>
            <Card className="fullwidth">
              <Grid className="search-header">
                <Cell col={6} className="result-info">
                  <div
                    role="button"
                    id="email-selected"
                    className="micromasters-button"
                  >
                    <span>
                      New Group from Selected
                    </span>
                  </div>
                  <div
                    role="button"
                    id="download csv"
                    className="micromasters-button"
                  >
                    Email Selected
                  </div>
                  <HitsStats component={HitsCount} />
                </Cell>
                <Cell col={2}></Cell>
                <Cell col={4} className="pagination-sort">
                  <Pagination />
                </Cell>
                <Cell col={12}>
                  <SelectedFilters />
                </Cell>
              </Grid>
              <Hits 
                className="learner-results"
                hitsPerPage={50}
                itemComponent={LearnerResult}
              />
              <NoHits />
            </Card>
          </Cell>
        </Grid>
      </div>
    );
  }
}
