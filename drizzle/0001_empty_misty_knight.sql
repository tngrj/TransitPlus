CREATE TABLE "distance_bands" (
	"id" serial PRIMARY KEY NOT NULL,
	"min_km" numeric(3, 1) NOT NULL,
	"max_km" numeric(3, 1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fares" (
	"id" serial PRIMARY KEY NOT NULL,
	"distance_band_id" integer NOT NULL,
	"passenger_type" text NOT NULL,
	"time_type" text NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connections" ADD COLUMN "distance_between" numeric(2, 1) NOT NULL;--> statement-breakpoint
ALTER TABLE "fares" ADD CONSTRAINT "fares_distance_band_id_distance_bands_id_fk" FOREIGN KEY ("distance_band_id") REFERENCES "public"."distance_bands"("id") ON DELETE no action ON UPDATE no action;