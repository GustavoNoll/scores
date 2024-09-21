import { ModelStatic, Sequelize, UniqueConstraintError } from "sequelize";
import ClientScore from "../database/models/clientScore";
import Client from "../database/models/client";
import ExperienceScore from "../database/models/experienceScore";
import FieldScore from "../database/models/fieldScore";
import { MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE } from "../constants/processConstants";

class ClientScoreService {
  async generateClientScore(clientId: number, fieldScores: FieldScore[]): Promise<number> {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Pegar o ExperienceScore associado ao cliente
    const experienceScore = await ExperienceScore.getByClient(client);
    if (!experienceScore) {
      throw new Error('ExperienceScore not found for client');
    }

    const validFieldScores = fieldScores.filter(fieldScore => fieldScore.value !== null);

    if (validFieldScores.length < MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE) {
      throw new Error(`Não foi possível calcular o score do cliente: número insuficiente de campos válidos. Necessário: ${MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE}, Encontrado: ${validFieldScores.length}`);
    }

    // Inicializar as variáveis para o cálculo do clientScore
    let totalScore = 0;
    let totalWeight = 0;
    let totalExperienceScore = 1;
    let calculatedExperienceScore = 0;
    const fieldScoreSnapshot: { [key: string]: number } = {};

    // Para cada FieldScore, bater com o ExperienceScore e gerar uma pontuação final
    fieldScores.forEach((fieldScore) => {
      // Obter o valor correspondente no ExperienceScore
      const expScoreValue = experienceScore[fieldScore.field as keyof ExperienceScore];

      if (expScoreValue !== undefined) {

        if (fieldScore.value !== null) {
          const expScore = fieldScore.value * expScoreValue;
          totalScore += expScore;
          totalWeight += 1;
          calculatedExperienceScore += expScoreValue;

          fieldScoreSnapshot[fieldScore.field] = fieldScore.value;
        }

      }
    });

  
    // Calcular a porcentagem de ExperienceScore não calculado
    // Ajustar o totalScore com base na porcentagem não calculada
    const clientScore = totalScore / calculatedExperienceScore;

    // Salvar o clientScore no banco de dados com snapshots dos FieldScores e ExperienceScore
    await ClientScore.createScore(clientId, clientScore, fieldScoreSnapshot, experienceScore.toJSON());

    return clientScore;
  }
}
export default ClientScoreService