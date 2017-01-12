// @flow
import _ from 'lodash';
import { Pagination } from 'searchkit';

// NOTE:
// This is a hack to fix a bug we experienced with searchkit. The pagination control did
// not appear for result sets that had multiple pages.
// Issue: https://github.com/mitodl/micromasters/issues/2336
// Source in searchkit: /src/components/search/pagination/src/Pagination.tsx#L79

export default class PatchedPagination extends Pagination {
  getTotalPages() {
    return Math.ceil(
      _.get(this.getResults(), "hits.total", 1) /
      _.get(this.getQuery(), "query.size", 10)
    );
  }
}
