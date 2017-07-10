import { assert } from 'chai';

import { codeToCountryName, codeToStateName, nameToStateCode } from './location';

describe('location', () => {
  describe('codeToCountryName', () => {
    it('should return a valid country name for a code', () => {
      [
        ['US', 'United States'],
        [null, ''],
      ].forEach(([countryCode, country]) => {
        assert.equal(codeToCountryName(countryCode), country);
      });
    });
  });

  describe('codeToStateName', () => {
    it('should return a valid state name for a code', () => {
      [
        ['US-MA', 'Massachusetts'],
        ['AF-KAN', 'Kandahār'],
        [null, 'Not Available'],
        ['', 'Not Available']
      ].forEach(([stateCode, state]) => {
        assert.equal(codeToStateName(stateCode), state);
      });
    });
  });

  describe('stateNametoCode', () => {
    it('should return a valid state code for a name', () => {
      [
        ['Massachusetts', 'US', 'US-MA', ],
        ['Qandahar', 'AF', 'AF-KAN'],
        ['', 'US', 'Not Available'],
        [null, 'US', 'Not Available'],
      ].forEach(([state, country, stateCode]) => {
        assert.equal(nameToStateCode(country, state), stateCode);
      });
    });
  });

});





