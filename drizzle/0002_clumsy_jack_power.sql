CREATE TABLE "station_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_id" integer NOT NULL,
	"line_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connections" RENAME COLUMN "source_id" TO "station_a_id";--> statement-breakpoint
ALTER TABLE "connections" RENAME COLUMN "target_id" TO "station_b_id";--> statement-breakpoint
ALTER TABLE "connections" RENAME COLUMN "distance_between" TO "distance_km";--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_source_id_stations_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_target_id_stations_id_fk";
--> statement-breakpoint
ALTER TABLE "stations" DROP CONSTRAINT "stations_line_id_lines_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "transfer_penalty_seconds" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "station_lines" ADD CONSTRAINT "station_lines_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_lines" ADD CONSTRAINT "station_lines_line_id_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_station_a_id_stations_id_fk" FOREIGN KEY ("station_a_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_station_b_id_stations_id_fk" FOREIGN KEY ("station_b_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" DROP COLUMN "line_id";