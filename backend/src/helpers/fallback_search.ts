import Client from "../database/models/client";

async function findWithFallback<T>(model: { findOne: Function }, field: string, client: Client): Promise<T | null> {
  const whereClause: any = {
    oltId: client.oltId,
    ctoId: client.ctoId
  };

  // Only add `field` to whereClause if it's not null or empty
  if (field) {
    whereClause.field = field;
  }

  // Step 1: Try to find by both oltId and ctoId
  let result = await model.findOne({ where: whereClause });

  // Step 2: If not found, try with only ctoId
  if (!result) {
    const fallbackWhereClause = { ...whereClause };
    delete fallbackWhereClause.oltId; // Remove oltId for fallback search
    result = await model.findOne({ where: fallbackWhereClause });
  }

  // Step 3: If not found, try with only oltId
  if (!result) {
    const fallbackWhereClause = { ...whereClause };
    delete fallbackWhereClause.ctoId; // Remove ctoId for fallback search
    result = await model.findOne({ where: fallbackWhereClause });
  }

  // Step 4: If not found, try with both oltId and ctoId as null
  if (!result) {
    const fallbackWhereClause = { ...whereClause };
    fallbackWhereClause.oltId = null
    fallbackWhereClause.ctoId = null
    result = await model.findOne({ where: fallbackWhereClause });
  }

  return result;
}

export { findWithFallback}