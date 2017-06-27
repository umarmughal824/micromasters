// @flow
import R from 'ramda';
import iso3166 from 'iso-3166-2';
import Fuse from 'fuse-js-latest';

const notAvailable = "Not Available";

/**
 * Gets the name of a country given its code
 * @param code Country code
 */
export const codeToCountryName =  R.compose(
  R.pathOr("", ['name']),
  iso3166.country,
  R.defaultTo("")
);

/**
 * Gets the code for a country given its name
 * @param name Country name
 */
export const nameToCountryCode = R.compose(
  R.pathOr("", ['code']),
  iso3166.country,
  R.defaultTo("")
);

/**
 * Gets the name of a state/territory given its ISO3166 code (as in 'US-MA')
 * @param code ISO3166 code ('US-MA', 'US-CO', etc).
 */
export const codeToStateName = R.compose(
  R.pathOr(notAvailable, ['name']),
  iso3166.subdivision,
  R.defaultTo("")
);

/**
 * Get a list of subregion objects for a country, each with a 'code' and 'name' property.
 * @param country Country code
 */
export const getSubcodes = (country:string) => {
  if (country in iso3166.data && "sub" in iso3166.data[country]) {
    return R.map(function (key) {
      return {"code": key, "name": iso3166.data[country]["sub"][key]["name"]};
    }, Object.keys(iso3166.data[country]["sub"]));
  } else return [];
};

/**
 * Gets the ISO3166 code for a state/territory given a country and state name.
 * If no exact match is found for a state name, try a fuzzy match.
 * Return a notAvailable value if no match can be found either way.
 * @param country Country code
 * @param name State/territory name
 */
export const nameToStateCode = (country: string, name: string) =>  {
  let statecode = iso3166.subdivision(R.defaultTo("", country), R.defaultTo("", name));
  if (!R.isEmpty(statecode)) {
    return statecode['code'];
  } else {
    const fuse = new Fuse(getSubcodes(country), {keys: ["name"], threshold:0.4, tokenize: true});
    const fuzzymatches = fuse.search(R.defaultTo("", name));
    return R.isEmpty(fuzzymatches) ? notAvailable : fuzzymatches[0]["code"];
  }
};
