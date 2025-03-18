ALTER TABLE "connections" RENAME COLUMN "station_a_id" TO "from_station_id";--> statement-breakpoint
ALTER TABLE "connections" RENAME COLUMN "station_b_id" TO "to_station_id";--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_station_a_id_stations_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" DROP CONSTRAINT "connections_station_b_id_stations_id_fk";
--> statement-breakpoint
ALTER TABLE "connections" ALTER COLUMN "distance_km" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "from_line_id" integer;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "to_line_id" integer;--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "is_transfer" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "lines" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "station_lines" ADD COLUMN "station_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "station_lines" ADD COLUMN "position_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_from_station_id_stations_id_fk" FOREIGN KEY ("from_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_to_station_id_stations_id_fk" FOREIGN KEY ("to_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_from_line_id_lines_id_fk" FOREIGN KEY ("from_line_id") REFERENCES "public"."lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_to_line_id_lines_id_fk" FOREIGN KEY ("to_line_id") REFERENCES "public"."lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" DROP COLUMN "transfer_penalty_seconds";--> statement-breakpoint
ALTER TABLE "lines" ADD CONSTRAINT "lines_code_unique" UNIQUE("code");