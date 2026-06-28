import { apiClient } from "./client";

export type KpiCardColor = "purple" | "blue" | "cyan" | "pink";

export type KpiCardDto = {
    id: string;
    label: string;
    value: string | number;
    change?: string;
    color: KpiCardColor;
    // Optional icon key if backend supports it later.
    iconKey?: string;
};

export type KpiCardsResponse = {
    statusCode: number;
    success: boolean;
    message: string;
    data: KpiCardDto[];
};


