CREATE TABLE "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"duration_seconds" integer NOT NULL,
	"line_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"line_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_source_id_stations_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_target_id_stations_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_line_id_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."lines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stations" ADD CONSTRAINT "stations_line_id_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."lines"("id") ON DELETE no action ON UPDATE no action;