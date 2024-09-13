import { Sequelize } from "sequelize";
import ExperienceScore from '../../database/models/experienceScore';
import Client from '../../database/models/client';  // Substitua pelo caminho correto
import Olt from '../../database/models/olt';  // Substitua pelo caminho correto
import Cto from '../../database/models/cto';  // Substitua pelo caminho correto

describe('ExperienceScore Model', () => {
  let sequelize: Sequelize;
  let client: Client;
  let olt: Olt;
  let cto: Cto;

  beforeAll(async () => {
    cto = await Cto.create({ integrationId: "2", description: "aa", latitude: 5, longitude: 5 });
    olt = await Olt.create({ integrationId: "2", description: "aa", latitude: 5, longitude: 5 });
    // Crie um cliente para usar nos testes
    client = await Client.create({
      oltId: olt.id,
      ctoId: cto.id,
      latitude: 0,
      longitude: 0,
      integrationId: 'teste2'
    });
  });

  afterAll(async () => {
    // Limpeza do banco de dados
    await client.destroy();
    //await ExperienceScore.destroy({ where: {} });
    await cto.destroy();
    await olt.destroy()
  });

  it('should return null when ExperienceScore is not found', async () => {
    const result = await ExperienceScore.getByClient(
      null as any
    );
    expect(result).toBeNull();
  });
  it('should return the correct ExperienceScore', async () => {
    const experienceScoreGeneral = await ExperienceScore.create({
      uptime: 0.1,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.1,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: null,
      ctoId: null
    });
    const result = await ExperienceScore.getByClient(
      { oltId: client.oltId, ctoId: client.ctoId} as any
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe(experienceScoreGeneral.id);
    const experienceScoreOlt = await ExperienceScore.create({
      uptime: 0.1,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.1,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: null
    });

    const result2 = await ExperienceScore.getByClient(
      { oltId: client.oltId, ctoId: client.ctoId} as any
    );
    expect(result2).not.toBeNull();
    expect(result2?.id).toBe(experienceScoreOlt.id);

    const experienceScore = await ExperienceScore.create({
      uptime: 0.1,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.1,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: cto.id
    });
    const result3 = await ExperienceScore.getByClient(
      { oltId: client.oltId, ctoId: client.ctoId} as any
    );
    expect(result3).not.toBeNull();
    expect(result3?.id).toBe(experienceScore.id);
  });
});
