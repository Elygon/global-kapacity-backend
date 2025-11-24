const Training = '../../models/training'

class TrainingService {
    async createTraining(data) {
        // BUSINESS RULES

        // Free trainings must NOT have price
        if (data.type === 'free') {
            ata
        }
    }
}