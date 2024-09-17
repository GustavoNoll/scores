import { ModelStatic, Sequelize, UniqueConstraintError } from "sequelize";
import ClientScore from "../database/models/clientScore";
import Client from "../database/models/client";
import ExperienceScore from "../database/models/experienceScore";
import FieldScore from "../database/models/fieldScore";

class ClientScoreService {
  async generateClientScore(clientId: number, fieldScores: FieldScore[]): Promise<boolean> {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Pegar o ExperienceScore associado ao cliente
    const experienceScore = await ExperienceScore.getByClient(client);
    if (!experienceScore) {
      throw new Error('ExperienceScore not found for client');
    }

    // Inicializar as variáveis para o cálculo do clientScore
    let totalScore = 0;
    let totalWeight = 0;

    // JSON para armazenar os snapshots dos FieldScores
    const fieldScoreSnapshot: { [key: string]: number } = {};

    // Para cada FieldScore, bater com o ExperienceScore e gerar uma pontuação final
    fieldScores.forEach((fieldScore) => {
      // Obter o valor correspondente no ExperienceScore
      const expScoreValue = experienceScore[fieldScore.field as keyof ExperienceScore];

      if (expScoreValue !== undefined) {
        // Calcular a pontuação com base na diferença ou outro critério (ajustável)
        const scoreDiff = Math.abs(fieldScore.value - expScoreValue);

        // Somar ao total, com peso se necessário
        totalScore += scoreDiff;
        totalWeight += 1; // Ou use pesos diferentes para cada campo, se aplicável

        // Salvar o FieldScore no snapshot
        fieldScoreSnapshot[fieldScore.field] = fieldScore.value;
      }
    });

    // Calcular a pontuação geral (clientScore)
    const clientScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Salvar o clientScore no banco de dados com snapshots dos FieldScores e ExperienceScore
    await ClientScore.createScore(clientId, clientScore, fieldScoreSnapshot, experienceScore.toJSON());

    return true;
  }
}
export default ClientScoreService