import PatchedMenuFilter from './PatchedMenuFilter';
import {
  FacetAccessor, TermQuery, NestedQuery, TermsBucket, FilterBucket,
  BoolMust, AggsContainer, CardinalityMetric
} from "searchkit";
import _ from 'lodash';
import R from 'ramda';

const REVERSE_NESTED_AGG_KEY = 'top_level_doc_count';
const INNER_TERMS_AGG_KEY = 'nested_terms';

/**
 * Produces a Searchkit TermsBucket that includes a "reverse nested" aggregation.
 *
 * Example return value: {
 *   "nested_terms": {
 *     "terms":{
 *       "field":"program.enrollments.course_title", ...
 *     },
 *     "aggs":{
 *       "top_level_doc_count":{"reverse_nested":{}}
 *     }
 *   }
 * }
 */
function ReverseNestedTermsBucket(key, field, options) {
  let reverseNestedAgg = AggsContainer(REVERSE_NESTED_AGG_KEY, {'reverse_nested': {}});
  return TermsBucket(key, field, options, reverseNestedAgg);
}

class NestedAggregatingFacetAccessor extends FacetAccessor {
  /**
   * Overrides buildSharedQuery in FacetAccessor
   * If any filters are applied on the nested documents at this path, we need to build the shared
   * query as normal, then alter the values for some searchkit internals in order to produce
   * the correct query for ES. Searchkit essentially treats multiple filters on a nested set of
   * documents as 'OR' filters, and the changes to 'query.index.filters' and 'query.index.filtersMap'
   * are being made in order to treat those filters as 'AND'.
   */
  buildSharedQuery(query) {
    query = super.buildSharedQuery(query);

    // Construct an 'AND' query for all filters applied on this nested path
    let groupedNestedFilter = this.createGroupedNestedFilter(query);
    if (groupedNestedFilter) {
      let nestedPath = this.getNestedPath();

      let filters = _.cloneDeep(query.index.filters);
      // Find the element that Searchkit added to query.index.filters for this nested document and remove it
      _.remove(filters, (filter) => (
        _.get(filter, ['nested', 'path']) === nestedPath
      ));
      // Add the 'AND' filter that we constructed
      filters.push(groupedNestedFilter);
      query = query.update({'filters': {$set: filters}});

      let filtersMap = _.cloneDeep(query.index.filtersMap);
      // Add the same 'AND' filter to query.index.filtersMap, with the nested path (not the uuid) as the key
      filtersMap[nestedPath] = groupedNestedFilter;
      // If it exists, delete the key for this specific filter (since all filters on this path are grouped together).
      delete filtersMap[this.uuid];
      query = query.update({'filtersMap': {$set: filtersMap}});
    }

    return query;
  }

  /**
   * Overrides buildOwnQuery in FacetAccessor
   * By default, Searchkit does this by creating an aggs bucket that applies all filters
   * that aren't applied to the current element. This implementation accounts for (a) the fact
   * that the logic for getting all other filters is changed in this custom Accessor, and
   * (b) the need for additional filters on the term query for this nested path (in order to make those filters
   * behave like an 'AND').
   */
  buildOwnQuery(query) {
    if (!this.loadAggregations) {
      return query;
    } else {
      return query
        .setAggs(FilterBucket(
          this.uuid,
          this.createAggFilter(query),
          ...this.fieldContext.wrapAggregations(
            this.getTermsBucket(query),
            CardinalityMetric(`${this.key}_count`, this.key)
          )
        ));
    }
  }

  /**
   * Overrides getRawBuckets in FacetAccessor
   * If any filters are applied on the nested path for this element, we alter the aggs portion of
   * the query in a way that puts the buckets/doc_count data at a different path. This implementation returns the
   * buckets/doc_count data at the altered path if it doesn't exist at the default path.
   */
  getRawBuckets() {
    let baseAggsPath = [
      this.uuid,
      this.fieldContext.getAggregationPath(),
      this.key
    ];
    let aggs = this.getAggregations(
      baseAggsPath.concat(["buckets"]), []
    );
    if (aggs.length > 0) {
      return aggs;
    } else {
      return this.getAggregations(
        baseAggsPath.concat([INNER_TERMS_AGG_KEY, "buckets"]), []
      );
    }
  }

  /**
   * Returns the ES path for this nested document type (eg: 'program.enrollments')
   */
  getNestedPath() {
    return this.fieldContext.fieldOptions.options.path;
  }

  /**
   * Creates a nested filter element that has every filter on this nested path applied in
   * an 'AND' fashion.
   *
   * Example return value: {
   *   "nested": {
   *     "path": "program.enrollments",
   *     "filter": {
   *       "bool": {
   *         "must":[{"term": ... }]
   *       }
   *     }
   *   }
   * }
   */
  createGroupedNestedFilter(query) {
    let nestedPathKeyPrefix = `${this.getNestedPath()}.`;

    // For all applied filters on this element's nested path, create a mapping from the
    // element's key (NOT the uuid) to the filtered value.
    // E.g.: {
    //   'program.enrollments.course_title': 'Some Course Title',
    //   'program.enrollments.payment_status': 'Paid'
    // }
    let appliedFilterMap = R.compose(
      R.fromPairs,
      R.map(R.props(['name', 'value'])),
      R.filter(
        (selectedFilter) => (selectedFilter.name.indexOf(nestedPathKeyPrefix) === 0)
      )
    )(query.getSelectedFilters());

    // If this element has a filter applied, add it to the map.
    let filters = this.state.getValue();
    if (filters.length > 0) {
      appliedFilterMap[this.key] = filters[0];
    }

    if (!_.isEmpty(appliedFilterMap)) {
      // Create actual term queries for each pair in the filter map and wrap it in the nested filter context
      let filterTermQueries = _.map(appliedFilterMap, (filterValue, filterKey) => (
        TermQuery(filterKey, filterValue)
      ));
      return this.fieldContext.wrapFilter(BoolMust(filterTermQueries));
    } else {
      return undefined;
    }
  }

  /**
   * Creates the filter for the aggregations of this element. The filter will include (a) any filters that don't apply
   * to this element's nested path, and (b) filters on this element's nested path minus the filter for this specific
   * element.
   */
  createAggFilter(query) {
    let filters = [];
    let nestedPath = this.getNestedPath();
    let unrelatedFilters = query.getFiltersWithoutKeys(nestedPath);
    if (unrelatedFilters) {
      filters.push(unrelatedFilters);
    }
    let otherAppliedFiltersOnPath = this.createFilterForOtherElementsOnPath(query);
    if (otherAppliedFiltersOnPath) {
      filters.push(NestedQuery(nestedPath, otherAppliedFiltersOnPath));
    }
    return filters.length > 0 ? BoolMust(filters) : undefined;
  }

  /**
   * Gets an array of all term filters that are applied to this element's same nested path. Returns undefined if no
   * filters are applied on this element's nested path.
   *
   * Example return value: [
   *   {'term': {'program.enrollments.course_title': 'Some Course Title'},
   *   {'term': {'program.enrollments.payment_status': 'Paid'}
   * ]
   */
  getAllTermFiltersOnPath(query) {
    let nestedPath = this.getNestedPath();
    let appliedNestedFilters = query.getFiltersWithKeys(nestedPath);
    let filterElement = R.pathOr({}, ['nested', 'filter'], appliedNestedFilters);
    if (R.path(['bool', 'must'], filterElement)) {
      return R.path(['bool', 'must'], filterElement);
    } else if (filterElement.term) {
      return [filterElement];
    } else {
      return [];
    }
  }

  /**
   * Creates an 'AND' filter for all filters that are applied on this element's nested path, minus the filter for
   * this specific element (if it exists). If no other filters are applied on this element's nested path, undefined is
   * returned.
   *
   * Example return value: {
   *   'bool': {
   *     'must': [
   *       {'term': {'program.enrollments.course_title': 'Some Course Title'}}
   *     ]
   *   }
   * }
   */
  createFilterForOtherElementsOnPath(query) {
    let allTermFilters = this.getAllTermFiltersOnPath(query);
    let otherTermFilters = [];
    if (allTermFilters.length > 0) {
      // Filter out term filters for this element
      otherTermFilters = R.filter(
        R.compose(
          R.not,
          R.equals(this.key),
          R.head,
          R.keys,
          R.prop('term')
        )
      )(allTermFilters);
    }
    return otherTermFilters.length > 0 ? BoolMust(otherTermFilters) : undefined;
  }

  /**
   * Gets the appropriate terms bucket for this element's agg query.
   */
  getTermsBucket(query) {
    let otherAppliedFiltersOnPath = this.createFilterForOtherElementsOnPath(query);
    let termsKey = otherAppliedFiltersOnPath ? INNER_TERMS_AGG_KEY : this.key;
    let termsBucket = ReverseNestedTermsBucket(termsKey, this.key, _.omitBy({
      size:this.size,
      order:this.getOrder(),
      include: this.options.include,
      exclude: this.options.exclude,
      min_doc_count:this.options.min_doc_count
    }, _.isUndefined));

    if (otherAppliedFiltersOnPath) {
      return FilterBucket(
        this.key,
        otherAppliedFiltersOnPath,
        termsBucket
      );
    } else {
      return termsBucket;
    }
  }
}

export default class NestedAggregatingMenuFilter extends PatchedMenuFilter {
  /**
   * Overrides defineAccessor in MenuFilter
   * Sets a custom Accessor for this Filter type. This is otherwise identical to the original implementation.
   */
  defineAccessor() {
    return new NestedAggregatingFacetAccessor(
      this.props.field, this.getAccessorOptions()
    );
  }

  /**
   * Overrides getItems in MenuFilter
   * Before the aggregation results are rendered, set the doc_count of each item to be the
   * "reverse nested" doc_count. This effectively means that we will show how many unique users
   * match the query against a set of nested elements, as opposed to the total count of nested
   * elements that match (which could be greater than the number of users).
   */
  getItems() {
    let items = super.getItems();
    return items.map(
      item => ({
        ...item,
        doc_count: item[REVERSE_NESTED_AGG_KEY] ? item[REVERSE_NESTED_AGG_KEY].doc_count : item.doc_count
      })
    );
  }
}
