// The shape of each row in our three database tables.
export type Lab = {
  id: string;
  code: string;
  name: string;
  partner1: string;
  partner2: string;
};

export type Task = {
  id: string;
  lab_id: string;
  title: string;
  section: "pre" | "post";
  assignee: string | null;
  done: boolean;
};

export type Deadline = {
  id: string;
  lab_id: string;
  title: string;
  due_date: string; // "YYYY-MM-DD"
};
