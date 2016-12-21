import ArraySchema from './schemas/Array';
import EntitySchema from './schemas/Entity';
import ObjectSchema from './schemas/Object';
import UnionSchema from './schemas/Union';
import ValuesSchema from './schemas/Values';

const visit = (value, parent, key, schema, addEntity) => {
  if (typeof value !== 'object') {
    return value;
  }

  if (!schema.normalize || typeof schema.normalize !== 'function' && typeof schema === 'object') {
    if (Array.isArray(schema)) {
      schema = new ArraySchema(schema);
    } else {
      schema = new ObjectSchema(schema);
    }
  }

  return schema.normalize(value, parent, key, visit, addEntity);
};

const addEntities = (entities) => (schema, value, parent, key) => {
  const schemaKey = schema.key;
  const id = schema.getId(value, parent, key);
  if (!(schemaKey in entities)) {
    entities[schemaKey] = {};
  }

  const existingEntity = entities[schemaKey][id];
  if (existingEntity) {
    entities[schemaKey][id] = schema.merge(existingEntity, value);
  } else {
    entities[schemaKey][id] = value;
  }
};

export const schema = {
  Array: ArraySchema,
  Entity: EntitySchema,
  Object: ObjectSchema,
  Union: UnionSchema,
  Values: ValuesSchema
};

export const normalize = (input, schema) => {
  if (!input || typeof input !== 'object') {
    throw new Error(`Unexpected input given to normalize. Expected type to be "object", found "${typeof input}".`);
  }

  const entities = {};
  const addEntity = addEntities(entities);

  const result = visit(input, input, null, schema, addEntity);
  return { entities, result };
};