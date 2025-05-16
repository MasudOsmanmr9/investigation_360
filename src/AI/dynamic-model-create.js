function getDynamicModel(collectionName, schemaHint) {
    const schemaDef = {};
    for (const [key, type] of Object.entries(schemaHint)) {
        if (type === 'string') schemaDef[key] = String;
        else if (type === 'number') schemaDef[key] = Number;
        else if (type === 'boolean') schemaDef[key] = Boolean;
        else if (type === 'ISODate') schemaDef[key] = Date;
        else if (Array.isArray(type)) schemaDef[key] = [String];
        else schemaDef[key] = mongoose.Schema.Types.Mixed;
    }
    const schema = new mongoose.Schema(schemaDef, { strict: false });
    return mongoose.models[collectionName] || mongoose.model(collectionName, schema, collectionName);
}