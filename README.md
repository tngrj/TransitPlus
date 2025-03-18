# Goals

- Better trip planning (Adding walking time when transfering lines and mrt arrival timing)
- Integrate fare calculation for student/adult/senior/concession scheme/disabilities/monthly pass
- Cross-Device usability

# Data to integrate

- [MRT Station Distances](https://sgwiki.com/wiki/List_of_Distance_between_Stations)
- [Fare Data](https://www.ptc.gov.sg/fare-regulation/bus-rail/fare-structure)
- [Fare Data PDF](https://www.ptc.gov.sg/docs/default-source/fare-structure/fre-2024---fare-table-brochure.pdf)
- [Transfer Timing](https://www.reddit.com/r/singapore/comments/10wkygf/mrt_map_with_transfer_timing/)
- [Train Arrival](https://github.com/elliotwutingfeng/train_arrival)
- [Train Travel Time](https://www.sbstransit.com.sg/travel-time)
- LTA API for Crowd density
- [Not trustable source](https://blog.satorusaka.com/mrt-line-diagrams/)
- Integrate best door to be at when trasferring

# Stack

- Lucide Icons
- Flowbite Component Library

# Process

1. User inputs start and end station
2. Dijkstra or A\* algorithm to find shortest path factoring in penalty when theres an interchange to walk over and change lines and train freq
3. Outputs suggested route(s) with estimated travel time
   Fare breakdown for each category (student/adult/elderly/etc)
   Alert for potential delay (?) or alternative routes
4. Features clean UI - big icons to show transfers and walking with minutes breakdown

# Limitations

- Static Fare and Train Stations (requires manual updates when fare increases and new lines are added)

# Solution

- Scraper to scrap wiki for new stations using last updated for version history
- Create schema to support

- [ ] Figure out the schema in json for the different stations, distance
- [x] Save a copy of 27Dec2024 Fare
- [ ] Figure out where to keep this scapper for the arrival timings of the train
- [ ] Session storage for most common route (e.g. to work)
- [ ] I want to make this a PWA (NOT IMPT) - [vite PWA](https://vite-pwa-org.netlify.app/frameworks/sveltekit#sveltekit-and-adapters)

2. Route Calculation
   Use graph traversal algorithms like Dijkstra's Algorithm or A\* Algorithm to find the shortest path:

Dijkstra's Algorithm: Finds the shortest path based on edge weights (e.g., distance, time).
A\*: Adds heuristics for faster computation, especially useful if your system has transfer costs (e.g., changing lines).
Implementation

Stations as Nodes: Store all stations in the stations table.
Connections as Edges: Define bidirectional connections between stations in the connections table.
Use a library like NetworkX (Python) to compute optimal routes dynamically, or perform graph traversal in SQL (PostgreSQL can handle this natively)

3. Optimal Route Considerations
   When calculating routes, you need to consider:

Distance: Use the distance_km column for weight.
Transfer Time: Add transfer_time_min as a penalty for inter-line transfers.
Real-Time Train Timings:
Incorporate train arrival times into the calculation if available.
Delay trips to synchronize with real-world conditions.

5. Workflow for Optimal Route
   Build the Graph:
   Populate the stations and connections tables.
   Include distances and transfer times.
   Query for Adjacent Nodes:
   When the user selects a starting point, fetch connected stations and their distances.
   Run the Algorithm:
   Use a Python backend (with NetworkX) or SQL (pgRouting) to calculate the shortest path.
   Output:
   Return the path, total time, and fare to the user.

Example Workflow in Practice
User Input: Start station: Paya Lebar, End station: HarbourFront.
Backend Query:
Fetch all connections from Paya Lebar.
Traverse the graph using an algorithm.
Real-Time Adjustments:
Incorporate train timings to adjust path if needed.
Response:
"Route: Paya Lebar (EW) → Outram Park (NE) → HarbourFront. Total Time: 30 mins. Fare: $0.92."
