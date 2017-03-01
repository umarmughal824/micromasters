// @flow
import R from 'ramda';

const hasStaffRole = R.propSatisfies(
  R.contains(R.__, ['staff', 'instructor']),
  'role'
);

export const hasAnyStaffRole = R.any(hasStaffRole);

const sameProgram = R.curry((program, role) => (
  R.equals(program.id, R.prop('program', role))
));

export const hasStaffForProgram = R.curry((program, roles) => (
  R.any(R.both(sameProgram(program), hasStaffRole), roles)
));
