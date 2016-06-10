export type Profile = {
  first_name: String;
  education: Array<EducationEntry>;
  work_history: Array<WorkHistoryEntry>;
};

export type EducationEntry = {
  id: ?number;
  degree_name: string;
  graduation_date: ?string|DateEdit;
  graduation_date_edit: ?string;
  field_of_study: string;
  online_degree: boolean;
  school_name: string;
  school_city: string;
  school_state_or_territory: string;
  school_country: string;
};

export type DateEdit = {
  month: ?string;
  year: ?string;
};

export type WorkHistoryEntry = {
  id: ?number;
  position: string;
  industry: string;
  company_name: string;
  start_date: ?string|DateEdit;
  start_date_edit: ?string;
  end_date: ?string|DateEdit;
  end_date_edit: ?string;
  city: string;
  country: string;
  state_or_territory: string;
};

export type ValidationErrors = {
};
