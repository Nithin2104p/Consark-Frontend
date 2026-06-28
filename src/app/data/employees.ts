export type Employee = {
  id: number;
  name: string;
  email: string;
  designation: string;
  manager: string;
  country: string;
  projects: number;
  avatar?: string;
  department: string;
  // add any additional fields here later
};

export const employees: Employee[] = [
  {
    id: 1,
    name: "Luffy Monkey D.",
    email: "john.doe@company.com",
    designation: "Frontend Developer",
    manager: "Maria Silva",
    country: "India",
    projects: 4,
    department: "Engineering",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "Sasuke Uchiha",
    email: "maria.silva@company.com",
    designation: "Product Manager",
    manager: "Ava Brown",
    country: "USA",
    projects: 3,
    department: "Product",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    name: "Gojo Satoru",
    email: "lukas.schmidt@company.com",
    designation: "Backend Engineer",
    manager: "Maria Silva",
    country: "Germany",
    projects: 2,
    department: "Engineering",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    name: "sung Jin-Woo",
    email: "ava.brown@company.com",
    designation: "Designer",
    manager: "Maria Silva",
    country: "UK",
    projects: 1,
    department: "Design",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: 5,
    name: "Li Wei",
    email: "li.wei@company.com",
    designation: "QA Engineer",
    manager: "Lukas Schmidt",
    country: "Australia",
    projects: 2,
    department: "Quality",
    avatar: "https://i.pravatar.cc/150?u=5",
  },
  {
    id: 6,
    name: "Itachi uchiha",
    email: "priya.nair@company.com",
    designation: "Data Analyst",
    manager: "Lukas Schmidt",
    country: "Singapore",
    projects: 3,
    department: "Analytics",
    avatar: "https://i.pravatar.cc/150?u=6",
  },
  {
    id: 7,
    name: "Inosuke",
    email: "carlos.pereira@company.com",
    designation: "DevOps Engineer",
    manager: "John Doe",
    country: "Brazil",
    projects: 4,
    department: "Infrastructure",
    avatar: "https://i.pravatar.cc/150?u=7",
  },
  {
    id: 8,
    name: "Shinra",
    email: "fatima.khan@company.com",
    designation: "Customer Success",
    manager: "Maria Silva",
    country: "UAE",
    projects: 2,
    department: "Customer Success",
    avatar: "https://i.pravatar.cc/150?u=8",
  },
  {
    id: 9,
    name: "Tomiyoka giyu",
    email: "kenji.tanaka@company.com",
    designation: "Security Analyst",
    manager: "Ava Brown",
    country: "Japan",
    projects: 1,
    department: "Security",
    avatar: "https://i.pravatar.cc/150?u=9",
  },
    {
    id: 10,
    name: "Madara Uchiha",
    email: "carlos.pereira@company.com",
    designation: "DevOps Engineer",
    manager: "John Doe",
    country: "Brazil",
    projects: 4,
    department: "Infrastructure",
    avatar: "https://i.pravatar.cc/150?u=13",
  },
];

