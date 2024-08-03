import { Sequelize } from "sequelize";
import * as config from "../../database/config/database";


const sequelize = new Sequelize(config);

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

import FieldScoreRule from '../../database/models/fieldScoreRule';
import Client from '../../database/models/client';  // Substitua pelo caminho correto
import Olt from '../../database/models/olt';  // Substitua pelo caminho correto
import Cto from '../../database/models/cto';  // Substitua pelo caminho correto

describe('FieldScoreRule Model', () => {
  let sequelize: Sequelize;
  let client: Client;
  let olt: Olt;
  let cto: Cto;

  beforeAll(async () => {
    cto = await Cto.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });
    olt = await Olt.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });

    // Crie um cliente para usar nos testes
    client = await Client.create({
      oltId: olt.id,
      ctoId: cto.id,
      latitude: 0,
      longitude: 0,
      integrationId: 'teste'
    });
  });

  afterAll(async () => {
    // Limpeza do banco de dados
    await client.destroy();
    await FieldScoreRule.destroy({ where: {} });
    await cto.destroy();
    await olt.destroy()
  });

  it('should return null when FieldScoreRule is not found', async () => {
    const result = await FieldScoreRule.getFieldScoreRuleForDevice(
      { clientId: client.id } as any,
      'nonExistingField'
    );
    expect(result).toBeNull();
  });

  it('should return the correct FieldScoreRule', async () => {
    const fieldScoreRule = await FieldScoreRule.create({
      field: 'uptime',
      goodThreshold: 90,
      criticalThreshold: 80,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: cto.id
    });

    const result = await FieldScoreRule.getFieldScoreRuleForDevice(
      { clientId: client.id } as any,
      'uptime'
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe(fieldScoreRule.id);
    expect(result?.field).toBe('uptime');
    expect(result?.goodThreshold).toBe(90);
    expect(result?.criticalThreshold).toBe(80);
  });

  it('should return null when client is not found', async () => {
    const result = await FieldScoreRule.getFieldScoreRuleForDevice(
      { clientId: 999 } as any, // ID que não existe
      'uptime'
    );
    expect(result).toBeNull();
  });
});
