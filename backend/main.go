package main

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from the Go backend!")
}

func getODinfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	callsign := r.URL.Query().Get("callsign")
	if callsign == "" {
		http.Error(w, "Missing required parameter: callsign", http.StatusBadRequest)
		return
	}

	// Build the external API URL
	url := fmt.Sprintf("https://api.adsbdb.com/v0/callsign/%s", callsign)

	// Make the request
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)

}
func handleClosestAircraft(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Extract lat, lon, distance from query parameters
	lat := r.URL.Query().Get("lat")
	lon := r.URL.Query().Get("lon")
	distance := r.URL.Query().Get("distance")

	if lat == "" || lon == "" || distance == "" {
		http.Error(w, "Missing required parameters: lat, lon, distance", http.StatusBadRequest)
		return
	}

	// Validate parameters are numbers
	if _, err := strconv.ParseFloat(lat, 64); err != nil {
		http.Error(w, "Invalid latitude", http.StatusBadRequest)
		return
	}
	if _, err := strconv.ParseFloat(lon, 64); err != nil {
		http.Error(w, "Invalid longitude", http.StatusBadRequest)
		return
	}
	if _, err := strconv.Atoi(distance); err != nil {
		http.Error(w, "Invalid distance", http.StatusBadRequest)
		return
	}

	// Build the external API URL
	url := fmt.Sprintf("https://api.adsb.lol/v2/closest/%s/%s/%s", lat, lon, distance)

	// Make the request
	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, "Failed to fetch data", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Return the response as JSON
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}
func main() {
	http.HandleFunc("/hello", helloHandler)
	http.HandleFunc("/api/closest", handleClosestAircraft)
	http.HandleFunc("/api/odinfo", getODinfo)
	fmt.Println("Server starting on port 8080...")
	http.ListenAndServe(":8080", nil)
}
