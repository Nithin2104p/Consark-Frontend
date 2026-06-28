import { apiClient } from "./client";

export type UserDto = {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roleId?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    // backend also returns password but we intentionally omit it from the UI dto
};

export type UsersResponse = {
    statusCode: number;
    success: boolean;
    message: string;
    data: UserDto[];
};

function normalizeName(user: UserDto): string {
    const first = (user.firstName ?? "").trim();
    const last = (user.lastName ?? "").trim();
    const combined = `${first} ${last}`.trim();
    return combined || user.email;
}

export type EmployeeLike = {
    id: string;
    name: string;
    email: string;
    manager: string;
    department: string;
    country: string;
    designation: string;
    projects: number;
    avatar?: string;
};

function toEmployeeLike(user: UserDto): EmployeeLike {
    // Backend payload in this task does not include fields like department/manager.
    // Until backend contracts are extended, keep these derived placeholders.
    // This preserves current UI structure while still removing dummy employees.
    const name = normalizeName(user);

    // Deterministic derived values from _id to keep UI stable.
    const seed = Array.from(user._id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const projects = (seed % 5) + 1;
    const deptIdx = seed % 4;
    const dept = ["Engineering", "Product", "Design", "Operations"][deptIdx];

    const managerIdx = seed % 3;
    const manager = ["Maria Silva", "Ava Brown", "John Doe"][managerIdx];

    const countryIdx = seed % 5;
    const country = ["India", "USA", "Germany", "UK", "Brazil"][countryIdx];

    const designationIdx = seed % 4;
    const designation = [
        "Frontend Developer",
        "Backend Engineer",
        "Product Manager",
        "QA Engineer",
    ][designationIdx];

    return {
        id: user._id,
        name,
        email: user.email,
        manager,
        department: dept,
        country,
        designation,
        projects,
    };
}

export async function getUsers(): Promise<UserDto[]> {
    const { data } = await apiClient.get<UsersResponse>("/users");
    // If backend returns {data:[...]}
    return data?.data ?? [];
}

export async function getEmployeesLikeFromUsers(): Promise<EmployeeLike[]> {
    const users = await getUsers();
    return users.map(toEmployeeLike);
}

