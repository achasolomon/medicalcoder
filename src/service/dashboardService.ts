import {EncounterModel, IcdCodeModel, CptCodeModel } from '../models';

export class DashboardService {
    static async getOverview(): Promise<{
        summaryData: {
            totalPatients: number;
            activeEncounters: number;
            icdCodes: number;
            cptCodes: number;
        };
        chartData: { date: string; totalPatients: number; totalEncounters: number }[];
    }> {
        // Fetch summary data
        const totalPatients = await EncounterModel.countTotalPatients();
        const activeEncounters = await EncounterModel.countActive();
        const icdCodes = await IcdCodeModel.count();
        const cptCodes = await CptCodeModel.count();

        const summaryData = {
            totalPatients,
            activeEncounters,
            icdCodes,
            cptCodes,
        };

        // Prepare chart data
        const encounterChartData = await EncounterModel.getDashboardChartData();
        const patientChartData = await EncounterModel.getChartData();

        // Combine encounter and patient chart data
        const chartData = encounterChartData.map((encounter) => {
            const patientData = patientChartData.find((patient) => patient.created_at === encounter.date_of_service) || {
                totalPatients: 0,
            };
            return {
                date: encounter.date_of_service,
                totalEncounters: encounter.totalEncounters,
                totalPatients: patientData.totalPatients,
            };
        });

        return { summaryData, chartData };
    }
}
