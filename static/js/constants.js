export const COURSE_LIST_RESPONSE = [
  {
    "id": 2,
    "title": "Course xkGecQLCBCuI",
    "enrollment_start": null,
    "start_date": null,
    "enrollment_url": null,
    "prerequisites": null,
    "program": 1
  },
  {
    "id": 1,
    "title": "Course zXHatukOIMTZ",
    "enrollment_start": null,
    "start_date": null,
    "enrollment_url": null,
    "prerequisites": null,
    "program": 1
  },
  {
    "id": 7,
    "title": "Course plTYyFhMcEBj",
    "enrollment_start": null,
    "start_date": null,
    "enrollment_url": null,
    "prerequisites": null,
    "program": 3
  }
];

export const USER_PROFILE_RESPONSE = {
  "account_privacy": "all_users",
  "email_optin": false,
  "employer": null,
  "job_title": null,
  "state_or_territory": null,
  "name": "Jane Garris",
  "bio": null,
  "country": "US",
  "has_profile_image": true,
  "profile_url_full": "http://192.168.33.10:8000/static/images/profiles/default_500.png",
  "profile_url_large": "http://192.168.33.10:8000/static/images/profiles/default_120.png",
  "profile_url_medium": "http://192.168.33.10:8000/static/images/profiles/default_50.png",
  "profile_url_small": "http://192.168.33.10:8000/static/images/profiles/default_30.png",
  "requires_parental_consent": false,
  "year_of_birth": 1984,
  "level_of_education": "p",
  "goals": "",
  "language_proficiencies": [],
  "gender": "f",
  "mailing_address": "",
  "date_joined_micromasters": "2016-04-05T19:50:28.917493Z"
};

export const PROGRAM_LIST_RESPONSE = [
  {
    "id": 1,
    "title": "Program one"
  }, {
    "id": 3,
    "title": "Program three"
  }
];

export const STATUS_PASSED = 'passed';
export const STATUS_NOT_PASSED = 'not-passed';
export const STATUS_VERIFIED_NOT_COMPLETED = 'verified-not-completed';
export const STATUS_ENROLLED_NOT_VERIFIED = "enrolled-not-verified";
export const STATUS_OFFERED_NOT_ENROLLED = "offered-not-enrolled";
export const STATUS_NOT_OFFERED = 'not-offered';

export const DASHBOARD_RESPONSE = {
  courses: [{
    id: 1,
    title: "SC1x Supply Chain Fundamentals",
    status: STATUS_PASSED,
    grade: 0.98
  }, {
    id: 2,
    title: "Supply Chain Management 2",
    status: STATUS_NOT_PASSED,
    grade: 0.05
    // I'm not sure where we're going to get this data from. AFAIK, the
    // certificates API will only contain passing certificates
  }, {
    id: 3,
    title: "Supply Chain Management 3",
    status: STATUS_VERIFIED_NOT_COMPLETED,
    grade: 0.8,
    // If course_start_date is in the future, show 'Course starts: <date>'
    // else show the current grade (defaults to 0%)
    'course_start_date': "2016-03-31"
  }, {
    id: 4,
    title: "Supply Chain Management 4",
    status: STATUS_ENROLLED_NOT_VERIFIED,
    // if verification_date is in the future, UI will show a 'Verify' button
    // else user cannot verify anymore so nothing is shown
    'verification_date': "2016-04-28"
  }, {
    id: 5,
    title: "Supply Chain Management 7",
    status: STATUS_OFFERED_NOT_ENROLLED,
    // if enrollment_start_date is in the future, show "Enrollment starts: <date>"
    // if enrollment_start_date is in the past or today, show 'Enroll' button
    // if there is no enrollment_start_date, display fuzzy_enrollment_start_date
    'enrollment_start_date': "2016-04-15",
    'fuzzy_enrollment_start_date': "spring 2016"
  }, {
    id: 6,
    title: "Supply Chain Management 8",
    status: STATUS_NOT_OFFERED
  }]
};
