// @flow
import { assert } from 'chai';

import {
  hasAnyStaffRole,
  hasStaffForProgram,
} from './roles';

describe('roles library', () => {
  let roles;

  beforeEach(() => {
    roles = [
      {
        "role": "staff",
        "program": 1
      },
      {
        "role": "student",
        "program": 2
      }
    ];
  });

  describe('hasAnyStaffRole', () => {
    it('should return true if the user has a staff role on any program', () => {
      assert.isTrue(hasAnyStaffRole(roles));
    });

    it('should return false if the user does not have a staff role anywhere', () => {
      roles[0].role = "student";
      assert.isFalse(hasAnyStaffRole(roles));
    });
  });

  describe('hasStaffForProgram', () => {
    it('should return true if the user is staff on the specified program', () => {
      assert.isTrue(hasStaffForProgram({id: 1}, roles));
    });

    it('should return false if the user is not staff on the specified program', () => {
      assert.isFalse(hasStaffForProgram({id: 2}, roles));
    });
  });
});
