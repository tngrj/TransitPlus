import { pgTable, serial, text, integer, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const lines = pgTable('lines', {
	id: serial('id').primaryKey(),
	code: text('code').notNull().unique(),
	name: text('name').notNull()
});

export const stations = pgTable('stations', {
	id: serial('id').primaryKey(),
	name: text('name').notNull()
});

export const stationLines = pgTable('station_lines', {
	id: serial('id').primaryKey(),
	station_id: integer('station_id')
		.notNull()
		.references(() => stations.id),
	line_id: integer('line_id')
		.notNull()
		.references(() => lines.id),
	station_code: text('station_code').notNull(), // E.g. NS9
	position_number: integer('position_number').notNull() // E.g. 9
});

export const connections = pgTable('connections', {
	id: serial('id').primaryKey(),
	// For direct connections between stations on the same line:
	from_station_id: integer('from_station_id')
		.notNull()
		.references(() => stations.id),
	to_station_id: integer('to_station_id')
		.notNull()
		.references(() => stations.id),
	line_id: integer('line_id').references(() => lines.id),

	// For transfers at interchange stations:
	from_line_id: integer('from_line_id').references(() => lines.id),
	to_line_id: integer('to_line_id').references(() => lines.id),

	duration_seconds: integer('duration_seconds').notNull(),
	distance_km: decimal('distance_km', { precision: 3, scale: 1 }),
	is_transfer: boolean('is_transfer').default(false).notNull()
});

export const distanceBands = pgTable('distance_bands', {
	id: serial('id').primaryKey(),
	minKm: decimal('min_km', { precision: 3, scale: 1 }).notNull(),
	maxKm: decimal('max_km', { precision: 3, scale: 1 }).notNull()
});

export const fares = pgTable('fares', {
	id: serial('id').primaryKey(),
	distanceBandId: integer('distance_band_id')
		.references(() => distanceBands.id)
		.notNull(),
	passengerType: text('passenger_type').notNull(),
	timeType: text('time_type').notNull(),
	price: integer('price').notNull() // in cents
});

export const distanceBandsRelations = relations(distanceBands, ({ many }) => ({
	fares: many(fares)
}));

export const faresRelations = relations(fares, ({ one }) => ({
	distanceBand: one(distanceBands, {
		fields: [fares.distanceBandId],
		references: [distanceBands.id]
	})
}));
