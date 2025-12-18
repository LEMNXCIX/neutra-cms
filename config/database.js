module.exports = ({ env }) => ({
    connection: {
        client: env('DATABASE_CLIENT', 'postgres'),
        connection: {
            host: env('DATABASE_HOST', 'neutra-cms-db'),
            port: env.int('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'strapi'),
            password: env('DATABASE_PASSWORD', 'strapi'),
            schema: env('DATABASE_SCHEMA', 'public'), // Not required, but good practice
            ssl: env.bool('DATABASE_SSL', false),
        },
        useNullAsDefault: true,
    },
});
